export interface GradientOptions {
  shadow?: boolean;
}

export interface GradientColors {
  color: string;
  opacity: number;
  position: string;
}

export interface headerGradientOptions {
  useCustomColors: boolean;
  shape: 'ellipse' | 'circle';
  size: { width: string; height: string };
  position: string;
  colors?: Array<GradientColors>;
}
