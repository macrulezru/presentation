/**
 * SSR-safe wrapper around responsive-media.
 * On server returns a stub; on client dynamically imports the real module
 * so that code using `window` never runs during SSR.
 */
import { onMounted, ref } from 'vue';

const STUB = { mobile: false, tablet: false, desktop: true } as const;

export function useResponsive() {
  const state = ref<typeof STUB & Record<string, boolean>>({ ...STUB });

  if (import.meta.env.SSR) {
    return state;
  }

  onMounted(() => {
    import('responsive-media').then((m) => {
      state.value = m.useResponsive() as typeof state.value;
    });
  });

  return state;
}

export function getResponsiveMediaQueries() {
  const state = ref<Record<string, string>>({});
  if (import.meta.env.SSR) return state;
  onMounted(() => {
    import('responsive-media').then((m) => {
      state.value = m.getResponsiveMediaQueries?.() ?? {};
    });
  });
  return state;
}
