export const ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1199,
} as const

export type Breakpoint = keyof typeof ResponsiveBreakpoints

export enum MediaQueryEnum {
  MAX_WIDTH = 'max-width',
  MIN_WIDTH = 'min-width',
}

export type MediaQueryType = (typeof MediaQueryEnum)[keyof typeof MediaQueryEnum]

export interface MediaQueryConfig {
  type: MediaQueryType
  value: number
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
} as const
