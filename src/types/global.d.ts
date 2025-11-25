import { useI18n } from '@/composables/useI18n'

// Делаем useI18n глобально доступным
declare global {
  const useI18n: typeof useI18n
}
