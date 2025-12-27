import type { Velocity } from './types';

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: {
    color?: string;
    lineWidth?: number;
    arrowLength?: number;
    arrowAngle?: number;
    dash?: number[];
  } = {},
) => {
  const {
    color = 'white',
    lineWidth = 1,
    arrowLength = 10,
    arrowAngle = Math.PI / 6,
    dash = [],
  } = options;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  if (dash.length > 0) {
    ctx.setLineDash(dash);
  }

  // Линия
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Стрелка
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - arrowLength * Math.cos(angle - arrowAngle),
    toY - arrowLength * Math.sin(angle - arrowAngle),
  );
  ctx.lineTo(
    toX - arrowLength * Math.cos(angle + arrowAngle),
    toY - arrowLength * Math.sin(angle + arrowAngle),
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

export const isInCriticalPoint = (angle: number, buffer: number): boolean => {
  const criticalAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI * 2];

  for (const criticalAngle of criticalAngles) {
    const diff = Math.abs(angle - criticalAngle);
    const normalizedDiff = Math.min(diff, Math.PI * 2 - diff);

    if (normalizedDiff < buffer) {
      return true;
    }
  }

  return false;
};

export const getAircraftMoveDirection = (
  velocity: Velocity,
  velocityThreshold: number,
  fallbackDirection: number,
): number => {
  if (Math.abs(velocity.x) > velocityThreshold) {
    return velocity.x > 0 ? 1 : -1;
  }

  return fallbackDirection;
};
