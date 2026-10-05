const CACHE_NAME='want-map-shell-v166';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png','./check.js'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('want-map-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  const url=new URL(request.url);
  const sameOrigin=url.origin===self.location.origin;
  const leafletCdn=url.origin==='https://unpkg.com' && url.pathname.startsWith('/leaflet@1.9.4/');

  if(request.mode==='navigate' && sameOrigin){
    event.respondWith(
      fetch(request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
        }
        return response;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(sameOrigin){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached)return cached;
        return fetch(request).then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          }
          return response;
        });
      })
    );
    return;
  }

  if(leafletCdn){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached)return cached;
        return fetch(request).then(response=>{
          if(response.ok || response.type==='opaque'){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          }
          return response;
        });
      })
    );
  }
});
