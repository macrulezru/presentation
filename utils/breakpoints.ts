export const BREAKPOINTS = {
  tablet: 960,
  smallTablet: 850,
  bigMobile: 660,
  mobile: 600,
  smallMobile: 450,
} as const;

export const scssBreakpointsConfig = [
  `$breakpoint-tablet: ${BREAKPOINTS.tablet}px`,
  `$breakpoint-small-tablet: ${BREAKPOINTS.smallTablet}px`,
  `$breakpoint-big-mobile: ${BREAKPOINTS.bigMobile}px`,
  `$breakpoint-mobile: ${BREAKPOINTS.mobile}px`,
  `$breakpoint-small-mobile: ${BREAKPOINTS.smallMobile}px`,
].join(', ');
