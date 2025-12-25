export interface TravelshopConfig {
  canvasInitHeight: number
  safeZoneMargins: {
    horizontal: number
    vertical: number
  }
  aircraft: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
    targetWidth: number
    animationDuration: number
    rotationDirection: 1 | -1
    directionChange: {
      enabled: boolean
      sensitivity: number
      minVelocityThreshold: number
      minDistanceFactor: number
      hysteresis: {
        enabled: boolean
        threshold: number
        deadZone: number
        timeDelay: number
        angleBuffer: number
      }
      smoothing: {
        enabled: boolean
        factor: number
        maxChangePerFrame: number
      }
    }
    airportEllipse: {
      horizontalRadius: number
      verticalRadius: number
      centerYOffset: number
      centerXOffset: number
    }
    mouseEllipse: {
      horizontalRadius: number
      verticalRadius: number
      roundness: number
    }
    tilt: {
      enabled: boolean
      maxAngle: number
      smoothFactor: number
    }
    followMouse: {
      enabled: boolean
      centerSmoothing: number
      ellipseSmoothing: number
      returnSpeed: number
    }
  }
  cloud: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
  }
  airport: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
    maxWidth: number
    initialMarginTop: number
  }
  clouds: {
    back: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    middle: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    front: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    generationIntervals: {
      back: number
      middle: number
      front: number
    }
    yRanges: {
      back: { min: number; max: number }
      middle: { min: number; max: number }
      front: { min: number; max: number }
    }
    opacity: {
      back: { min: number; max: number }
      middle: { min: number; max: number }
      front: { min: number; max: number }
    }
  }
}

export interface ControlParam {
  id: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export interface DebugParams {
  [category: string]: ControlParam[]
}

export interface DebugParamConfig {
  id: string
  min: number
  max: number
  step: number
  getValue: (config: TravelshopConfig) => number
  setValue: (config: TravelshopConfig, value: number) => void
}

export enum DebugCategory {
  SAFE_ZONE = 'safeZone',
  AIRPORT_ELLIPSE = 'airportEllipse',
  MOUSE_ELLIPSE = 'mouseEllipse',
  AIRCRAFT = 'aircraft',
  SMOOTHNESS = 'smoothness',
  AUTO_DIRECTION = 'autoDirection',
  HYSTERESIS = 'hysteresis',
  SMOOTHING = 'smoothing',
  TILT = 'tilt',
}

export enum AircraftParam {
  ANIMATION_DURATION = 'animationDuration',
  TARGET_WIDTH = 'aircraftTargetWidth',
  CENTER_SMOOTHING = 'centerSmoothing',
  ELLIPSE_SMOOTHING = 'ellipseSmoothing',
  RETURN_SPEED = 'returnSpeed',
  SENSITIVITY = 'sensitivity',
  MIN_VELOCITY_THRESHOLD = 'minVelocityThreshold',
  MIN_DISTANCE_FACTOR = 'minDistanceFactor',
  HYSTERESIS_THRESHOLD = 'hysteresisThreshold',
  HYSTERESIS_DEAD_ZONE = 'hysteresisDeadZone',
  HYSTERESIS_TIME_DELAY = 'hysteresisTimeDelay',
  HYSTERESIS_ANGLE_BUFFER = 'hysteresisAngleBuffer',
  SMOOTHING_FACTOR = 'smoothingFactor',
  MAX_CHANGE_PER_FRAME = 'maxChangePerFrame',
  MAX_TILT_ANGLE = 'maxTiltAngle',
  TILT_SMOOTH_FACTOR = 'tiltSmoothFactor',
}

export enum SafeZoneParam {
  HORIZONTAL = 'safeZoneHorizontal',
  VERTICAL = 'safeZoneVertical',
}

export enum EllipseParam {
  AIRPORT_HORIZONTAL_RADIUS = 'airportEllipseHorizontalRadius',
  AIRPORT_VERTICAL_RADIUS = 'airportEllipseVerticalRadius',
  AIRPORT_CENTER_X_OFFSET = 'airportEllipseCenterXOffset',
  AIRPORT_CENTER_Y_OFFSET = 'airportEllipseCenterYOffset',
  MOUSE_HORIZONTAL_RADIUS = 'mouseEllipseHorizontalRadius',
  MOUSE_VERTICAL_RADIUS = 'mouseEllipseVerticalRadius',
  MOUSE_ROUNDNESS = 'mouseEllipseRoundness',
}

export const DEFAULT_CONFIG: TravelshopConfig = {
  canvasInitHeight: 560,
  safeZoneMargins: {
    horizontal: 100,
    vertical: 50,
  },
  aircraft: {
    originalWidth: 433,
    originalHeight: 163,
    aspectRatio: 163 / 433,
    targetWidth: 190,
    animationDuration: 16000,
    rotationDirection: 1,
    directionChange: {
      enabled: true,
      sensitivity: 0.8,
      minVelocityThreshold: 0.3,
      minDistanceFactor: 0.2,
      hysteresis: {
        enabled: true,
        threshold: 0.15,
        deadZone: 0.05,
        timeDelay: 200,
        angleBuffer: 0.1,
      },
      smoothing: {
        enabled: true,
        factor: 0.05,
        maxChangePerFrame: 0.3,
      },
    },
    airportEllipse: {
      horizontalRadius: 450,
      verticalRadius: 80,
      centerYOffset: 20,
      centerXOffset: 0,
    },
    mouseEllipse: {
      horizontalRadius: 200,
      verticalRadius: 100,
      roundness: 0.8,
    },
    tilt: {
      enabled: true,
      maxAngle: 0.3,
      smoothFactor: 0.8,
    },
    followMouse: {
      enabled: true,
      centerSmoothing: 0.05,
      ellipseSmoothing: 0.1,
      returnSpeed: 0.02,
    },
  },
  cloud: {
    originalWidth: 394,
    originalHeight: 237,
    aspectRatio: 237 / 394,
  },
  airport: {
    originalWidth: 800,
    originalHeight: 472,
    aspectRatio: 472 / 800,
    maxWidth: 600,
    initialMarginTop: 170,
  },
  clouds: {
    back: {
      minWidth: 30,
      maxWidth: 60,
      minSpeed: 10,
      maxSpeed: 20,
      adaptiveCountRatio: 60,
      minCount: 3,
      maxCount: 15,
    },
    middle: {
      minWidth: 60,
      maxWidth: 80,
      minSpeed: 15,
      maxSpeed: 25,
      adaptiveCountRatio: 120,
      minCount: 2,
      maxCount: 10,
    },
    front: {
      minWidth: 100,
      maxWidth: 130,
      minSpeed: 20,
      maxSpeed: 30,
      adaptiveCountRatio: 200,
      minCount: 1,
      maxCount: 5,
    },
    generationIntervals: {
      back: 10000,
      middle: 6000,
      front: 3000,
    },
    yRanges: {
      back: { min: 0.05, max: 0.25 },
      middle: { min: 0.1, max: 0.35 },
      front: { min: 0.15, max: 0.45 },
    },
    opacity: {
      back: { min: 0.2, max: 1 },
      middle: { min: 0.6, max: 1 },
      front: { min: 0.8, max: 1 },
    },
  },
}

export const DEBUG_PARAMS_CONFIG: Record<string, DebugParamConfig[]> = {
  [DebugCategory.SAFE_ZONE]: [
    {
      id: SafeZoneParam.HORIZONTAL,
      min: 0,
      max: 500,
      step: 10,
      getValue: (config) => config.safeZoneMargins.horizontal,
      setValue: (config, value) => { config.safeZoneMargins.horizontal = value },
    },
    {
      id: SafeZoneParam.VERTICAL,
      min: 0,
      max: 500,
      step: 10,
      getValue: (config) => config.safeZoneMargins.vertical,
      setValue: (config, value) => { config.safeZoneMargins.vertical = value },
    },
  ],
  [DebugCategory.AIRPORT_ELLIPSE]: [
    {
      id: EllipseParam.AIRPORT_HORIZONTAL_RADIUS,
      min: 100,
      max: 800,
      step: 10,
      getValue: (config) => config.aircraft.airportEllipse.horizontalRadius,
      setValue: (config, value) => { config.aircraft.airportEllipse.horizontalRadius = value },
    },
    {
      id: EllipseParam.AIRPORT_VERTICAL_RADIUS,
      min: 20,
      max: 200,
      step: 5,
      getValue: (config) => config.aircraft.airportEllipse.verticalRadius,
      setValue: (config, value) => { config.aircraft.airportEllipse.verticalRadius = value },
    },
    {
      id: EllipseParam.AIRPORT_CENTER_X_OFFSET,
      min: -200,
      max: 200,
      step: 5,
      getValue: (config) => config.aircraft.airportEllipse.centerXOffset,
      setValue: (config, value) => { config.aircraft.airportEllipse.centerXOffset = value },
    },
    {
      id: EllipseParam.AIRPORT_CENTER_Y_OFFSET,
      min: -200,
      max: 200,
      step: 5,
      getValue: (config) => config.aircraft.airportEllipse.centerYOffset,
      setValue: (config, value) => { config.aircraft.airportEllipse.centerYOffset = value },
    },
  ],
  [DebugCategory.MOUSE_ELLIPSE]: [
    {
      id: EllipseParam.MOUSE_HORIZONTAL_RADIUS,
      min: 50,
      max: 400,
      step: 10,
      getValue: (config) => config.aircraft.mouseEllipse.horizontalRadius,
      setValue: (config, value) => { config.aircraft.mouseEllipse.horizontalRadius = value },
    },
    {
      id: EllipseParam.MOUSE_VERTICAL_RADIUS,
      min: 30,
      max: 200,
      step: 5,
      getValue: (config) => config.aircraft.mouseEllipse.verticalRadius,
      setValue: (config, value) => { config.aircraft.mouseEllipse.verticalRadius = value },
    },
    {
      id: EllipseParam.MOUSE_ROUNDNESS,
      min: 0.1,
      max: 1,
      step: 0.05,
      getValue: (config) => config.aircraft.mouseEllipse.roundness,
      setValue: (config, value) => { config.aircraft.mouseEllipse.roundness = value },
    },
  ],
  [DebugCategory.AIRCRAFT]: [
    {
      id: AircraftParam.ANIMATION_DURATION,
      min: 5000,
      max: 30000,
      step: 500,
      getValue: (config) => config.aircraft.animationDuration,
      setValue: (config, value) => { config.aircraft.animationDuration = value },
    },
    {
      id: AircraftParam.TARGET_WIDTH,
      min: 50,
      max: 400,
      step: 10,
      getValue: (config) => config.aircraft.targetWidth,
      setValue: (config, value) => { config.aircraft.targetWidth = value },
    },
  ],
  [DebugCategory.SMOOTHNESS]: [
    {
      id: AircraftParam.CENTER_SMOOTHING,
      min: 0.01,
      max: 0.3,
      step: 0.01,
      getValue: (config) => config.aircraft.followMouse.centerSmoothing,
      setValue: (config, value) => { config.aircraft.followMouse.centerSmoothing = value },
    },
    {
      id: AircraftParam.ELLIPSE_SMOOTHING,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      getValue: (config) => config.aircraft.followMouse.ellipseSmoothing,
      setValue: (config, value) => { config.aircraft.followMouse.ellipseSmoothing = value },
    },
    {
      id: AircraftParam.RETURN_SPEED,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      getValue: (config) => config.aircraft.followMouse.returnSpeed,
      setValue: (config, value) => { config.aircraft.followMouse.returnSpeed = value },
    },
  ],
  [DebugCategory.AUTO_DIRECTION]: [
    {
      id: AircraftParam.SENSITIVITY,
      min: 0.1,
      max: 2,
      step: 0.1,
      getValue: (config) => config.aircraft.directionChange.sensitivity,
      setValue: (config, value) => { config.aircraft.directionChange.sensitivity = value },
    },
    {
      id: AircraftParam.MIN_VELOCITY_THRESHOLD,
      min: 0.1,
      max: 2,
      step: 0.05,
      getValue: (config) => config.aircraft.directionChange.minVelocityThreshold,
      setValue: (config, value) => { config.aircraft.directionChange.minVelocityThreshold = value },
    },
    {
      id: AircraftParam.MIN_DISTANCE_FACTOR,
      min: 0.1,
      max: 1,
      step: 0.05,
      getValue: (config) => config.aircraft.directionChange.minDistanceFactor,
      setValue: (config, value) => { config.aircraft.directionChange.minDistanceFactor = value },
    },
  ],
  [DebugCategory.HYSTERESIS]: [
    {
      id: AircraftParam.HYSTERESIS_THRESHOLD,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      getValue: (config) => config.aircraft.directionChange.hysteresis.threshold,
      setValue: (config, value) => { config.aircraft.directionChange.hysteresis.threshold = value },
    },
    {
      id: AircraftParam.HYSTERESIS_DEAD_ZONE,
      min: 0.01,
      max: 0.3,
      step: 0.01,
      getValue: (config) => config.aircraft.directionChange.hysteresis.deadZone,
      setValue: (config, value) => { config.aircraft.directionChange.hysteresis.deadZone = value },
    },
    {
      id: AircraftParam.HYSTERESIS_TIME_DELAY,
      min: 50,
      max: 1000,
      step: 50,
      getValue: (config) => config.aircraft.directionChange.hysteresis.timeDelay,
      setValue: (config, value) => { config.aircraft.directionChange.hysteresis.timeDelay = value },
    },
    {
      id: AircraftParam.HYSTERESIS_ANGLE_BUFFER,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      getValue: (config) => config.aircraft.directionChange.hysteresis.angleBuffer,
      setValue: (config, value) => { config.aircraft.directionChange.hysteresis.angleBuffer = value },
    },
  ],
  [DebugCategory.SMOOTHING]: [
    {
      id: AircraftParam.SMOOTHING_FACTOR,
      min: 0.01,
      max: 0.3,
      step: 0.01,
      getValue: (config) => config.aircraft.directionChange.smoothing.factor,
      setValue: (config, value) => { config.aircraft.directionChange.smoothing.factor = value },
    },
    {
      id: AircraftParam.MAX_CHANGE_PER_FRAME,
      min: 0.1,
      max: 1,
      step: 0.05,
      getValue: (config) => config.aircraft.directionChange.smoothing.maxChangePerFrame,
      setValue: (config, value) => { config.aircraft.directionChange.smoothing.maxChangePerFrame = value },
    },
  ],
  [DebugCategory.TILT]: [
    {
      id: AircraftParam.MAX_TILT_ANGLE,
      min: 0.1,
      max: 1,
      step: 0.05,
      getValue: (config) => config.aircraft.tilt.maxAngle,
      setValue: (config, value) => { config.aircraft.tilt.maxAngle = value },
    },
    {
      id: AircraftParam.TILT_SMOOTH_FACTOR,
      min: 0.1,
      max: 0.95,
      step: 0.05,
      getValue: (config) => config.aircraft.tilt.smoothFactor,
      setValue: (config, value) => { config.aircraft.tilt.smoothFactor = value },
    },
  ],
}
