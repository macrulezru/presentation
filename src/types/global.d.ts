import type * as UseI18nModule from '@/view/composables/use-i18n';

// Делаем useI18n глобально доступным
declare global {
  const useI18n: typeof UseI18nModule.useI18n;

  interface Window {
    ymaps: typeof ymaps;
  }
}
