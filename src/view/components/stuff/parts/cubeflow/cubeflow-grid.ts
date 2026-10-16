/**
 * Киберсетка для рекламного блока Cubeflow: схематичный куб из тонких линий (по три слоя на каждой грани, узлы светятся), от него
 * расходятся дорожки как на печатной плате, а по дорожкам и по линиям самого куба бегут светлые точки с хвостом. Это облегчённый
 * 2D-перенос фона из самой игры (там он рисуется в Three.js): раскладка дорожек, рост и угасание, движение точек — те же.
 * Модуль подгружается лениво, когда блок впервые попадает в зону видимости, и ничего не тянет за собой.
 *
 * Единицы плоскости — как в игре: перспектива куба считается для камеры с углом обзора FOV, дорожки лежат в плоскости за кубом.
 */

type V2 = [number, number];
type V3 = [number, number, number];

/** Параметры сетки (значения по умолчанию взяты из настроек игры) */
export interface CubeflowGridOptions {
  color: string;
  dotColor: string;
  /** Цвет узлов (на изломах дорожек и на гранях куба); пустая строка — цвет линий, осветлённый наполовину */
  nodeColor: string;
  /** Во сколько раз узел ярче линий (прозрачность узла = `opacity × nodeBoost`; узлы куба ещё на `cubeBoost`) */
  nodeBoost: number;
  /** Размер узла в пикселях */
  nodeSize: number;
  /** Прозрачность линий дорожек и куба (куб ярче на `cubeBoost`) */
  opacity: number;
  cubeBoost: number;
  traceCount: number;
  /** Сколько точек бежит по дорожкам и сколько по линиям куба */
  dotCount: number;
  cubeDotCount: number;
  /** Размер точки в долях единицы плоскости */
  dotSize: number;
  dotSpeed: number;
  lifeMin: number;
  lifeMax: number;
  growSpeed: number;
  fadeSpeed: number;
  reach: number;
  cubeSize: number;
}

export const DEFAULT_OPTIONS: CubeflowGridOptions = {
  color: '#294e03',
  dotColor: '#5da70e',
  nodeColor: '#386805',
  nodeBoost: 2.6,
  nodeSize: 2,
  opacity: 0.22,
  cubeBoost: 1.9,
  traceCount: 40,
  dotCount: 56,
  cubeDotCount: 20,
  dotSize: 0.006,
  dotSpeed: 0.12,
  lifeMin: 12,
  lifeMax: 30,
  growSpeed: 1.1,
  fadeSpeed: 1.4,
  reach: 2.2,
  cubeSize: 0.59,
};

/** Положение сетки в пикселях холста: центр куба и размер единицы плоскости */
export interface CubeflowGridFrame {
  cx: number;
  cy: number;
  unit: number;
}

export interface CubeflowGridHandle {
  /** Запускает анимацию (повторный вызов ничего не делает) */
  start(): void;
  /** Останавливает анимацию: кадр остаётся на холсте */
  stop(): void;
  /** Подгоняет размер холста под элемент и перерисовывает кадр */
  resize(): void;
  destroy(): void;
}

const FOV = 40;
const MAX_SEGMENTS = 16;
const TRAIL = 4;
const TRAIL_STEP = 0.05;
/** Ширина размытого перехода у концов роста и угасания дорожки */
const SOFT = 0.22;

/** Небольшой детерминированный генератор */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (v: number, a: number, b: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

interface Trace {
  points: V2[];
  cumulative: number[];
  length: number;
  age: number;
  life: number;
  /** Видимый участок: растёт `hi` (дорожка выезжает из куба), затем `lo` (гаснет с начала) */
  lo: number;
  hi: number;
  dying: boolean;
  dead: boolean;
}

interface Dot {
  trace: Trace;
  dist: number;
  speed: number;
}

interface Walker {
  from: V3;
  to: V3;
  t: number;
  speed: number;
  history: V3[];
}

function buildTrace(
  slot: number,
  count: number,
  rand: () => number,
  half: number,
  reach: number,
) {
  // положение на периметре: 0…4, целая часть — сторона, дробная — вдоль неё
  const along = ((slot + 0.1 + rand() * 0.8) / count) * 4;
  const side = Math.floor(along) % 4;
  const u = (along % 1) * 2 - 1;
  const corner = Math.abs(u) > 0.86;
  const base = (side * Math.PI) / 2;
  const outward = corner ? base + (u > 0 ? Math.PI / 4 : -Math.PI / 4) : base;
  const nx = Math.cos(base);
  const ny = Math.sin(base);
  let cur: V2 = [nx * half - ny * u * half, ny * half + nx * u * half];
  // направления — восемь сторон по 45°
  let dir = Math.round(outward / (Math.PI / 4));
  const points: V2[] = [cur];
  for (
    let guard = 0;
    guard < MAX_SEGMENTS && Math.hypot(cur[0], cur[1]) < reach;
    guard++
  ) {
    const angle = (dir * Math.PI) / 4;
    const diagonal = dir % 2 !== 0;
    const length = (diagonal ? 0.14 : 0.1) + rand() * (diagonal ? 0.42 : 0.5);
    cur = [cur[0] + Math.cos(angle) * length, cur[1] + Math.sin(angle) * length];
    points.push(cur);
    // следующий поворот на 45° в любую сторону, но не дальше 90° от радиального направления
    const turns = rand() < 0.5 ? [-1, 1] : [1, -1];
    for (const turn of turns) {
      const next = dir + turn;
      let diff = Math.abs(((next * Math.PI) / 4 - outward) % (Math.PI * 2));
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff <= Math.PI / 2 + 1e-6) {
        dir = next;
        break;
      }
    }
  }
  const cumulative = [0];
  for (let k = 1; k < points.length; k++) {
    const [a, b] = [points[k - 1]!, points[k]!];
    cumulative.push(cumulative[k - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return {
    points,
    cumulative,
    length: cumulative[cumulative.length - 1]!,
    age: 0,
    life: 1,
    lo: 0,
    hi: 0,
    dying: false,
    dead: false,
  } as Trace;
}

/** Из нескольких вариантов берётся тот, конец которого дальше от конца прежней дорожки слота */
function makeTrace(
  slot: number,
  count: number,
  rand: () => number,
  half: number,
  reach: number,
  avoid: V2 | null,
) {
  let best: Trace | null = null;
  let bestScore = -1;
  for (let attempt = 0; attempt < (avoid ? 5 : 1); attempt++) {
    const trace = buildTrace(slot, count, rand, half, reach);
    const end = trace.points[trace.points.length - 1]!;
    const score = avoid ? Math.hypot(end[0] - avoid[0], end[1] - avoid[1]) : 0;
    if (score > bestScore) {
      bestScore = score;
      best = trace;
    }
  }
  return best!;
}

function pointAt(trace: Trace, dist: number, out: V2) {
  const { points, cumulative } = trace;
  let k = 1;
  while (k < cumulative.length - 1 && cumulative[k]! < dist) k++;
  const a = points[k - 1]!;
  const b = points[k]!;
  const span = cumulative[k]! - cumulative[k - 1]!;
  const t = span > 1e-6 ? clamp01((dist - cumulative[k - 1]!) / span) : 0;
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
}

/** Цвет в виде «r, g, b» для rgba(): из #rgb и #rrggbb */
function rgb(hex: string, whiten = 0): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  const mix = (v: number) => Math.round(v + (255 - v) * whiten);
  return `${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)}`;
}

export function createCubeflowGrid(
  canvas: HTMLCanvasElement,
  getFrame: () => CubeflowGridFrame,
  overrides: Partial<CubeflowGridOptions> = {},
): CubeflowGridHandle {
  const o: CubeflowGridOptions = { ...DEFAULT_OPTIONS, ...overrides };
  const ctx = canvas.getContext('2d')!;
  const rand = mulberry32(Math.floor(Math.random() * 1e9));
  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  // внешний контур куба на экране — его ближняя грань: перспектива увеличивает её относительно плоскости дорожек
  const dist = 1 / Math.tan((FOV / 2) * (Math.PI / 180));
  const half = (o.cubeSize * dist) / Math.max(dist - o.cubeSize, 0.2);
  /** Перспективная проекция точки куба в плоскость: ближняя (z > 0) грань крупнее */
  const project = (p: V3, out: V2) => {
    const k = dist / (dist - p[2]);
    out[0] = p[0] * k;
    out[1] = p[1] * k;
  };

  const count = Math.round(o.traceCount);
  const chooseLife = (slots: Trace[], slot: number) => {
    const lo = Math.min(o.lifeMin, o.lifeMax);
    const hi = Math.max(o.lifeMin, o.lifeMax);
    const n = slots.length;
    const neighbours = [slots[(slot + n - 1) % n], slots[(slot + 1) % n]]
      .filter((t): t is Trace => !!t && !t.dying)
      .map(t => t.life - t.age);
    let best = lo + rand() * (hi - lo);
    let bestScore = -1;
    for (let i = 0; i < 6; i++) {
      const life = lo + rand() * (hi - lo);
      const score = Math.min(...neighbours.map(rest => Math.abs(life - rest)), 1e9);
      if (score > bestScore) {
        bestScore = score;
        best = life;
      }
    }
    return best;
  };

  // все дорожки уже выросли, а возраст у каждой свой: гаснуть они начнут в разное время
  const slots: Trace[] = Array.from({ length: count }, (_, i) => {
    const t = makeTrace(i, count, rand, half, o.reach, null);
    t.life = o.lifeMin + rand() * (o.lifeMax - o.lifeMin);
    t.age = rand() * t.life;
    t.hi = t.length;
    return t;
  });
  let fading: Trace[] = [];

  const newDot = (anywhere: boolean): Dot => {
    const trace = slots[Math.floor(rand() * slots.length)]!;
    return {
      trace,
      dist: anywhere ? rand() * trace.length : -rand() * 0.6,
      speed: 0.6 + rand() * 0.9,
    };
  };
  const dots: Dot[] = Array.from({ length: Math.round(o.dotCount) }, () => newDot(true));

  // узлы решётки куба и точки, бегущие по его линиям
  const s = o.cubeSize;
  const steps = [-1, -1 / 3, 1 / 3, 1];
  const cubeNode = (): V3 => {
    const pick = () => steps[Math.floor(rand() * 4)]! * s;
    const p: V3 = [pick(), pick(), pick()];
    p[Math.floor(rand() * 3)] = (rand() < 0.5 ? -1 : 1) * s;
    return p;
  };
  const nextNode = (from: V3, avoid: V3 | null): V3 => {
    const step = (2 * s) / 3;
    const options: V3[] = [];
    for (let axis = 0; axis < 3; axis++) {
      for (const sign of [-1, 1]) {
        const to: V3 = [...from];
        to[axis] = to[axis]! + sign * step;
        if (Math.abs(to[axis]!) > s + 1e-6) continue;
        const shared = [0, 1, 2].some(
          k =>
            Math.abs(Math.abs(from[k]!) - s) < 1e-6 && Math.abs(to[k]! - from[k]!) < 1e-6,
        );
        if (!shared) continue;
        if (avoid && to.every((v, k) => Math.abs(v - avoid[k]!) < 1e-6)) continue;
        options.push(to);
      }
    }
    return options[Math.floor(rand() * options.length)] ?? from;
  };
  const walkers: Walker[] = Array.from({ length: Math.round(o.cubeDotCount) }, () => {
    const from = cubeNode();
    return {
      from,
      to: nextNode(from, null),
      t: rand(),
      speed: 0.8 + rand() * 1.2,
      history: [],
    };
  });

  // линии куба: на каждой грани сетка 3×3 (в 3D, проецируются при рисовании)
  const cubeLines: [V3, V3][] = [];
  const cubeNodes: V3[] = [];
  for (const axis of [0, 1, 2] as const) {
    for (const sign of [1, -1] as const) {
      const u = (axis + 1) % 3;
      const v = (axis + 2) % 3;
      const at = (a: number, b: number): V3 => {
        const p: V3 = [0, 0, 0];
        p[axis] = sign * s;
        p[u] = a * s;
        p[v] = b * s;
        return p;
      };
      for (const c of steps) {
        cubeLines.push([at(c, -1), at(c, 1)], [at(-1, c), at(1, c)]);
      }
      for (const a of steps) for (const b of steps) cubeNodes.push(at(a, b));
    }
  }

  const lineRgb = rgb(o.color);
  const nodeRgb = o.nodeColor ? rgb(o.nodeColor) : rgb(o.color, 0.5);
  /** Светящаяся точка заранее нарисована на маленьком холсте: на кадре остаётся только её копирование */
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext('2d')!;
  const gradient = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, `rgba(${rgb(o.dotColor)}, 1)`);
  gradient.addColorStop(0.35, `rgba(${rgb(o.dotColor)}, 0.55)`);
  gradient.addColorStop(1, `rgba(${rgb(o.dotColor)}, 0)`);
  sctx.fillStyle = gradient;
  sctx.fillRect(0, 0, 32, 32);

  let width = 0;
  let height = 0;
  let ratio = 1;
  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    draw();
  };

  const tick = (dt: number) => {
    if (dt <= 0) return;
    for (const t of [...slots, ...fading]) {
      t.age += dt;
      if (!t.dying) t.hi = Math.min(t.length, t.hi + dt * o.growSpeed);
      else t.lo = Math.min(t.length, t.lo + dt * o.fadeSpeed);
    }
    for (let i = 0; i < slots.length; i++) {
      const t = slots[i]!;
      if (t.dying || t.age < t.life) continue;
      // срок вышел: старая дорожка гаснет, в этом же слоте растёт новая
      t.dying = true;
      t.hi = t.length;
      fading.push(t);
      const fresh = makeTrace(
        i,
        slots.length,
        rand,
        half,
        o.reach,
        t.points[t.points.length - 1]!,
      );
      fresh.life = chooseLife(slots, i);
      slots[i] = fresh;
    }
    for (const t of fading) if (t.lo >= t.length) t.dead = true;
    fading = fading.filter(t => !t.dead);
    const step = dt * o.dotSpeed;
    for (const dot of dots) {
      dot.dist += step * dot.speed;
      if (dot.trace.dead || dot.dist > dot.trace.length + TRAIL * TRAIL_STEP)
        Object.assign(dot, newDot(false));
    }
    const segment = (2 * s) / 3;
    for (const w of walkers) {
      w.t += (step * w.speed) / segment;
      while (w.t >= 1) {
        w.t -= 1;
        const prev = w.from;
        w.from = w.to;
        w.to = nextNode(w.from, prev);
      }
      const head: V3 = [
        w.from[0] + (w.to[0] - w.from[0]) * w.t,
        w.from[1] + (w.to[1] - w.from[1]) * w.t,
        w.from[2] + (w.to[2] - w.from[2]) * w.t,
      ];
      const last = w.history[0];
      if (
        !last ||
        Math.hypot(head[0] - last[0], head[1] - last[1], head[2] - last[2]) >= TRAIL_STEP
      ) {
        w.history.unshift(head);
        if (w.history.length > TRAIL - 1) w.history.pop();
      }
    }
  };

  const a: V2 = [0, 0];
  const b: V2 = [0, 0];
  const draw = () => {
    const frame = getFrame();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    const sx = (x: number) => frame.cx + x * frame.unit;
    const sy = (y: number) => frame.cy - y * frame.unit;

    // дорожки: видимые участки; у концов роста и угасания, а также вдали от куба яркость падает
    const fadeAt = (p: V2) =>
      1 - 0.85 * smoothstep(Math.hypot(p[0], p[1]), o.reach * 0.35, o.reach * 1.05);
    const bright = (t: Trace, d: number, p: V2) => {
      const head = t.hi >= t.length ? 1 : clamp01((t.hi - d) / SOFT);
      const tail = t.lo <= 0 ? 1 : clamp01((d - t.lo) / SOFT);
      return fadeAt(p) * head * tail;
    };
    const nodes: [number, number, number][] = [];
    for (const t of [...slots, ...fading]) {
      const from = Math.max(0, t.lo);
      const to = Math.min(t.length, t.hi);
      if (to <= from) continue;
      for (let k = 1; k < t.points.length; k++) {
        const d0 = Math.max(t.cumulative[k - 1]!, from);
        const d1 = Math.min(t.cumulative[k]!, to);
        if (d1 <= d0 + 1e-6) continue;
        // длинный отрезок режется на части: яркость меняется вдоль него плавно
        const parts = Math.max(1, Math.ceil((d1 - d0) / 0.12));
        for (let q = 0; q < parts; q++) {
          const e0 = d0 + ((d1 - d0) * q) / parts;
          const e1 = d0 + ((d1 - d0) * (q + 1)) / parts;
          pointAt(t, e0, a);
          pointAt(t, e1, b);
          const v = (bright(t, e0, a) + bright(t, e1, b)) / 2;
          if (v < 0.01) continue;
          ctx.strokeStyle = `rgba(${lineRgb}, ${(o.opacity * v).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(sx(a[0]), sy(a[1]));
          ctx.lineTo(sx(b[0]), sy(b[1]));
          ctx.stroke();
        }
      }
      for (let k = 0; k < t.points.length; k++) {
        const d = t.cumulative[k]!;
        if (d < from - 1e-6 || d > to + 1e-6) continue;
        const p = t.points[k]!;
        nodes.push([p[0], p[1], bright(t, d, p)]);
      }
    }
    ctx.fillStyle = `rgb(${nodeRgb})`;
    for (const [x, y, v] of nodes) {
      if (v < 0.02) continue;
      ctx.globalAlpha = Math.min(1, o.opacity * o.nodeBoost * v);
      ctx.fillRect(
        sx(x) - o.nodeSize / 2,
        sy(y) - o.nodeSize / 2,
        o.nodeSize,
        o.nodeSize,
      );
    }
    ctx.globalAlpha = 1;

    // куб: линии и светящиеся узлы
    ctx.strokeStyle = `rgba(${lineRgb}, ${Math.min(1, o.opacity * o.cubeBoost).toFixed(3)})`;
    ctx.beginPath();
    for (const [p, q] of cubeLines) {
      project(p, a);
      project(q, b);
      ctx.moveTo(sx(a[0]), sy(a[1]));
      ctx.lineTo(sx(b[0]), sy(b[1]));
    }
    ctx.stroke();
    ctx.fillStyle = `rgb(${nodeRgb})`;
    ctx.globalAlpha = Math.min(1, o.opacity * o.nodeBoost * o.cubeBoost);
    for (const p of cubeNodes) {
      project(p, a);
      ctx.fillRect(
        sx(a[0]) - o.nodeSize / 2,
        sy(a[1]) - o.nodeSize / 2,
        o.nodeSize,
        o.nodeSize,
      );
    }

    // светлые точки с хвостом
    const size = Math.max(4, o.dotSize * frame.unit * 2);
    const stamp = (x: number, y: number, v: number) => {
      ctx.globalAlpha = Math.min(1, v);
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    };
    for (const dot of dots) {
      const t = dot.trace;
      for (let k = 0; k < TRAIL; k++) {
        const d = dot.dist - k * TRAIL_STEP;
        if (d < Math.max(0, t.lo) || d > Math.min(t.length, t.hi)) continue;
        pointAt(t, d, a);
        const tail = 1 - k / TRAIL;
        const end = 1 - smoothstep(dot.dist / t.length, 0.7, 1);
        stamp(sx(a[0]), sy(a[1]), tail * tail * end);
      }
    }
    for (const w of walkers) {
      for (let k = 0; k < TRAIL; k++) {
        const point =
          k === 0
            ? ([
                w.from[0] + (w.to[0] - w.from[0]) * w.t,
                w.from[1] + (w.to[1] - w.from[1]) * w.t,
                w.from[2] + (w.to[2] - w.from[2]) * w.t,
              ] as V3)
            : w.history[k - 1];
        if (!point) continue;
        project(point, a);
        const tail = 1 - k / TRAIL;
        stamp(sx(a[0]), sy(a[1]), tail * tail);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(reduced ? 0 : dt);
    draw();
    raf = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (raf || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resize,
    destroy() {
      this.stop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
