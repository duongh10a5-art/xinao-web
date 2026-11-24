/* 洗脑背刺 离线缓存：联网优先拿最新，断网用缓存 */
var CACHE = 'xw-v9-11';
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(['./', './index.html', './icon-180.png']).catch(function(){});
  }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var cp = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, cp).catch(function(){}); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match('./index.html');
      });
    })
  );
});
