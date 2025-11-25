import { type App } from 'vue'
import { i18n } from '@/locales'
import { useI18n as useI18nComposable } from '@/composables/useI18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof i18n.global.t
    $te: typeof i18n.global.te
    $d: typeof i18n.global.d
    $n: typeof i18n.global.n
  }
}

export default {
  install: (app: App) => {
    app.use(i18n)

    // Глобальные методы для Options API
    app.config.globalProperties.$t = i18n.global.t
    app.config.globalProperties.$te = i18n.global.te
    app.config.globalProperties.$d = i18n.global.d
    app.config.globalProperties.$n = i18n.global.n

    // Делаем useI18n глобально доступным для Composition API
    app.config.globalProperties.useI18n = useI18nComposable
  },
}
