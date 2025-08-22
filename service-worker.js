const CACHE = 'openhabits-cache-v2';
const ROOT = self.registration.scope; // base URL, good for GitHub Pages subpath
const INDEX = ROOT + 'index.html';
const ASSETS = [
  INDEX,
  ROOT + 'styles.css',
  ROOT + 'manifest.webmanifest',
  ROOT + 'src/app.js',
  ROOT + 'src/ui.js',
  ROOT + 'src/models.js',
  ROOT + 'src/rewards.js',
  ROOT + 'src/storage.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=> caches.delete(k)))).then(()=> self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).catch(()=> caches.match(INDEX)).then(resp=> resp || caches.match(INDEX))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(()=> caches.match(INDEX)))
  );
});
