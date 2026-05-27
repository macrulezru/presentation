// ── Проекция Миллера ──────────────────────────────────────────────────────────
export const PROJ_LON_SCALE = 1 / 180;
export const PROJ_LAT_SCALE = 1 / Math.PI;
export const PROJ_ANTIMERIDIAN_X = 180 * PROJ_LON_SCALE;

export const MAP_WEST_X = -180 * PROJ_LON_SCALE;
export const MAP_EAST_X = 180 * PROJ_LON_SCALE;

const _millerY = (lat: number) =>
  1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * (Math.PI / 180)));

export const MAP_NORTH_LAT = 84;
export const MAP_SOUTH_LAT = -60;
export const MAP_NORTH_CLIP_Y = _millerY(MAP_NORTH_LAT) * PROJ_LAT_SCALE;
export const MAP_SOUTH_CLIP_Y = _millerY(MAP_SOUTH_LAT) * PROJ_LAT_SCALE;

// ── Камера ────────────────────────────────────────────────────────────────────
export const CAMERA_NEAR = -10;
export const CAMERA_FAR = 10;
export const CAMERA_FLY_LERP = 0.1;
export const MIN_ZOOM = 2 / (MAP_NORTH_CLIP_Y - MAP_SOUTH_CLIP_Y);
export const MAX_ZOOM = 20;

// ── Цвета ─────────────────────────────────────────────────────────────────────
export const RENDERER_BG_COLOR = 0x02142a;

export const COLOR_LAND = 0xffffff;
export const LAND_OPACITY = 0.07;

export const COLOR_BORDERS = 0xffffff;
export const BORDER_OPACITY = 0.11;

export const COLOR_HIGHLIGHT_ROUTE = 0xeb610b;
export const COLOR_HIGHLIGHT_ROUTE_GLOW = 0xffe757;
export const HIGHLIGHT_ROUTE_OPACITY = 0.95;
export const HIGHLIGHT_ANIM_SPEED = 0.5;
export const HIGHLIGHT_TRAIL_LENGTH = 0.35;

export const COLOR_CITY_DOT = 0xeb610b;
export const COLOR_CITY_STROKE = 0xffffff;
export const CITY_DOT_FILL_R = 0.003;
export const CITY_DOT_STROKE_W = 0.0012;
export const CITY_DOT_STROKE_R = CITY_DOT_FILL_R + CITY_DOT_STROKE_W;
export const CITY_DOT_SEGMENTS = 14;

// ── Дуги ──────────────────────────────────────────────────────────────────────
export const ROUTE_SEGMENTS = 36;
export const ARC_LIFT_FACTOR = 0.08;
export const ARC_MAX_LIFT = 0.06;
export const ARC_GC_MAX_LIFT_RATIO = 0.15;

// ── Авто-подгонка ─────────────────────────────────────────────────────────────
export const FIT_PADDING_FACTOR = 1.4;
export const FIT_MIN_HALF_SIZE = 0.08;
