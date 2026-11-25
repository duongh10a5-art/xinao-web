/* 洗脑背刺 离线缓存 v9-13
   ★ 修「刷新之后还是旧版」：页面本身（HTML）强制回源，不吃任何缓存
   其它静态资源仍然网络优先、断网用缓存 */
var CACHE = 'xw-v9-13';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = req.url || '';
  if (u.indexOf('api.github.com') >= 0 || u.indexOf('gist.github.com') >= 0) return;

  var isNav = req.mode === 'navigate'
    || req.destination === 'document'
    || ((req.headers.get('accept') || '').indexOf('text/html') >= 0);

  if (isNav) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then(function (res) {
        var cp = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', cp).catch(function () {}); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(function (res) {
      var cp = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, cp).catch(function () {}); });
      return res;
    }).catch(function () { return caches.match(req); })
  );
});