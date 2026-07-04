// 在庫管理アプリの Service Worker
// アプリの読み込みを高速化し、オフラインでも起動できるようにする。
// ※ ntfy への通知配信やフォント取得(別オリジン)はキャッシュせず、常にネットワークへ。
const CACHE = "oheart-stock-v6";
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

// ===== Web Push: 通知を受信して表示する =====
self.addEventListener("push", event => {
  let data = { title: "在庫通知", body: "" };
  try { if (event.data) data = event.data.json(); }
  catch (e) { if (event.data) data = { title: "在庫通知", body: event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || "在庫通知", {
    body: data.body || "",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: "oheart-stock",
    renotify: true,
    data: data,
  }));
});

// 通知をタップしたらアプリを前面に出す(なければ開く)
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes("/stock") && "focus" in c) return c.focus();
    }
    if (clients.openWindow) return clients.openWindow("./");
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 別オリジン(配達サーバー / fonts.googleapis.com など)はそのままネットワークへ
  if (url.origin !== location.origin) return;

  // アプリ本体(HTML)はネットワーク優先 = 常に最新を表示。オフライン時のみキャッシュ。
  const isDoc = req.mode === "navigate" || req.destination === "document"
    || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  if (isDoc) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      } catch (e) {
        return (await caches.match(req)) || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // その他(アイコン等)はキャッシュ優先 = 高速表示
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    } catch (e) {
      return (await caches.match("./index.html")) || Response.error();
    }
  })());
});
