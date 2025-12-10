export const ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1199,
} as const

export type Breakpoint = keyof typeof ResponsiveBreakpoints

export type MediaQueryType = 'max-width' | 'min-width'

export interface MediaQueryConfig {
  type: MediaQueryType
  value: number
}

export const ResponsiveConfig: Record<Breakpoint, MediaQueryConfig> = {
  mobile: {
    type: 'max-width',
    value: ResponsiveBreakpoints.mobile,
  },
  tablet: {
    type: 'max-width',
    value: ResponsiveBreakpoints.tablet,
  },
  desktop: {
    type: 'min-width',
    value: ResponsiveBreakpoints.tablet + 1,
  },
} as const
