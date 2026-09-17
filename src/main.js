import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import { APP_VERSION } from './version'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Проверка обновлений при загрузке
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW зарегистрирован:', APP_VERSION)

                // Проверяем обновления каждые 5 минут
                setInterval(() => {
                    registration.update()
                }, 5 * 60 * 1000)
            })
            .catch(error => {
                console.log('SW регистрация не удалась:', error)
            })
    })
}

// Принудительная перезагрузка при обновлении
let refreshing = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
})