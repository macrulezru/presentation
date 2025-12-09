import { useI18n } from '@/view/composables/use-i18n.ts'

// Делаем useI18n глобально доступным
declare global {
  const useI18n: typeof useI18n
}
