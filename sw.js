// ???붾㈃ ?ㅽ봽?쇱씤 罹먯떆 (?명듃 ?곗씠?곕뒗 IndexedDB??蹂꾨룄 蹂닿?)
// ?ㅽ듃?뚰겕 ?곗꽑: ??踰꾩쟾??諛고룷?섎㈃ ?ㅼ쓬 ?묒냽遺??諛붾줈 諛섏쁺?섍퀬, ?ㅽ봽?쇱씤???뚮쭔 罹먯떆 ?ъ슜
const V = 'excinote-v13';
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
  if (!same && u.hostname !== 'cdn.jsdelivr.net') return; // Google 濡쒓렇?? Drive API ?붿껌? ?덈? 罹먯떆?섏? ?딆쓬
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
