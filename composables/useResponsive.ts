import { shallowReactive } from 'vue';

type ResponsiveState = {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
};

const mediaQueries = {
  mobile: '(max-width: 600px)',
  tablet: '(max-width: 960px)',
  desktop: '(min-width: 961px)',
} as const;

const state = shallowReactive<ResponsiveState>({
  mobile: false,
  tablet: false,
  desktop: true,
});

let initialized = false;

function initOnClient() {
  if (initialized) return;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

  initialized = true;

  (Object.keys(mediaQueries) as Array<keyof typeof mediaQueries>).forEach(key => {
    const mql = window.matchMedia(mediaQueries[key]);

    const apply = () => {
      state[key] = mql.matches;
    };

    apply();
    mql.addEventListener('change', apply);
  });
}

export function getResponsiveMediaQueries() {
  return { ...mediaQueries };
}

export function useResponsive() {
  if (!import.meta.env.SSR) {
    initOnClient();
  }

  return state;
}

