import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { Earcut } from 'three/src/extras/Earcut.js';
import { feature, mesh } from 'topojson-client';

import {
  PROJ_LON_SCALE,
  PROJ_LAT_SCALE,
  PROJ_ANTIMERIDIAN_X,
  COLOR_LAND,
  LAND_OPACITY,
  COLOR_BORDERS,
  BORDER_OPACITY,
  COLOR_HIGHLIGHT_ROUTE,
  COLOR_HIGHLIGHT_ROUTE_GLOW,
  HIGHLIGHT_ROUTE_OPACITY,
  HIGHLIGHT_ANIM_SPEED,
  HIGHLIGHT_TRAIL_LENGTH,
  COLOR_CITY_DOT,
  COLOR_CITY_STROKE,
  CITY_DOT_FILL_R,
  CITY_DOT_STROKE_R,
  CITY_DOT_SEGMENTS,
  ROUTE_SEGMENTS,
  ARC_GC_MAX_LIFT_RATIO,
} from './world-route-config';

export interface AirportCoords {
  lat: number | null;
  lon: number | null;
  name?: string;
}

// ── Порядок слоёв ─────────────────────────────────────────────────────────────
const RENDER_ORDER_LAND = 1;
const RENDER_ORDER_BORDERS = 2;
const RENDER_ORDER_HIGHLIGHT = 4;
const RENDER_ORDER_CITY_DOT = 5;

// ── Проекция Миллера ──────────────────────────────────────────────────────────
export function latLonToFlat(lat: number, lon: number): [number, number] {
  const latRad = lat * (Math.PI / 180);
  const millerY = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * latRad));
  return [lon * PROJ_LON_SCALE, millerY * PROJ_LAT_SCALE];
}

// ── Меш суши ─────────────────────────────────────────────────────────────────
function openRingFlat(ring: [number, number][]): [number, number][] {
  const n = ring.length;
  if (n > 1) {
    const f = ring[0]!,
      l = ring[n - 1]!;
    if (f[0] === l[0] && f[1] === l[1]) return ring.slice(0, n - 1);
  }
  return ring;
}

function unwrapRingLons(ring: [number, number][]): [number, number][] {
  if (!ring.length) return ring;
  const out: [number, number][] = [ring[0]!];
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i]![0];
    const prev = out[i - 1]![0];
    while (lon - prev > 180) lon -= 360;
    while (prev - lon > 180) lon += 360;
    out.push([lon, ring[i]![1]]);
  }
  return out;
}

function appendFlatPolygon(rings: [number, number][][], positions: number[]): void {
  if (!rings[0]?.length) return;
  const outer = unwrapRingLons(openRingFlat(rings[0]));
  if (outer.length < 3) return;
  const flatCoords: number[] = [];
  const holeIdxs: number[] = [];
  for (const [lon, lat] of outer) {
    const [x, y] = latLonToFlat(lat, lon);
    flatCoords.push(x, y);
  }
  for (let h = 1; h < rings.length; h++) {
    const hole = unwrapRingLons(openRingFlat(rings[h]!));
    if (hole.length < 3) continue;
    holeIdxs.push(flatCoords.length / 2);
    for (const [lon, lat] of hole) {
      const [x, y] = latLonToFlat(lat, lon);
      flatCoords.push(x, y);
    }
  }
  const triIdx = Earcut.triangulate(
    flatCoords,
    holeIdxs.length ? holeIdxs : undefined,
    2,
  );
  if (!triIdx.length) return;
  for (let t = 0; t < triIdx.length; t += 3) {
    const i0 = triIdx[t]! * 2,
      i1 = triIdx[t + 1]! * 2,
      i2 = triIdx[t + 2]! * 2;
    positions.push(
      flatCoords[i0]!,
      flatCoords[i0 + 1]!,
      0,
      flatCoords[i1]!,
      flatCoords[i1 + 1]!,
      0,
      flatCoords[i2]!,
      flatCoords[i2 + 1]!,
      0,
    );
  }
}

export function buildFlatLandMesh(landTopo: any): THREE.Mesh | null {
  const objKey = landTopo.objects.land ? 'land' : 'countries';
  const geoJson = feature(landTopo, landTopo.objects[objKey]) as any;
  const positions: number[] = [];
  const processGeom = (geom: any) => {
    if (!geom) return;
    if (geom.type === 'Polygon') appendFlatPolygon(geom.coordinates, positions);
    else if (geom.type === 'MultiPolygon')
      for (const poly of geom.coordinates) appendFlatPolygon(poly, positions);
  };
  if (geoJson.type === 'Feature') processGeom(geoJson.geometry);
  else if (geoJson.type === 'FeatureCollection')
    for (const f of geoJson.features) processGeom(f.geometry);
  if (!positions.length) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.MeshBasicMaterial({
    color: COLOR_LAND,
    opacity: LAND_OPACITY,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = RENDER_ORDER_LAND;
  return m;
}

// ── Линии границ ──────────────────────────────────────────────────────────────
export function buildFlatBorderLines(countriesTopo: any): THREE.LineSegments {
  const borders = mesh(countriesTopo, countriesTopo.objects.countries) as any;
  const positions: number[] = [];
  for (const line of borders.coordinates) {
    const unwrapped = unwrapRingLons(line as [number, number][]);
    for (let i = 0; i < unwrapped.length - 1; i++) {
      const [ax, ay] = latLonToFlat(unwrapped[i]![1], unwrapped[i]![0]);
      const [bx, by] = latLonToFlat(unwrapped[i + 1]![1], unwrapped[i + 1]![0]);
      if (Math.abs(bx - ax) > PROJ_ANTIMERIDIAN_X) continue;
      positions.push(ax, ay, 0, bx, by, 0);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({
    color: COLOR_BORDERS,
    opacity: BORDER_OPACITY,
    transparent: true,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = RENDER_ORDER_BORDERS;
  return lines;
}

// ── Анимированная линия маршрута ──────────────────────────────────────────────
export function unwrapLon(lon1: number, lon2: number): number {
  let delta = lon2 - lon1;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return lon1 + delta;
}

function routeControlPoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number] {
  const R = Math.PI / 180;
  const cx1 = Math.cos(lat1 * R) * Math.cos(lon1 * R),
    cy1 = Math.cos(lat1 * R) * Math.sin(lon1 * R),
    cz1 = Math.sin(lat1 * R);
  const cx2 = Math.cos(lat2 * R) * Math.cos(lon2 * R),
    cy2 = Math.cos(lat2 * R) * Math.sin(lon2 * R),
    cz2 = Math.sin(lat2 * R);
  let smx = (cx1 + cx2) / 2,
    smy = (cy1 + cy2) / 2,
    smz = (cz1 + cz2) / 2;
  const slen = Math.sqrt(smx * smx + smy * smy + smz * smz);
  let gcx: number, gcy: number;
  if (slen < 1e-6) {
    gcx = (x1 + x2) / 2;
    gcy = (y1 + y2) / 2;
  } else {
    smx /= slen;
    smy /= slen;
    smz /= slen;
    const midLat = Math.asin(Math.max(-1, Math.min(1, smz))) / R;
    let midLon = Math.atan2(smy, smx) / R;
    let d = midLon - lon1;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    midLon = lon1 + d;
    const [pxRaw, pyRaw] = latLonToFlat(midLat, midLon);
    const cmx = (x1 + x2) / 2,
      cmy = (y1 + y2) / 2;
    let devx = pxRaw - cmx,
      devy = pyRaw - cmy;
    const devLen = Math.sqrt(devx * devx + devy * devy);
    if (devLen > 1e-9) {
      const chordLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const maxDev = chordLen * ARC_GC_MAX_LIFT_RATIO;
      if (devLen > maxDev) {
        const s = maxDev / devLen;
        devx *= s;
        devy *= s;
      }
    }
    gcx = 2 * (cmx + devx) - 0.5 * (x1 + x2);
    gcy = 2 * (cmy + devy) - 0.5 * (y1 + y2);
  }
  return [gcx, gcy];
}

/** Мировые координаты середины дуги Безье при t=0.5 для одного сегмента маршрута. */
export function computeArcMidpointWorld(
  dep: AirportCoords,
  arr: AirportCoords,
): [number, number] | null {
  if (dep.lat == null || dep.lon == null || arr.lat == null || arr.lon == null)
    return null;
  const [x1, y1] = latLonToFlat(dep.lat, dep.lon);
  const lon2u = unwrapLon(dep.lon, arr.lon);
  const crossesAntimeridian = lon2u < -180 || lon2u > 180;
  const lon2 = crossesAntimeridian ? arr.lon : lon2u;
  const [x2, y2] = latLonToFlat(arr.lat, lon2);
  const [cx, cy] = routeControlPoint(dep.lat, dep.lon, arr.lat, arr.lon, x1, y1, x2, y2);
  // B(0.5) = 0.25*P1 + 0.5*CP + 0.25*P2
  return [0.25 * x1 + 0.5 * cx + 0.25 * x2, 0.25 * y1 + 0.5 * cy + 0.25 * y2];
}

function pushWrappedHighlightSeg(
  segPos: number[],
  linePos: number[],
  progress: number[],
  ax: number,
  ay: number,
  pA: number,
  bx: number,
  by: number,
  pB: number,
): void {
  const EAST = PROJ_ANTIMERIDIAN_X;
  let wx1 = ax;
  while (wx1 > EAST) wx1 -= 2 * EAST;
  while (wx1 < -EAST) wx1 += 2 * EAST;
  const wx2 = wx1 + (bx - ax);

  const push = (
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    p0: number,
    p1: number,
  ) => {
    segPos.push(sx, sy, 0, ex, ey, 0);
    linePos.push(sx, sy, 0, ex, ey, 0);
    progress.push(p0, p1);
  };

  if (wx2 >= -EAST && wx2 <= EAST) {
    push(wx1, ay, wx2, by, pA, pB);
    return;
  }
  if (wx2 > EAST) {
    const t = (EAST - wx1) / (wx2 - wx1),
      iy = ay + t * (by - ay),
      pMid = pA + t * (pB - pA);
    push(wx1, ay, EAST, iy, pA, pMid);
    push(-EAST, iy, wx2 - 2 * EAST, by, pMid, pB);
  } else {
    const t = (-EAST - wx1) / (wx2 - wx1),
      iy = ay + t * (by - ay),
      pMid = pA + t * (pB - pA);
    push(wx1, ay, -EAST, iy, pA, pMid);
    push(EAST, iy, wx2 + 2 * EAST, by, pMid, pB);
  }
}

const HIGHLIGHT_VERT = /* glsl */ `
  attribute float aProgress;
  varying float vProgress;
  void main() {
    vProgress = aProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const HIGHLIGHT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform float uTrailLen;
  varying float vProgress;
  void main() {
    float phase  = fract(uTime * uSpeed);
    float behind = fract(phase - vProgress);
    float glow   = smoothstep(uTrailLen, 0.0, behind);
    vec3  col    = mix(uBaseColor, uGlowColor, glow);
    float alpha  = mix(uOpacity * 0.55, uOpacity, glow);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function buildFlatHighlightLine(
  dep: AirportCoords,
  arr: AirportCoords,
): THREE.Group | null {
  if (!dep.lat || !dep.lon || !arr.lat || !arr.lon) return null;

  const [x1, y1] = latLonToFlat(dep.lat, dep.lon);
  const lon2Unwrapped = unwrapLon(dep.lon, arr.lon);
  const crossesAntimeridian = lon2Unwrapped < -180 || lon2Unwrapped > 180;
  const lon2 = crossesAntimeridian ? arr.lon : lon2Unwrapped;
  const [x2, y2] = latLonToFlat(arr.lat, lon2);
  const [cx, cy] = routeControlPoint(dep.lat, dep.lon, arr.lat, arr.lon, x1, y1, x2, y2);

  const segPos: number[] = [];
  const linePos: number[] = [];
  const progress: number[] = [];

  for (let i = 0; i < ROUTE_SEGMENTS; i++) {
    const t0 = i / ROUTE_SEGMENTS,
      t1 = (i + 1) / ROUTE_SEGMENTS;
    const bx0 = (1 - t0) ** 2 * x1 + 2 * t0 * (1 - t0) * cx + t0 ** 2 * x2;
    const by0 = (1 - t0) ** 2 * y1 + 2 * t0 * (1 - t0) * cy + t0 ** 2 * y2;
    const bx1 = (1 - t1) ** 2 * x1 + 2 * t1 * (1 - t1) * cx + t1 ** 2 * x2;
    const by1 = (1 - t1) ** 2 * y1 + 2 * t1 * (1 - t1) * cy + t1 ** 2 * y2;

    if (crossesAntimeridian) {
      segPos.push(bx0, by0, 0, bx1, by1, 0);
      linePos.push(bx0, by0, 0, bx1, by1, 0);
      progress.push(t0, t1);
    } else {
      pushWrappedHighlightSeg(segPos, linePos, progress, bx0, by0, t0, bx1, by1, t1);
    }
  }

  const group = new THREE.Group();

  // Слой 1: толстая основа
  const thickGeo = new LineSegmentsGeometry();
  thickGeo.setPositions(segPos);
  const thickMat = new LineMaterial({
    color: COLOR_HIGHLIGHT_ROUTE,
    linewidth: 1.5,
    opacity: HIGHLIGHT_ROUTE_OPACITY * 0.8,
    transparent: true,
    depthWrite: false,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });
  const thickLines = new LineSegments2(thickGeo, thickMat);
  thickLines.renderOrder = RENDER_ORDER_HIGHLIGHT;
  group.add(thickLines);

  // Слой 2: анимированное свечение
  const animGeo = new THREE.BufferGeometry();
  animGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  animGeo.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1));
  const animMat = new THREE.ShaderMaterial({
    vertexShader: HIGHLIGHT_VERT,
    fragmentShader: HIGHLIGHT_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(COLOR_HIGHLIGHT_ROUTE) },
      uGlowColor: { value: new THREE.Color(COLOR_HIGHLIGHT_ROUTE_GLOW) },
      uOpacity: { value: HIGHLIGHT_ROUTE_OPACITY },
      uSpeed: { value: HIGHLIGHT_ANIM_SPEED },
      uTrailLen: { value: HIGHLIGHT_TRAIL_LENGTH },
    },
    transparent: true,
    depthWrite: false,
  });
  const animLines = new THREE.LineSegments(animGeo, animMat);
  animLines.renderOrder = RENDER_ORDER_HIGHLIGHT;
  group.add(animLines);

  return group;
}

// ── Точки городов ─────────────────────────────────────────────────────────────
const _strokeGeo = new THREE.CircleGeometry(CITY_DOT_STROKE_R, CITY_DOT_SEGMENTS);
const _fillGeo = new THREE.CircleGeometry(CITY_DOT_FILL_R, CITY_DOT_SEGMENTS);
const _dummy = new THREE.Object3D();

function addDotScaleUniform(mat: THREE.MeshBasicMaterial, scale = 1.0): void {
  mat.onBeforeCompile = shader => {
    shader.uniforms.uScale = { value: scale };
    shader.vertexShader = `uniform float uScale;\n${shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed.xy *= uScale;',
    )}`;
    mat.userData.shader = shader;
  };
}

export function buildFlatCityDots(
  airports: AirportCoords[],
  initialScale = 1.0,
): THREE.Group {
  const valid = airports.filter(a => a.lat != null && a.lon != null);
  const strokeMat = new THREE.MeshBasicMaterial({
    color: COLOR_CITY_STROKE,
    transparent: true,
    depthWrite: false,
  });
  addDotScaleUniform(strokeMat, initialScale);
  const strokeMesh = new THREE.InstancedMesh(_strokeGeo, strokeMat, valid.length);
  strokeMesh.renderOrder = RENDER_ORDER_CITY_DOT;

  const fillMat = new THREE.MeshBasicMaterial({
    color: COLOR_CITY_DOT,
    transparent: true,
    depthWrite: false,
  });
  addDotScaleUniform(fillMat, initialScale);
  const fillMesh = new THREE.InstancedMesh(_fillGeo, fillMat, valid.length);
  fillMesh.renderOrder = RENDER_ORDER_CITY_DOT + 1;

  for (let i = 0; i < valid.length; i++) {
    const [x, y] = latLonToFlat(valid[i]!.lat!, valid[i]!.lon!);
    _dummy.position.set(x, y, 0.005);
    _dummy.updateMatrix();
    strokeMesh.setMatrixAt(i, _dummy.matrix);
    _dummy.position.set(x, y, 0.01);
    _dummy.updateMatrix();
    fillMesh.setMatrixAt(i, _dummy.matrix);
  }
  strokeMesh.instanceMatrix.needsUpdate = true;
  fillMesh.instanceMatrix.needsUpdate = true;

  const group = new THREE.Group();
  group.add(strokeMesh, fillMesh);
  return group;
}

// ── Dispose ───────────────────────────────────────────────────────────────────
export function disposeObject(obj: THREE.Object3D | null): void {
  if (!obj) return;
  const o = obj as any;
  o.geometry?.dispose();
  if (Array.isArray(o.material)) o.material.forEach((m: THREE.Material) => m.dispose());
  else if (o.material) o.material.dispose();
  if (o.children) for (const child of o.children) disposeObject(child);
}
