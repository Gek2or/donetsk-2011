/* Donetsk 2011 · service worker (v4.1). Pages you open stay readable offline. */
const V='aacca4bc';
const CORE='d11-core-'+V,PAGES='d11-pages',IMG='d11-img',IMG_MAX=240;
const PRE=["offline.html", "assets/site.css?v=3a44e9f1", "assets/app.js?v=914f86ea", "assets/fonts/fonts.css", "icon-192.png", "assets/fonts/alegreya-normal-cyrillic.woff2", "assets/fonts/alegreya-normal-latin.woff2", "assets/fonts/literata-normal-cyrillic.woff2", "assets/fonts/literata-normal-latin.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('d11-core-')&&k!==CORE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const trim=async(name,max)=>{const c=await caches.open(name),ks=await c.keys();for(let i=0;i<ks.length-max;i++)await c.delete(ks[i])};
const put=(name,req,res)=>{if(res&&res.ok&&res.type==='basic'){const cl=res.clone();caches.open(name).then(c=>c.put(req,cl)).then(()=>name===IMG&&trim(IMG,IMG_MAX))}return res};
async function page(req){
  try{const res=await fetch(req);if(res.ok&&!res.redirected)put(PAGES,req.url.split('#')[0].split('?')[0],res.clone());return res}
  catch(err){const k=req.url.split('#')[0].split('?')[0];
    return (await caches.match(k,{ignoreSearch:true}))||(await caches.match(k.replace(/\/$/,'/index.html')))||(await caches.match(k.replace(/index\.html$/,'')))||caches.match('offline.html',{ignoreSearch:true})}}
async function first(name,req){const hit=await caches.match(req);if(hit)return hit;return put(name,req,await fetch(req))}
async function fresh(name,req){try{return put(name,req,await fetch(req))}catch(e){const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;throw e}}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  if(r.mode==='navigate'){e.respondWith(page(r));return}
  const p=u.pathname;
  if(/\/assets\/.+\?v=|\/assets\/fonts\//.test(p+u.search)){e.respondWith(first(CORE,r));return}
  if(/\/(photos|maps|img)\/.+\.(webp|jpe?g|png|svg)$/i.test(p)||/\/assets\/(og|hero|peek|press)\//.test(p)){e.respondWith(first(IMG,r));return}
  e.respondWith(fresh(PAGES,r))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
