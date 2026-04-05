const CACHE_NAME = 'keitarooo-portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/cube.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/icon.svg',
  '/assets/css/normalize.css',
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/assets/js/webgl-fallback.js',
  '/assets/js/webgl-shaders.js',
  '/assets/js/webgl-particles.js',
  '/assets/js/webgl-3d.js',
  '/shaders/vertex.glsl',
  '/shaders/fragment.glsl'
];

// Service Workerのインストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// リクエストのインターセプト
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }

        // chrome-extensionリクエストはキャッシュしない
        if (event.request.url.startsWith('chrome-extension://')) {
          return fetch(event.request);
        }

        // ネットワークから取得
        return fetch(event.request).then(
          response => {
            // 有効なレスポンスかチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをキャッシュに保存
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 古いキャッシュのクリーンアップ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
