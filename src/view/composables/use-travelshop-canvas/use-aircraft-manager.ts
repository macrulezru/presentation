import { ref, type Ref } from 'vue';

import type {
  AircraftState,
  Velocity,
  DirectionChangeState,
  PositionHistory,
  Point,
  EllipseParams,
  EllipseCenter,
} from './types';

import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store';

export interface UseAircraftManagerReturn {
  aircraft: Ref<AircraftState>;
  aircraftAngle: Ref<number>;
  rotationDirection: Ref<number>;
  aircraftVelocity: Ref<Velocity>;
  directionChangeState: Ref<DirectionChangeState>;
  lastAnimationUpdateTime: Ref<number>;
  initAircraft: (config: any, imageSizes: any) => void;
  updateAircraft: (options: {
    config: any;
    deltaTime: number;
    currentEllipseCenter: EllipseCenter;
    currentEllipse: EllipseParams;
    isMouseOverCanvas: boolean;
    mousePosition: Point | null;
  }) => void;
  drawAircraft: (ctx: CanvasRenderingContext2D, images: any) => void;
}

export function useAircraftManager(): UseAircraftManagerReturn {
  const travelshopIntroStore = useTravelshopIntroStore();

  const aircraft = ref<AircraftState>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    startTime: 0,
    animationStartTime: 0,
    isAnimating: false,
    tiltAngle: 0,
    targetTiltAngle: 0,
    flipHorizontal: 1,
  });

  const aircraftAngle = ref(0);
  const rotationDirection = ref(1);
  const aircraftVelocity = ref<Velocity>({ x: 0, y: 0 });
  const aircraftPositionHistory = ref<PositionHistory[]>([]);
  const lastAnimationUpdateTime = ref(Date.now());

  const directionChangeState = ref<DirectionChangeState>({
    lastDirectionChangeTime: 0,
    currentCrossValue: 0,
    smoothedCrossValue: 0,
    lastStableCrossValue: 0,
    isChanging: false,
    changeStartTime: 0,
    lastStableDirection: 1,
    angleHistory: [],
    angleBufferSize: 5,
  });

  const MAX_HISTORY_LENGTH = 10;

  const initAircraft = (imageSizes: any) => {
    aircraft.value.width = travelshopIntroStore.config.aircraft.targetWidth;
    aircraft.value.height = aircraft.value.width * imageSizes.aircraft.aspectRatio;
    aircraft.value.animationStartTime = Date.now();
    aircraft.value.isAnimating = true;
    aircraftAngle.value = 0;
    lastAnimationUpdateTime.value = Date.now();
  };

  const updateAircraftVelocity = () => {
    const now = Date.now();

    aircraftPositionHistory.value.push({
      x: aircraft.value.x,
      y: aircraft.value.y,
      time: now,
    });

    if (aircraftPositionHistory.value.length > MAX_HISTORY_LENGTH) {
      aircraftPositionHistory.value.shift();
    }

    if (aircraftPositionHistory.value.length >= 2) {
      const oldest = aircraftPositionHistory.value[0];
      const newest =
        aircraftPositionHistory.value[aircraftPositionHistory.value.length - 1];

      if (!oldest || !newest) return;

      const dt = (newest.time - oldest.time) / 1000;

      if (dt > 0) {
        aircraftVelocity.value = {
          x: (newest.x - oldest.x) / dt,
          y: (newest.y - oldest.y) / dt,
        };
      }
    }
  };

  const getAircraftMoveDirection = (): number => {
    const velocityThreshold =
      travelshopIntroStore.config.aircraft.directionChange.minVelocityThreshold;

    if (Math.abs(aircraftVelocity.value.x) > velocityThreshold) {
      return aircraftVelocity.value.x > 0 ? 1 : -1;
    }

    return rotationDirection.value;
  };

  const isInCriticalPoint = (angle: number): boolean => {
    const criticalAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI * 2];
    const buffer =
      travelshopIntroStore.config.aircraft.directionChange.hysteresis.angleBuffer;

    for (const criticalAngle of criticalAngles) {
      const diff = Math.abs(angle - criticalAngle);
      const normalizedDiff = Math.min(diff, Math.PI * 2 - diff);

      if (normalizedDiff < buffer) {
        return true;
      }
    }

    return false;
  };

  const determineRotationDirection = (options: {
    currentEllipseCenter: EllipseCenter;
    currentEllipse: EllipseParams;
    isMouseOverCanvas: boolean;
    mousePosition: Point | null;
  }): number => {
    if (!travelshopIntroStore.config.aircraft.directionChange.enabled) {
      return rotationDirection.value;
    }

    const moveDirection = getAircraftMoveDirection();

    const { isMouseOverCanvas, mousePosition } = options;
    if (!isMouseOverCanvas || !mousePosition) {
      directionChangeState.value.lastStableDirection = rotationDirection.value;
      return rotationDirection.value;
    }

    const aircraftPos = { x: aircraft.value.x, y: aircraft.value.y };
    const velocity = aircraftVelocity.value;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (
      speed < travelshopIntroStore.config.aircraft.directionChange.minVelocityThreshold
    ) {
      return rotationDirection.value;
    }

    const toMouse = {
      x: mousePosition.x - aircraftPos.x,
      y: mousePosition.y - aircraftPos.y,
    };

    const distanceToMouse = Math.sqrt(toMouse.x * toMouse.x + toMouse.y * toMouse.y);
    const minDistance =
      options.currentEllipse.semiMajorAxis *
      travelshopIntroStore.config.aircraft.directionChange.minDistanceFactor;

    if (distanceToMouse < minDistance) {
      return rotationDirection.value;
    }

    const rawCross = velocity.x * toMouse.y - velocity.y * toMouse.x;
    const normalizationFactor = speed * distanceToMouse;
    const normalizedCross = normalizationFactor > 0 ? rawCross / normalizationFactor : 0;

    directionChangeState.value.angleHistory.push(aircraftAngle.value);
    if (
      directionChangeState.value.angleHistory.length >
      directionChangeState.value.angleBufferSize
    ) {
      directionChangeState.value.angleHistory.shift();
    }

    const avgAngle =
      directionChangeState.value.angleHistory.reduce((a, b) => a + b, 0) /
      directionChangeState.value.angleHistory.length;
    const inCriticalPoint = isInCriticalPoint(avgAngle);

    directionChangeState.value.currentCrossValue = normalizedCross;
    const smoothingFactor =
      travelshopIntroStore.config.aircraft.directionChange.smoothing.factor;
    directionChangeState.value.smoothedCrossValue +=
      (normalizedCross - directionChangeState.value.smoothedCrossValue) * smoothingFactor;

    const maxChange =
      travelshopIntroStore.config.aircraft.directionChange.smoothing.maxChangePerFrame;
    const diff =
      directionChangeState.value.smoothedCrossValue -
      directionChangeState.value.lastStableCrossValue;

    if (Math.abs(diff) > maxChange) {
      directionChangeState.value.smoothedCrossValue =
        directionChangeState.value.lastStableCrossValue + Math.sign(diff) * maxChange;
    }

    const { deadZone } = travelshopIntroStore.config.aircraft.directionChange.hysteresis;
    if (Math.abs(directionChangeState.value.smoothedCrossValue) < deadZone) {
      return rotationDirection.value;
    }

    let desiredDirection = rotationDirection.value;

    if (moveDirection === 1) {
      desiredDirection = directionChangeState.value.smoothedCrossValue > 0 ? 1 : -1;
    } else {
      desiredDirection = directionChangeState.value.smoothedCrossValue < 0 ? -1 : 1;
    }

    const now = Date.now();
    const timeSinceLastChange = now - directionChangeState.value.lastDirectionChangeTime;
    const minTimeBetweenChanges =
      travelshopIntroStore.config.aircraft.directionChange.hysteresis.timeDelay;

    const hysteresisThreshold = inCriticalPoint
      ? travelshopIntroStore.config.aircraft.directionChange.hysteresis.threshold * 2
      : travelshopIntroStore.config.aircraft.directionChange.hysteresis.threshold;

    const crossDeviation = Math.abs(directionChangeState.value.smoothedCrossValue);

    if (desiredDirection !== rotationDirection.value) {
      if (
        crossDeviation > hysteresisThreshold &&
        timeSinceLastChange > minTimeBetweenChanges
      ) {
        directionChangeState.value.lastDirectionChangeTime = now;
        directionChangeState.value.lastStableCrossValue =
          directionChangeState.value.smoothedCrossValue;
        directionChangeState.value.lastStableDirection = desiredDirection;
        rotationDirection.value = desiredDirection;
        return desiredDirection;
      }
    } else {
      directionChangeState.value.lastStableCrossValue =
        directionChangeState.value.smoothedCrossValue;
    }

    if (inCriticalPoint) {
      return directionChangeState.value.lastStableDirection;
    }

    return rotationDirection.value;
  };

  const updateAircraft = (options: {
    deltaTime: number;
    currentEllipseCenter: EllipseCenter;
    currentEllipse: EllipseParams;
    isMouseOverCanvas: boolean;
    mousePosition: Point | null;
  }) => {
    const {
      deltaTime,
      currentEllipseCenter,
      currentEllipse,
      isMouseOverCanvas,
      mousePosition,
    } = options;

    if (!aircraft.value.isAnimating) return;

    const prevX = aircraft.value.x;
    const prevY = aircraft.value.y;

    updateAircraftVelocity();

    const angularSpeed =
      (2 * Math.PI) / travelshopIntroStore.config.aircraft.animationDuration;
    aircraftAngle.value += rotationDirection.value * angularSpeed * deltaTime;

    aircraftAngle.value =
      ((aircraftAngle.value % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    if (travelshopIntroStore.config.aircraft.directionChange.enabled) {
      rotationDirection.value = determineRotationDirection({
        currentEllipseCenter,
        currentEllipse,
        isMouseOverCanvas,
        mousePosition,
      });
    }

    aircraft.value.x =
      currentEllipseCenter.x +
      currentEllipse.semiMajorAxis * Math.cos(aircraftAngle.value);
    aircraft.value.y =
      currentEllipseCenter.y +
      currentEllipse.semiMinorAxis * Math.sin(aircraftAngle.value);

    const velocityX = aircraft.value.x - prevX;
    const velocityY = aircraft.value.y - prevY;
    const moveAngle = Math.atan2(velocityY, velocityX);

    aircraft.value.flipHorizontal = velocityX > 0 ? 1 : -1;

    let targetAngle = 0;
    if (travelshopIntroStore.config.aircraft.tilt.enabled) {
      if (aircraft.value.flipHorizontal === -1) {
        targetAngle = -moveAngle;
      } else {
        targetAngle = moveAngle;
      }

      if (targetAngle > Math.PI / 2) {
        targetAngle -= Math.PI;
      } else if (targetAngle < -Math.PI / 2) {
        targetAngle += Math.PI;
      }

      if (targetAngle > travelshopIntroStore.config.aircraft.tilt.maxAngle) {
        targetAngle = travelshopIntroStore.config.aircraft.tilt.maxAngle;
      } else if (targetAngle < -travelshopIntroStore.config.aircraft.tilt.maxAngle) {
        targetAngle = -travelshopIntroStore.config.aircraft.tilt.maxAngle;
      }
    }

    aircraft.value.targetTiltAngle = targetAngle;
    aircraft.value.tiltAngle +=
      (aircraft.value.targetTiltAngle - aircraft.value.tiltAngle) *
      travelshopIntroStore.config.aircraft.tilt.smoothFactor;
  };

  const drawAircraft = (ctx: CanvasRenderingContext2D, images: any) => {
    if (!ctx || !images.aircraft.complete) return;

    ctx.save();
    ctx.translate(aircraft.value.x, aircraft.value.y);

    if (aircraft.value.flipHorizontal === -1) {
      ctx.scale(-1, 1);
    }

    ctx.rotate(aircraft.value.tiltAngle);

    ctx.drawImage(
      images.aircraft,
      -aircraft.value.width / 2,
      -aircraft.value.height / 2,
      aircraft.value.width,
      aircraft.value.height,
    );

    ctx.restore();
  };

  return {
    aircraft,
    aircraftAngle,
    rotationDirection,
    aircraftVelocity,
    directionChangeState,
    lastAnimationUpdateTime,
    initAircraft,
    updateAircraft,
    drawAircraft,
  };
}
