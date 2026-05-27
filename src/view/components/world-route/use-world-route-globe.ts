import * as THREE from 'three';
import { ref } from 'vue';

import {
  buildFlatLandMesh,
  buildFlatBorderLines,
  buildFlatHighlightLine,
  buildFlatCityDots,
  disposeObject,
  latLonToFlat,
  computeArcMidpointWorld,
  type AirportCoords,
} from './world-route-scene';

import {
  RENDERER_BG_COLOR,
  CAMERA_NEAR,
  CAMERA_FAR,
  CAMERA_FLY_LERP,
  MIN_ZOOM,
  MAX_ZOOM,
  MAP_NORTH_CLIP_Y,
  MAP_SOUTH_CLIP_Y,
  MAP_WEST_X,
  MAP_EAST_X,
  FIT_PADDING_FACTOR,
  FIT_MIN_HALF_SIZE,
} from './world-route-config';

import countries110Data from './data/countries-110m.json';

// ── Типы ──────────────────────────────────────────────────────────────────────

export interface FullAirportData {
  lat: number;
  lon: number;
  iata: string;
  name: string;
}

export interface SegmentInfo {
  depIata: string;
  arrIata: string;
  airlineIata: string;
  airlineName: string;
}

export interface LabelData {
  key: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  role: 'dep' | 'arr' | 'transfer' | 'segment';
  placement: 'above' | 'below' | 'left' | 'right';
}

// ── Начальные параметры камеры ────────────────────────────────────────────────
const INIT_CENTER_Y = (MAP_NORTH_CLIP_Y + MAP_SOUTH_CLIP_Y) / 2;
const INIT_ZOOM = MIN_ZOOM;

export function useWorldRouteGlobe() {
  // Three.js ядро
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.OrthographicCamera | null = null;
  let canvasEl: HTMLCanvasElement | null = null;
  let canvasW = 800;
  let canvasH = 400;
  let resizeObserver: ResizeObserver | null = null;

  // Объекты сцены
  let landMesh: THREE.Mesh | null = null;
  let borderLines: THREE.LineSegments | null = null;
  let highlightObj: THREE.Group | null = null;
  let cityDots: THREE.Group | null = null;

  // Текущий маршрут
  let routeSegments: SegmentInfo[] = [];
  let routeAirports: Record<string, FullAirportData> = {};

  // Цель плавного перелёта
  let fitTarget: { x: number; y: number; zoom: number } | null = null;

  // Анимация
  let animId: number | null = null;
  let needsRender = false;
  let initialized = false;
  let labelsDirty = false;

  // Панорамирование
  let ptrDown = false;
  let ptrMoved = false;
  let ptrDownPos = { x: 0, y: 0 };

  // Реактивное состояние
  const currentZoom = ref<number>(INIT_ZOOM);
  const labels = ref<LabelData[]>([]);

  const scheduleRender = () => { needsRender = true; };
  const markLabelsDirty = () => { labelsDirty = true; };

  // ── Вспомогательные ──────────────────────────────────────────────────────────

  const worldPerPx = () => 2 / (canvasH * (camera?.zoom ?? 1));

  const clampCamera = () => {
    if (!camera) return;
    const aspect = canvasW / canvasH;
    const invY = 1 / camera.zoom;
    const invX = aspect / camera.zoom;
    const minY = MAP_SOUTH_CLIP_Y + invY;
    const maxY = MAP_NORTH_CLIP_Y - invY;
    if (minY <= maxY) {
      camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
    } else {
      camera.position.y = (minY + maxY) / 2;
    }
    const minX = MAP_WEST_X + invX;
    const maxX = MAP_EAST_X - invX;
    if (minX > maxX) {
      camera.position.x = (MAP_WEST_X + MAP_EAST_X) / 2;
    } else {
      camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    }
  };

  const removeDispose = (obj: THREE.Object3D | null) => {
    if (!obj || !scene) return;
    scene.remove(obj);
    disposeObject(obj);
  };

  // ── Проекция мировых координат → пиксели ─────────────────────────────────────

  const projectToScreen = (wx: number, wy: number): { x: number; y: number } => {
    if (!camera) return { x: -9999, y: -9999 };
    const vec = new THREE.Vector3(wx, wy, 0);
    vec.project(camera);
    return {
      x: (vec.x + 1) / 2 * canvasW,
      y: (1 - (vec.y + 1) / 2) * canvasH,
    };
  };

  const getAirportPlacement = (
    sx: number,
    sy: number,
    role: 'dep' | 'arr' | 'transfer',
  ): 'above' | 'below' | 'left' | 'right' => {
    if (sy < 40) return 'below';
    if (sx < 80) return 'right';
    if (sx > canvasW - 80) return 'left';
    if (role === 'transfer') return 'above';
    return role === 'dep' ? 'left' : 'right';
  };

  const updateLabels = () => {
    if (!labelsDirty) return;
    labelsDirty = false;
    if (!routeSegments.length || !camera) {
      labels.value = [];
      return;
    }

    const newLabels: LabelData[] = [];

    // Уникальные аэропорты в порядке маршрута
    const orderedIatas: string[] = [];
    for (const seg of routeSegments) {
      if (!orderedIatas.includes(seg.depIata)) orderedIatas.push(seg.depIata);
      if (!orderedIatas.includes(seg.arrIata)) orderedIatas.push(seg.arrIata);
    }

    const firstIata = orderedIatas[0];
    const lastIata = orderedIatas[orderedIatas.length - 1];

    // Лейблы аэропортов
    for (const iata of orderedIatas) {
      const ap = routeAirports[iata];
      if (!ap) continue;
      const [wx, wy] = latLonToFlat(ap.lat, ap.lon);
      const sc = projectToScreen(wx, wy);
      const role: 'dep' | 'arr' | 'transfer' =
        iata === firstIata ? 'dep' : iata === lastIata ? 'arr' : 'transfer';
      newLabels.push({
        key: `ap-${iata}`,
        text: ap.name,
        x: sc.x,
        y: sc.y,
        role,
        placement: getAirportPlacement(sc.x, sc.y, role),
      });
    }

    // Лейблы сегментов у середины каждой дуги
    for (let i = 0; i < routeSegments.length; i++) {
      const seg = routeSegments[i];
      const dep = routeAirports[seg.depIata];
      const arr = routeAirports[seg.arrIata];
      if (!dep || !arr) continue;
      const midWorld = computeArcMidpointWorld(dep, arr);
      if (!midWorld) continue;
      const midSc = projectToScreen(midWorld[0], midWorld[1]);
      if (midSc.x < 0 || midSc.x > canvasW || midSc.y < 0 || midSc.y > canvasH) continue;
      newLabels.push({
        key: `seg-${i}`,
        text: seg.airlineName,
        subtext: `${seg.depIata} → ${seg.arrIata}`,
        x: midSc.x,
        y: midSc.y,
        role: 'segment',
        placement: 'above',
      });
    }

    labels.value = newLabels;
  };

  // ── Перестройка маршрута ──────────────────────────────────────────────────────

  const rebuildRoute = (segments: SegmentInfo[], airports: Record<string, FullAirportData>) => {
    if (!initialized || !scene) return;

    removeDispose(highlightObj); highlightObj = null;
    removeDispose(cityDots); cityDots = null;

    // Дуги для каждого сегмента в одной группе
    const group = new THREE.Group();
    for (const seg of segments) {
      const dep = airports[seg.depIata];
      const arr = airports[seg.arrIata];
      if (!dep || !arr) continue;
      const segGroup = buildFlatHighlightLine(dep as AirportCoords, arr as AirportCoords);
      if (segGroup) group.add(segGroup);
    }
    highlightObj = group;
    scene.add(highlightObj);

    // Точки всех уникальных аэропортов
    const uniqueIatas = [...new Set(segments.flatMap(s => [s.depIata, s.arrIata]))];
    const uniqueAirports = uniqueIatas.map(iata => airports[iata]).filter((a): a is FullAirportData => !!a);
    cityDots = buildFlatCityDots(uniqueAirports as AirportCoords[], camera ? INIT_ZOOM / camera.zoom : 1);
    scene.add(cityDots);

    // Авто-подгонка камеры под все аэропорты
    const points = uniqueAirports
      .filter(a => a.lat != null && a.lon != null)
      .map(a => latLonToFlat(a.lat, a.lon));

    if (points.length >= 2) {
      const minX = Math.min(...points.map(p => p[0]));
      const maxX = Math.max(...points.map(p => p[0]));
      const minY = Math.min(...points.map(p => p[1]));
      const maxY = Math.max(...points.map(p => p[1]));
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const halfW = Math.max((maxX - minX) / 2 * FIT_PADDING_FACTOR, FIT_MIN_HALF_SIZE);
      const halfH = Math.max((maxY - minY) / 2 * FIT_PADDING_FACTOR, FIT_MIN_HALF_SIZE);
      const aspect = canvasW / canvasH;
      const targetZoom = Math.max(INIT_ZOOM, Math.min(MAX_ZOOM, Math.min(aspect / halfW, 1 / halfH)));
      fitTarget = { x: cx, y: cy, zoom: targetZoom };
    }

    markLabelsDirty();
    scheduleRender();
  };

  // ── Цикл анимации ─────────────────────────────────────────────────────────────

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const flying = fitTarget !== null;
    const animating = highlightObj !== null;
    if (!needsRender && !flying && !animating) return;

    if (flying && fitTarget && camera) {
      camera.position.x += (fitTarget.x - camera.position.x) * CAMERA_FLY_LERP;
      camera.position.y += (fitTarget.y - camera.position.y) * CAMERA_FLY_LERP;
      camera.zoom += (fitTarget.zoom - camera.zoom) * CAMERA_FLY_LERP;
      camera.updateProjectionMatrix();
      clampCamera();
      currentZoom.value = camera.zoom;
      markLabelsDirty();
      if (Math.abs(camera.position.x - fitTarget.x) < 0.001 &&
          Math.abs(camera.position.y - fitTarget.y) < 0.001 &&
          Math.abs(camera.zoom - fitTarget.zoom) < 0.01) {
        camera.position.x = fitTarget.x;
        camera.position.y = fitTarget.y;
        camera.zoom = fitTarget.zoom;
        camera.updateProjectionMatrix();
        currentZoom.value = camera.zoom;
        fitTarget = null;
      }
      needsRender = true;
    }

    if (!needsRender && !animating) return;
    needsRender = false;

    // Анимация свечения — обходим всех потомков с uTime
    if (highlightObj) {
      const now = performance.now() / 1000;
      highlightObj.traverse(child => {
        const mat = (child as THREE.LineSegments).material as THREE.ShaderMaterial | undefined;
        if (mat?.uniforms?.['uTime'] !== undefined) {
          mat.uniforms['uTime'].value = now;
        }
      });
    }

    // Масштабирование точек городов при зуме
    if (cityDots && camera) {
      const s = INIT_ZOOM / camera.zoom;
      for (const child of cityDots.children) {
        const shader = ((child as THREE.InstancedMesh).material as THREE.MeshBasicMaterial).userData?.shader;
        if (shader) shader.uniforms.uScale.value = s;
      }
    }

    renderer?.render(scene!, camera!);
    updateLabels();
  };

  // ── Обработчики указателя (только панорамирование) ────────────────────────────

  const onPointerDown = (e: PointerEvent) => {
    ptrDown = true;
    ptrMoved = false;
    ptrDownPos = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!ptrDown || !camera || !canvasEl) return;
    if (!ptrMoved && Math.hypot(e.clientX - ptrDownPos.x, e.clientY - ptrDownPos.y) > 4) ptrMoved = true;
    if (!ptrMoved) return;
    fitTarget = null;
    const upx = worldPerPx();
    camera.position.x -= e.movementX * upx;
    camera.position.y += e.movementY * upx;
    clampCamera();
    markLabelsDirty();
    scheduleRender();
    canvasEl.style.cursor = 'grabbing';
  };

  const onPointerUp = (e: PointerEvent) => {
    ptrDown = false;
    if (canvasEl) canvasEl.style.cursor = 'grab';
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // ── Инициализация ────────────────────────────────────────────────────────────

  const resizeCanvas = () => {
    if (!renderer || !camera || !canvasEl) return;
    const parent = canvasEl.parentElement;
    if (!parent) return;
    canvasW = parent.clientWidth || 800;
    canvasH = parent.clientHeight || 400;
    const dpr = window.devicePixelRatio || 1;
    canvasEl.style.width = canvasW + 'px';
    canvasEl.style.height = canvasH + 'px';
    renderer.setSize(canvasW, canvasH, false);
    renderer.setPixelRatio(dpr);
    const aspect = canvasW / canvasH;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    markLabelsDirty();
    scheduleRender();
  };

  const init = (el: HTMLCanvasElement) => {
    canvasEl = el;
    const parent = el.parentElement!;
    canvasW = parent.clientWidth || 800;
    canvasH = parent.clientHeight || 400;
    const dpr = window.devicePixelRatio || 1;

    renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(canvasW, canvasH, false);
    renderer.setClearColor(RENDERER_BG_COLOR, 1);
    el.style.width = canvasW + 'px';
    el.style.height = canvasH + 'px';

    scene = new THREE.Scene();
    const aspect = canvasW / canvasH;
    camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(0, INIT_CENTER_Y, 1);
    camera.zoom = INIT_ZOOM;
    camera.updateProjectionMatrix();
    currentZoom.value = INIT_ZOOM;

    initialized = true;

    // Геометрия карты (синхронно, 99KB)
    landMesh = buildFlatLandMesh(countries110Data as any);
    if (landMesh) scene.add(landMesh);
    borderLines = buildFlatBorderLines(countries110Data as any);
    if (borderLines) scene.add(borderLines);

    el.style.cursor = 'grab';
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(parent);

    scheduleRender();
    animate();
  };

  const destroy = () => {
    if (animId != null) { cancelAnimationFrame(animId); animId = null; }
    resizeObserver?.disconnect();
    if (canvasEl) {
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerup', onPointerUp);
      canvasEl.removeEventListener('pointercancel', onPointerUp);
    }
    removeDispose(highlightObj); highlightObj = null;
    removeDispose(cityDots); cityDots = null;
    if (landMesh) { scene?.remove(landMesh); disposeObject(landMesh); landMesh = null; }
    if (borderLines) { scene?.remove(borderLines); disposeObject(borderLines); borderLines = null; }
    renderer?.dispose();
    renderer = null; scene = null; camera = null; canvasEl = null;
    initialized = false; fitTarget = null;
    labels.value = [];
  };

  // ── Публичные методы ─────────────────────────────────────────────────────────

  const setRoute = (segments: SegmentInfo[], airports: Record<string, FullAirportData>) => {
    routeSegments = segments;
    routeAirports = airports;
    rebuildRoute(segments, airports);
  };

  const setZoom = (value: number) => {
    if (!camera) return;
    fitTarget = null;
    camera.zoom = Math.max(INIT_ZOOM, Math.min(MAX_ZOOM, value));
    camera.updateProjectionMatrix();
    clampCamera();
    currentZoom.value = camera.zoom;
    markLabelsDirty();
    scheduleRender();
  };

  return {
    init,
    destroy,
    setRoute,
    setZoom,
    currentZoom,
    labels,
    MIN_ZOOM: INIT_ZOOM,
    MAX_ZOOM,
  };
}
