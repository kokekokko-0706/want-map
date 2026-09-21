const CACHE='want-map-v29';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  const isCore=/\/index\.html$|\/manifest\.webmanifest$|\/icon-(180|512)\.png$|\/sw\.js$/.test(u.pathname);
  if(isCore){
    e.respondWith(fetch(e.request).then(res=>{
      const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return res;
    }).catch(()=>caches.match('./index.html'))));
  }
});
