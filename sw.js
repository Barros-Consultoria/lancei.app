/* LanceiApp: guarda as telas no aparelho para abrir na hora e funcionar sem internet. */
const VERSAO = 'lancei-poc-1';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // dados (Apps Script) e fontes: direto na rede
  e.respondWith(caches.open(VERSAO).then(c => c.match(e.request, { ignoreSearch: true }).then(guardado => {
    const rede = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado);
    return guardado || rede;      // responde com o que está guardado e atualiza em segundo plano
  })));
});
