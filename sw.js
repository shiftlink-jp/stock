// 在庫管理アプリの Service Worker
// アプリの読み込みを高速化し、オフラインでも起動できるようにする。
// ※ ntfy への通知配信やフォント取得(別オリジン)はキャッシュせず、常にネットワークへ。
const CACHE = "oheart-stock-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 一部ファイルが無くても install を失敗させない
    await Promise.allSettled(ASSETS.map(url => cache.add(url)));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 別オリジン(ntfy.sh / fonts.googleapis.com など)はそのままネットワークへ
  if (url.origin !== location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    } catch (e) {
      // オフライン時はアプリ本体を返す
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
      throw e;
    }
  })());
});
