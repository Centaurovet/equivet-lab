const CACHE = "equivet-lab-v2";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-512.png",
  "./icon-192.png",
  "./icon-180.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
];

// Instala e faz cache dos arquivos essenciais
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // allSettled: a falha de um arquivo (ex.: CDN fora do ar) nao impede a instalacao
      .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

// Remove caches antigos ao ativar nova versao
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// APIs (Supabase, backend Railway) e nao-GET: rede-primeiro, nunca cache.
// Evita servir HTML do cache numa chamada de API (res.json() quebraria).
// Resto (app shell, fontes): cache primeiro, rede como fallback.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  if (e.request.method !== "GET"
      || url.hostname.includes("supabase.co")
      || url.hostname.includes("anthropic.com")
      || url.hostname.includes("railway.app")) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(
        JSON.stringify({error: "offline"}),
        {status: 503, headers: {"Content-Type":"application/json"}}
      ))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === "opaque") return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
