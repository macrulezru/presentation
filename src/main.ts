import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/styles/reset.css'
import '@/styles/variables.css'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia()).use(router)

app.mount('#app')
