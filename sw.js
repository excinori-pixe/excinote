// 앱 화면 오프라인 캐시 (노트 데이터는 IndexedDB에 별도 보관)
// 네트워크 우선: 새 버전을 배포하면 다음 접속부터 바로 반영되고, 오프라인일 때만 캐시 사용
const V = 'excinote-v23';
const SHELL = ['./', './index.html', './app.js', './style.css', './config.js', './manifest.webmanifest', './icon.svg', './icon-32.png', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './legal.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const same = u.origin === self.location.origin;
  if (!same && u.hostname !== 'cdn.jsdelivr.net') return; // Google 로그인, Drive API 요청은 절대 캐시하지 않음
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && r.type !== 'opaque') {
          const copy = r.clone();
          caches.open(V).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: same }).then((hit) => hit || caches.match('./index.html')))
  );
});
