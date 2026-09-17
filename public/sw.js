// public/sw.js
const CACHE_NAME = 'music-schulte-v1.0.0'
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/'
]

// Установка SW и кэширование
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Кэш открыт')
                return cache.addAll(urlsToCache)
            })
            .catch(err => {
                console.log('SW: Ошибка кэширования', err)
            })
    )
    // Принудительная активация нового SW
    self.skipWaiting()
})

// Активация и удаление старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Удаление старого кэша', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Стратегия: Network First для HTML, Cache First для ассетов
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)

    // HTML файлы - всегда с сети
    if (event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        )
        return
    }

    // Ассеты - из кэша, если есть
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response
                }
                return fetch(event.request).then(fetchResponse => {
                    if (fetchResponse && fetchResponse.status === 200) {
                        const responseClone = fetchResponse.clone()
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone)
                        })
                    }
                    return fetchResponse
                })
            })
    )
})