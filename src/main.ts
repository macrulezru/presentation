import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/main.css'

import App from '@/App.vue'
import router from '@/router'
import i18nPlugin from '@/plugins/i18n'

const app = createApp(App)

app.use(createPinia()).use(router).use(i18nPlugin)

app.mount('#app')
