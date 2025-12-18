export interface Cloud {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  layer: 'back' | 'middle' | 'front'
  seed: number
  actualWidth: number
  actualHeight: number
}

export interface Size {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface EllipseParams {
  semiMajorAxis: number
  semiMinorAxis: number
}

export interface EllipseCenter {
  x: number
  y: number
}

export interface AircraftState {
  x: number
  y: number
  width: number
  height: number
  startTime: number
  animationStartTime: number
  isAnimating: boolean
  tiltAngle: number
  targetTiltAngle: number
  flipHorizontal: 1 | -1
}

export interface LoadingState {
  airport: boolean
  aircraft: boolean
  cloud: boolean
}

export interface Velocity {
  x: number
  y: number
}

export interface DirectionChangeState {
  lastDirectionChangeTime: number
  currentCrossValue: number
  smoothedCrossValue: number
  lastStableCrossValue: number
  isChanging: boolean
  changeStartTime: number
  lastStableDirection: number
  angleHistory: number[]
  angleBufferSize: number
}

export interface PositionHistory {
  x: number
  y: number
  time: number
}

export interface CanvasContext {
  ctx: CanvasRenderingContext2D | null
  dpr: number
}

export interface ImageSources {
  airport: string
  aircraft: string
  cloud: string
}

export interface ImageAssets {
  airport: HTMLImageElement
  aircraft: HTMLImageElement
  cloud: HTMLImageElement
}

export interface ImageSizes {
  airport: { width: number; height: number; aspectRatio: number }
  aircraft: { width: number; height: number; aspectRatio: number }
  cloud: { width: number; height: number; aspectRatio: number }
}
