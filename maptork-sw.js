const MAPTORK_IMAGE_CACHE = 'maptork-images-v3';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil((async function() {
    const nomes = await caches.keys();
    await Promise.all(nomes.map(function(nome) {
      if (nome.startsWith('maptork-images-') && nome !== MAPTORK_IMAGE_CACHE) {
        return caches.delete(nome);
      }
      return Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

function ehRequisicaoDeImagem(request) {
  if (!request || request.method !== 'GET') return false;
  if (request.destination === 'image') return true;
  try {
    const url = new URL(request.url);
    if (/\.(?:png|jpe?g|webp|gif|svg|avif)(?:$|\?)/i.test(url.pathname + url.search)) return true;
    return /(?:googleusercontent\.com|drive\.google\.com|drive\.usercontent\.google\.com|ytimg\.com)$/i.test(url.hostname);
  } catch (e) {
    return false;
  }
}

async function responderImagem(request) {
  const cache = await caches.open(MAPTORK_IMAGE_CACHE);
  const salva = await cache.match(request, { ignoreVary: true });
  if (salva) return salva;

  try {
    const resposta = await fetch(request);
    if (resposta && (resposta.ok || resposta.type === 'opaque')) {
      try { await cache.put(request, resposta.clone()); } catch (e) {}
    }
    return resposta;
  } catch (erro) {
    const fallback = await cache.match(request, { ignoreSearch: false, ignoreVary: true });
    if (fallback) return fallback;
    throw erro;
  }
}

self.addEventListener('fetch', function(event) {
  if (!ehRequisicaoDeImagem(event.request)) return;
  event.respondWith(responderImagem(event.request));
});

self.addEventListener('message', function(event) {
  const dados = event && event.data;
  if (!dados || dados.type !== 'MAPTORK_CLEAR_IMAGE_CACHE') return;
  event.waitUntil(caches.delete(MAPTORK_IMAGE_CACHE));
});
