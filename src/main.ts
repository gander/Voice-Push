import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')

// Initialize Feather icons after mount
app.config.globalProperties.$nextTick(() => {
  if (window.feather) {
    window.feather.replace()
  }
})

declare global {
  interface Window {
    feather: any
  }
}
