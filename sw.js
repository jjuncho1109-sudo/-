const CACHE_NAME = 'biteuro-v3';
const STATIC_ASSETS = [
    '/',
    '/static/style.css',
    '/static/script.js',
    '/api/safety_data',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&family=Outfit:wght@500;700;900&display=swap'
];

// 설치 시 정적 자산 캐시
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
            );
        })
    );
    self.skipWaiting();
});

// 활성화 시 오래된 캐시 정리
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 네트워크 요청 가로채기: Network First → Cache Fallback
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 지도 타일은 캐시 우선 (오프라인 지도 표시)
    if (url.hostname.includes('tile.openstreetmap') || url.hostname.includes('cartocdn') || url.hostname.includes('basemaps')) {
        event.respondWith(
            caches.open('map-tiles-v1').then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(res => {
                        cache.put(event.request, res.clone());
                        return res;
                    }).catch(() => cached);
                })
            )
        );
        return;
    }

    // API 데이터 및 정적 파일: Network First → Cache Fallback
    event.respondWith(
        fetch(event.request).then(res => {
            if (res.ok) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
            }
            return res;
        }).catch(() => caches.match(event.request))
    );
});
