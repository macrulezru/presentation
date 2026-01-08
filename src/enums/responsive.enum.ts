export const ResponsiveBreakpoints = {
  mobile: 600,
  tablet: 960,
  desktop: 961,
} as const;

export type Breakpoint = keyof typeof ResponsiveBreakpoints;

export enum MediaQueryEnum {
  MAX_WIDTH = 'max-width',
  MIN_WIDTH = 'min-width',
}

export type MediaQueryType = (typeof MediaQueryEnum)[keyof typeof MediaQueryEnum];

export interface MediaQueryConfig {
  type: MediaQueryType;
  value: number;
}

export const ResponsiveConfig: Record<Breakpoint, MediaQueryConfig> = {
  mobile: {
    type: MediaQueryEnum.MAX_WIDTH,
    value: ResponsiveBreakpoints.mobile,
  },
  tablet: {
    type: MediaQueryEnum.MAX_WIDTH,
    value: ResponsiveBreakpoints.tablet,
  },
  desktop: {
    type: MediaQueryEnum.MIN_WIDTH,
    value: ResponsiveBreakpoints.tablet + 1,
  },
} as const;

export const PictureResponsiveBreakpoints = {
  mobile: `(${ResponsiveConfig.mobile.type}: ${ResponsiveConfig.mobile.value}px)`,
  tablet: `(${ResponsiveConfig.tablet.type}: ${ResponsiveConfig.tablet.value}px)`,
  desktop: `(${ResponsiveConfig.desktop.type}: ${ResponsiveConfig.desktop.value}px)`,
} as const;
