export const ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1199,
} as const

export type Breakpoint = keyof typeof ResponsiveBreakpoints
