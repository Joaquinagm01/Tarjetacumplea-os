// Compatibility polyfills for broader browser support
;(function(){
  if(!window.requestAnimationFrame){
    window.requestAnimationFrame = function(cb){ return setTimeout(function(){ cb(Date.now()) }, 16); };
    window.cancelAnimationFrame = function(id){ clearTimeout(id); };
  }

  if(typeof Element !== 'undefined'){
    if(!Element.prototype.matches){
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector || function(selector){
        var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
        var i = 0;
        while(i < matches.length && matches[i] !== this) i++;
        return Boolean(matches[i]);
      };
    }

    if(!Element.prototype.closest){
      Element.prototype.closest = function(selector){
        var el = this;
        while(el && el.nodeType === 1){ if(el.matches(selector)) return el; el = el.parentElement || el.parentNode; }
        return null;
      };
    }
  }

  if(typeof NodeList !== 'undefined' && !NodeList.prototype.forEach){ NodeList.prototype.forEach = Array.prototype.forEach; }
})();

// Debug overlay helper: visible box listing GIF URLs and errors (helps diagnose hotlink/CSP/CORS issues)
function ensureCapyDebug(){
  try{
    if(typeof document === 'undefined') return
    if(document.getElementById('capy-debug')) return
    const d = document.createElement('div')
    d.id = 'capy-debug'
    d.style.position = 'fixed'
    d.style.left = '8px'
    d.style.bottom = '8px'
    d.style.zIndex = '99999'
    d.style.background = 'rgba(0,0,0,0.7)'
    d.style.color = '#fff'
    d.style.padding = '8px 10px'
    d.style.fontSize = '12px'
    d.style.borderRadius = '8px'
    d.style.maxWidth = '360px'
    d.style.maxHeight = '40vh'
    d.style.overflow = 'auto'
    d.style.lineHeight = '1.2'
    d.innerText = 'Capy GIF debug:'
    document.body.appendChild(d)
  }catch(e){}
}
function capyDebugAdd(msg){ try{ ensureCapyDebug(); const el = document.createElement('div'); el.textContent = msg; document.getElementById('capy-debug').appendChild(el) }catch(e){} }

// Simple interactions for the Faustina invitation (clean)
(() => {
  const confettiBtn = document.getElementById('confettiBtn')
  const musicBtn = document.getElementById('musicBtn')
  const canvas = document.getElementById('confetti-canvas')
  const audio = document.getElementById('bg-audio')

  // Confetti canvas setup
  if(canvas){
    canvas.width = innerWidth; canvas.height = innerHeight
    window.addEventListener('resize', ()=>{ canvas.width = innerWidth; canvas.height = innerHeight })
    const ctx = canvas.getContext('2d')
    function random(min,max){return Math.random()*(max-min)+min}
    function launchConfetti(count){
      // default to adaptive count helper if not provided
      if(typeof count === 'undefined' || count === null) count = (window._getConfettiCount && typeof window._getConfettiCount === 'function') ? window._getConfettiCount() : 80
      const pieces=[]
      for(let i=0;i<count;i++) pieces.push({x:random(0,canvas.width),y:random(-50,canvas.height/2),vx:random(-2,2),vy:random(1,6),size:random(6,12),color:`hsl(${Math.floor(random(0,360))} 80% 60%)`,rot:random(0,360),vr:random(-6,6)})
      let t=0
      let lastTs = 0
      const minDelta = 1000 / 40 // target 40 FPS
      function draw(ts){
        if(!ts) ts = performance.now()
        if(lastTs && (ts - lastTs) < minDelta){ requestAnimationFrame(draw); return }
        lastTs = ts
        ctx.clearRect(0,0,canvas.width,canvas.height)
        for(const p of pieces){p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.rot+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore()}
        t++
        if(t<220) requestAnimationFrame(draw)
        else ctx.clearRect(0,0,canvas.width,canvas.height)
      }
      requestAnimationFrame(draw)
    }
    if(confettiBtn) confettiBtn.addEventListener('click', ()=>{
      launchConfetti(120)
      playConfettiSound()
    })
    // prefer worker-based confetti when supported
    let confettiWorker = null
    let workerCanvasAttached = false
    const startWorkerConfetti = (count)=>{
      try{
        if(window.OffscreenCanvas && window.Worker){
          if(!confettiWorker){
            confettiWorker = new Worker('/js/confetti-worker.js')
          }
          if(!workerCanvasAttached){
            const off = canvas.transferControlToOffscreen()
            confettiWorker.postMessage({ type: 'init', canvas: off, width: canvas.width, height: canvas.height, count }, [off])
            workerCanvasAttached = true
          } else {
            confettiWorker.postMessage({ type: 'burst', count })
          }
        } else {
          // fallback to main-thread burst
          launchConfetti(count)
        }
      }catch(e){ launchConfetti(count) }
    }
  }

  // Music toggle
  if(musicBtn && audio){
    musicBtn.addEventListener('click', ()=>{
      if(audio.paused){ audio.play().catch(()=>{}); musicBtn.setAttribute('aria-pressed','true'); musicBtn.textContent='Pausar música' }
      else{ audio.pause(); musicBtn.setAttribute('aria-pressed','false'); musicBtn.textContent='Reproducir música' }
    })
  }

  // friendly focus outline for keyboard
  document.addEventListener('keydown', (e)=>{ if(e.key==='Tab') document.body.classList.add('show-focus') })
})()
// Element references
const playBtn = document.getElementById('playBtn')
const confettiBtn = document.getElementById('confettiBtn')
const balloonsBtn = document.getElementById('balloonsBtn')
const audio = document.getElementById('bg-audio')
const canvas = document.getElementById('confetti-canvas')
const capy = document.getElementById('capy')

if(playBtn) playBtn.addEventListener('click', ()=>{
  if(audio.paused){ audio.play(); playBtn.textContent='Pausar música' } else { audio.pause(); playBtn.textContent='Reproducir música' }
})

if(confettiBtn) confettiBtn.addEventListener('click', ()=> launchConfetti(200))
if(balloonsBtn) balloonsBtn.addEventListener('click', ()=> spawnBalloons(8))

// capibara animation
const capyBtn = document.getElementById('capyBtn')
if(capyBtn && capy){
  capyBtn.addEventListener('click', ()=>{
    // target element: either the original #capy element or replaced one
    const target = window.capyCurrent || capy
    if(!target) return
    // remove movement classes then add to retrigger
    target.classList.remove('capy-sip','capy-nod','capy-move','capy-bob')
    void target.offsetWidth
    // do sip/nod and movement together
    target.classList.add('capy-sip')
    target.classList.add('capy-move')
    setTimeout(()=>{
      target.classList.remove('capy-sip')
      target.classList.add('capy-nod')
      target.classList.add('capy-bob')
    }, 900)
    // remove movement classes after animation completes
    setTimeout(()=>{
      target.classList.remove('capy-move','capy-bob','capy-nod')
    }, 2600)
    // tiny sip sound
    playTinySound()
    // if it's a lottie-player, try play+go to start
    try{
      if(target.tagName && target.tagName.toLowerCase()==='lottie-player'){
        target.stop()
        target.play()
      } else {
        // if wrapper contains lottie-player
        const lott = target.querySelector && target.querySelector('lottie-player')
        if(lott){ lott.stop(); lott.play() }
      }
    }catch(e){/* ignore */}
  })
}

// Giphy API integration for capybara GIFs
const GIPHY_API_KEY = 'gZgC7NyM64gMmfU0yuXhn71Li6TKDQsO'

function loadCapyGifs() {
  // Array of specific capybara GIF URLs
  const gifUrls = [
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcThvNTE1eHlud3ptaG5jN21rcXkzbmx5b3dvdW1vcTNnN254dHNwMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/6KUIzbuGN2PDrfKA4H/giphy.gif',
  'https://media.giphy.com/media/zNTrlsMxLVANIGBmgr/giphy.gif?cid=790b7611d22af94741bc54fc74190bcc68d0b72dd6ce74de&ep=v1_user_favorites&rid=giphy.gif&ct=s'
  ]

  // Array of placeholder IDs (trimmed: removed location-capy and details-capy per user request)
  const placeholders = ['hero-capy']

  // Specific gif override for the invitation date placeholder (user-requested GIF)
  const forcedDateGif = 'https://media.giphy.com/media/LWSk9E1XyaPncDqlRr/giphy.gif?cid=790b7611d22af94741bc54fc74190bcc68d0b72dd6ce74de&ep=v1_user_favorites&rid=giphy.gif&ct=s'
  // Additional forced GIF for the invitation main capy area
  // prefer local copy to avoid hotlink/CSP issues on some hosts (added by agent)
  const forcedCapyGif = '/media/XnUqczw4HRtdVk5HWe.gif'

  // Hybrid lazy-load: load first N immediately, observe the rest
  // Increase immediate to cover hero + invitation + date for smoother first paint
  // For user request: force immediate load of all GIFs (no lazy-load) to ensure placeholders show content
  const IMMEDIATE = Infinity
  const observer = null

  // choose unique URLs to avoid repetition in the invitation
  const used = new Set()
  function pickGifForIndex(idx, placeholderId){
    // prefer forcedDateGif for date-capy if available and not used
    if(placeholderId === 'date-capy' && forcedDateGif){
      if(!used.has(forcedDateGif)) { used.add(forcedDateGif); return forcedDateGif }
      // if forced is already used, fall through to choose next unique
    }
    // try to pick a gifUrls entry not used yet
    for(let i=0;i<gifUrls.length;i++){
      const candidate = gifUrls[i]
      if(!used.has(candidate)) { used.add(candidate); return candidate }
    }
    // fallback: return null so caller can decide (no unique left)
    return null
  }

  placeholders.forEach((placeholderId, index) => {
    const placeholder = document.getElementById(placeholderId)
    if(!placeholder) return
  // do not overwrite fixed placeholders (e.g., hero-capy with manual content)
  if(placeholder.getAttribute && placeholder.getAttribute('data-fixed') === 'true') return
    // User requested: remove GIFs for the last two placeholders (location and details)
    if(placeholderId === 'location-capy' || placeholderId === 'details-capy'){
      placeholder.innerHTML = '<div style="color:#666;font-size:14px">Información próximamente</div>'
      return
    }
    placeholder.setAttribute('data-idx', String(index))
    // show small loading indicator
    placeholder.innerHTML = '<div style="color:#666;font-size:14px">Cargando capy...</div>'
    const chosen = pickGifForIndex(index, placeholderId)
    if(!chosen){
      // no unique GIF left: leave placeholder minimal or use a gentle static fallback
      placeholder.innerHTML = '<div style="color:#666;font-size:14px">Capy pronto</div>'
      return
    }
    // If element is within an expanded margin, load immediately to avoid missed last items
    const inProximity = (el, margin=800) => {
      try{
        const r = el.getBoundingClientRect()
        return (r.top <= (window.innerHeight + margin)) && (r.bottom >= -margin)
      }catch(e){ return false }
    }

    if(index < IMMEDIATE || inProximity(placeholder, 800)){
  // force immediate load for all placeholders
  loadImageIntoPlaceholder(placeholder, chosen)
    } else if(observer){
      // store chosen on placeholder so observer can load it
      placeholder._chosenSrc = chosen
      observer.observe(placeholder)
    } else {
      // fallback immediate
  loadImageIntoPlaceholder(placeholder, chosen)
    }
  })

  // Ensure the main invitation capy area (`#capy`) shows the requested GIF
  try{
    const mainCapy = document.getElementById('capy')
    if(mainCapy && forcedCapyGif){
      // show a small loading hint then load the image/video into that element
      mainCapy.innerHTML = '<div style="color:#666;font-size:14px">Cargando capy...</div>'
  // force main capy to load immediately
  loadImageIntoPlaceholder(mainCapy, forcedCapyGif)
    }
  }catch(e){ /* ignore if DOM not ready */ }

  function loadImageIntoPlaceholder(placeholder, src){
    // Try to prefer video variants (.mp4, .webm) and use posters if available.
    const headExists = async (url) => {
        try{
          // avoid firing HEAD requests to external origins that often reject HEAD (e.g., giphy CDN)
          const u = new URL(url, window.location.href)
          if(u.origin !== window.location.origin){
            // skip cross-origin HEAD checks; assume no poster/video unless hosted on same origin
            return false
          }
          const r = await fetch(u.href, { method: 'HEAD' })
          return r && r.ok
        }catch(e){ return false }
    }

    const preferVideo = async () => {
      try{
        const urlObj = new URL(src, window.location.href)
  // if source is a local media file we avoid probing for .mp4/.webm variants
  if(urlObj.pathname.indexOf('/media/') === 0) return null
        const base = urlObj.pathname.replace(/\.[^.]+$/, '')
        const origin = urlObj.origin
        const candidates = [ origin + base + '.mp4', origin + base + '.webm' ]
        for(const c of candidates){
          if(await headExists(c)) return c
        }
      }catch(e){/*ignore*/}
      return null
    }

    const findPoster = async () => {
      try{
        const urlObj = new URL(src, window.location.href)
  // skip poster probing for local media files
  if(urlObj.pathname.indexOf('/media/') === 0) return null
        const base = urlObj.pathname.replace(/\.[^.]+$/, '')
        const origin = urlObj.origin
        const posters = [ origin + base + '-poster.webp', origin + base + '-poster.jpg' ]
        for(const p of posters){ if(await headExists(p)) return p }
      }catch(e){/*ignore*/}
      return null
    }

    (async ()=>{
      const vsrc = await preferVideo()
      const poster = await findPoster()
      if(vsrc){
        const v = document.createElement('video')
        v.src = vsrc
        v.autoplay = false
        v.loop = true
        v.muted = true
        v.playsInline = true
        v.poster = poster || src
        v.style.maxWidth = '100%'
        v.style.height = 'auto'
        v.oncanplay = ()=>{
          placeholder.innerHTML = ''
          if(placeholder.classList.contains('capy-large')){
            const w=document.createElement('div'); w.style.width='100%'; w.style.height='100%'; w.style.display='flex'; w.style.alignItems='center'; w.style.justifyContent='center'; w.appendChild(v); placeholder.appendChild(w)
          } else placeholder.appendChild(v)
        }
        v.onerror = ()=>{ placeholder.innerHTML = '<span style="color: #666;">Capybara</span>' }
      } else {
        const img = document.createElement('img')
        img.loading = 'lazy'
        img.src = src
        img.alt = 'Capybara animada'
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        img.style.borderRadius = '10px'
        img.onload = ()=>{ placeholder.innerHTML = ''; if(placeholder.classList.contains('capy-large')){ const w=document.createElement('div'); w.style.width='100%'; w.style.height='100%'; w.style.display='flex'; w.style.alignItems='center'; w.style.justifyContent='center'; w.appendChild(img); placeholder.appendChild(w) } else placeholder.appendChild(img) }
  img.onerror = ()=>{
        // default placeholder text
        placeholder.innerHTML = '<span style="color: #666;">Capybara</span>';
        try{ capyDebugAdd('Image failed to load: '+src) }catch(e){}
        // If the failed source is a Giphy-hosted URL, attempt to insert a reliable Giphy iframe embed as a fallback.
        try{
          const u = new URL(src, window.location.href)
          const host = u.hostname || ''
          if(/giphy.com|giphycdn.com/.test(host) || src.indexOf('giphy.com') !== -1){
            // extract media id from common Giphy URL shapes: /media/:id/ or /gifs/:slug-:id
            let id = null
            const m1 = src.match(/\/media\/([^\/]+)\//)
            const m2 = src.match(/-([A-Za-z0-9]{6,})\.gif/) // fallback pattern
            if(m1 && m1[1]) id = m1[1]
            else if(m2 && m2[1]) id = m2[1]
            // if we have an id, create an iframe embed which is more likely to render on platforms that alter direct image requests
            if(id){
              const iframe = document.createElement('iframe')
              iframe.src = 'https://giphy.com/embed/' + id
              iframe.width = '100%'
              iframe.style.border = '0'
              iframe.setAttribute('frameBorder','0')
              iframe.setAttribute('allowFullScreen','')
              iframe.style.borderRadius = '10px'
              // keep a reasonable default height; if placeholder is capy-large try to fill it
              iframe.style.height = placeholder.classList.contains('capy-large') ? '100%' : '360px'
              // clear and insert iframe
              placeholder.innerHTML = ''
              placeholder.appendChild(iframe)
              try{ capyDebugAdd('Inserted Giphy iframe fallback for id: '+id) }catch(e){}
            }
          }
        }catch(e){ /* ignore fallback errors */ }
      }
      }
    })()
  }
}

// Global animation preferences and toggles
(() => {
  const globalToggle = document.getElementById('globalAnimToggle')
  const ambientToggle = document.getElementById('ambientConfettiToggle')
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Toggle wiring: global toggle enables/disables animations explicitly
  // global toggle removed from header; keep function if other code references it

  // reduce confetti defaults
  const DEFAULT_CONFETTI_COUNT = 60
  const MOBILE_CONFETTI_COUNT = 24

  // simple helper to choose count
  window._getConfettiCount = () => {
    if(window.matchMedia && window.matchMedia('(max-width: 640px)').matches) return MOBILE_CONFETTI_COUNT
    return DEFAULT_CONFETTI_COUNT
  }

  // Pause heavy animations when tab is hidden
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){
      // add class to stop CSS animations and optionally clear canvases
      document.body.classList.add('no-anim')
      // stop ambient confetti if running
      if(window._stopAmbientConfetti) try{ window._stopAmbientConfetti() }catch(e){}
    } else {
      // if user explicitly enabled animations, restore
      if(globalToggle && globalToggle.dataset.on === 'true' && !prefersReduced) document.body.classList.remove('no-anim')
    }
  })

  // ensure ambientConfettiToggle toggles ambient function
  // ambient toggle removed from header; no UI reference remains
})()

// Preload poster or first video for #capy to improve perceived load
;(() => {
  try{
    const mainCapy = document.getElementById('capy')
    if(!mainCapy) return
    // if a chosen src exists (set earlier), try to compute candidates
    const chosen = mainCapy._chosenSrc || null
    const candidate = chosen || null
    if(!candidate) return

    const urlObj = new URL(candidate, window.location.href)
    const base = urlObj.pathname.replace(/\.[^.]+$/, '')
    const origin = urlObj.origin
    const posterWebp = origin + base + '-poster.webp'
    const posterJpg = origin + base + '-poster.jpg'
    const mp4 = origin + base + '.mp4'

    const head = async (u) => { try{ const r = await fetch(u, { method: 'HEAD' }); return r.ok }catch(e){ return false } }

    ;(async ()=>{
      if(await head(posterWebp)){
        const l = document.createElement('link'); l.rel='preload'; l.as='image'; l.href = posterWebp; document.head.appendChild(l)
      } else if(await head(posterJpg)){
        const l = document.createElement('link'); l.rel='preload'; l.as='image'; l.href = posterJpg; document.head.appendChild(l)
      }

      if(await head(mp4)){
        const l2 = document.createElement('link'); l2.rel='preload'; l2.as='video'; l2.href = mp4; document.head.appendChild(l2)
      }
    })()
  }catch(e){/*ignore*/}
})()

// external capybara loader
const loadExternal = document.getElementById('loadExternal')
const externalUrl = document.getElementById('externalUrl')
const externalPreview = document.getElementById('externalPreview')
const previewSpinner = document.getElementById('previewSpinner')
let userInteracted = false

function setUserInteracted(){ userInteracted = true }
// mark interaction on key buttons
['playBtn','capyBtn','videoToggle','confettiBtn','balloonsBtn'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('click', setUserInteracted) })

function clearExternalPreview(){
  externalPreview.innerHTML=''
  externalPreview.setAttribute('aria-hidden','true')
}

function setCapyToElement(el){
  // replace current capy image with provided element
  const parent = capy.parentElement
  parent.innerHTML=''
  parent.appendChild(el)
  // update capy reference
  // eslint-disable-next-line no-undef
  window.capyCurrent = el
}

if(loadExternal && externalUrl){
  loadExternal.addEventListener('click', ()=>{
    const url = externalUrl.value.trim()
    if(!url) return
    clearExternalPreview()
    // decide type
    const lower = url.toLowerCase()
    if(lower.endsWith('.json') || lower.includes('lottiefiles')){
      // create lottie-player
      showSpinner()
      const lottie = document.createElement('lottie-player')
      lottie.setAttribute('src', url)
      lottie.setAttribute('background','transparent')
      lottie.setAttribute('speed','1')
      lottie.setAttribute('loop','')
      lottie.setAttribute('autoplay','')
  externalPreview.appendChild(lottie)
  externalPreview.setAttribute('aria-hidden','false')
  hideSpinner()
      // also replace capy image area
      const img = document.createElement('div')
      img.style.width='100%'
      img.appendChild(lottie.cloneNode(true))
      setCapyToElement(img)
    } else if(lower.endsWith('.gif') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')){
      const img = document.createElement('img')
      // mark for lazy loading and deferred set
      img.loading = 'lazy'
      img.setAttribute('data-src', url)
      img.alt = 'capibara externa'
      img.onload = ()=>{
        // when loaded, move into preview
        externalPreview.appendChild(img.cloneNode())
        externalPreview.setAttribute('aria-hidden','false')
        const replace = document.createElement('img')
        replace.loading = 'lazy'
        replace.setAttribute('data-src', url)
        replace.alt = 'capibara externa'
        setCapyToElement(replace)
        hideSpinner()
      }
      img.onerror = ()=>{
        externalPreview.textContent = 'No se pudo cargar la imagen.'
        try{ capyDebugAdd('External preview failed: '+url) }catch(e){}
      }
    } else if(lower.endsWith('.mp4')){
      const v = document.createElement('video')
      // defer heavy network cost: use data-src and set loading behavior
      v.setAttribute('data-src', url)
      v.autoplay = false
      v.loop = true
      v.muted = true
      v.playsInline = true
      v.style.maxWidth = '100%'
      showSpinner()
      v.oncanplay = ()=>{
        // ensure the video has a real src for playback in preview
        if(!v.src && v.getAttribute('data-src')) v.src = v.getAttribute('data-src')
        externalPreview.appendChild(v)
        externalPreview.setAttribute('aria-hidden','false')
        const replace = document.createElement('video')
        // create replace element also using deferred src
        replace.setAttribute('data-src', url)
        replace.autoplay = false
        replace.loop = true
        replace.muted = true
        replace.playsInline = true
        replace.style.maxWidth='100%'
        setCapyToElement(replace)
        // autoplay only after user interaction
        if(userInteracted){ try{ 
          // set real src before trying to play
          if(replace.getAttribute('data-src')) replace.src = replace.getAttribute('data-src')
          replace.play()
        }catch(e){} }
        hideSpinner()
      }
      v.onerror = ()=>{ externalPreview.textContent='No se pudo cargar el video.' }
    } else {
      // fallback: try to embed as image
      const img = document.createElement('img')
      img.src = url
      img.alt = 'capibara externa'
      img.onload = ()=>{
        externalPreview.appendChild(img.cloneNode())
        externalPreview.setAttribute('aria-hidden','false')
        setCapyToElement(img)
      }
      img.onerror = ()=>{ externalPreview.textContent='No se pudo cargar.' }
    }
  })
  // auto-load default if present
  const def = externalUrl.getAttribute('data-default')
  if(def && def.trim().length>0){
    // prefer a local MP4 if it exists (uploaded by user)
    const localMp4 = 'Carpincho bebiendo té de burbujas.mp4'
    // quick existence check: try to fetch HEAD; if 200, use it
    fetch(localMp4, { method: 'HEAD' }).then(res => {
      if(res.ok){
        externalUrl.value = localMp4
      } else {
        externalUrl.value = def
      }
    }).catch(()=> { externalUrl.value = def }).finally(()=>{
      // small timeout to allow DOM paint
      setTimeout(()=> loadExternal.click(), 300)
    })
  }
}

// video toggle control
const videoToggle = document.getElementById('videoToggle')
const videoMute = document.getElementById('videoMute')
if(videoToggle){
  videoToggle.addEventListener('click', ()=>{
    const target = window.capyCurrent || capy
    if(!target) return
    // if it's a video element
    const vid = (target.tagName && target.tagName.toLowerCase()==='video') ? target : target.querySelector && target.querySelector('video')
    if(vid){
      // user interaction mark
      setUserInteracted()
      if(vid.paused){
        vid.play().catch(()=>{})
        videoToggle.textContent='Pausar video'
        videoToggle.setAttribute('aria-pressed','true')
      } else {
        vid.pause()
        videoToggle.textContent='Play video'
        videoToggle.setAttribute('aria-pressed','false')
      }
    } else {
      videoToggle.textContent='No hay video cargado'
      setTimeout(()=> videoToggle.textContent='Play video',1200)
    }
  })
}

if(videoMute){
  videoMute.addEventListener('click', ()=>{
    const target = window.capyCurrent || capy
    if(!target) return
    const vid = (target.tagName && target.tagName.toLowerCase()==='video') ? target : target.querySelector && target.querySelector('video')
    if(vid){
      vid.muted = !vid.muted
      videoMute.setAttribute('aria-pressed', String(vid.muted))
      videoMute.textContent = vid.muted ? 'Mute' : 'Unmute'
    } else {
      videoMute.textContent='No hay video'
      setTimeout(()=> videoMute.textContent='Mute',1200)
    }
  })
}

function showSpinner(){ if(previewSpinner) previewSpinner.style.display='flex' }
function hideSpinner(){ if(previewSpinner) previewSpinner.style.display='none' }

// Load capybara GIF button
const loadCapyGifBtn = document.getElementById('loadCapyGifBtn')
if(loadCapyGifBtn) loadCapyGifBtn.addEventListener('click', loadCapyGifs)
 
// Instead of user-selectable gallery, auto-load capy GIFs into placeholders
document.addEventListener('DOMContentLoaded', ()=>{
  try{ loadCapyGifs() }catch(e){ console.warn('loadCapyGifs failed', e) }
  // Nav toggle wiring (mobile)
  try{
    const navToggle = document.querySelector('.nav-toggle')
    const mainNav = document.getElementById('main-nav')
    if(navToggle && mainNav){
      navToggle.addEventListener('click', ()=>{
        const expanded = navToggle.getAttribute('aria-expanded') === 'true'
        if(expanded){ navToggle.setAttribute('aria-expanded','false'); mainNav.classList.remove('show') }
        else { navToggle.setAttribute('aria-expanded','true'); mainNav.classList.add('show') }
      })
    }
  }catch(e){/*ignore*/}
})

// hero effects disabled
// Re-enable subtle graffiti overlay (only graffiti, no balloons)
;(function(){
  const canvasEl = document.getElementById('hero-effect-canvas')
  if(!canvasEl) return
  // user requested: disable hero-effect painting
  canvasEl.style.display = 'none'
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if(prefersReduced){ canvasEl.style.display = 'none'; return }

  try{
    if(window.OffscreenCanvas && window.Worker){
      const worker = new Worker('/js/confetti-worker.js')
      const off = canvasEl.transferControlToOffscreen()
      function resize(){
        try{ canvasEl.width = Math.max(200, canvasEl.clientWidth); canvasEl.height = Math.max(60, canvasEl.clientHeight) }catch(e){}
      }
      resize()
      worker.postMessage({ type: 'init', canvas: off, width: canvasEl.width, height: canvasEl.height, count: 12 }, [off])
      // gentle bursts on load + sparse periodic bursts
      setTimeout(()=>{ try{ worker.postMessage({ type: 'burst-graffiti', count: 4 }) }catch(e){} }, 200)
      let pid = setInterval(()=>{ if(!document.hidden) try{ worker.postMessage({ type: 'burst-graffiti', count: 2 }) }catch(e){} }, 6000)
      window.addEventListener('resize', ()=>{ try{ worker.postMessage({ type: 'resize', width: canvasEl.clientWidth, height: canvasEl.clientHeight }) }catch(e){} })
      window.addEventListener('pagehide', ()=>{ if(pid) clearInterval(pid); try{ worker.postMessage({ type: 'stop' }) }catch(e){} })
    } else {
      // fallback: hide canvas to avoid layout issues
      canvasEl.style.display = 'none'
    }
  }catch(e){ canvasEl.style.display = 'none' }
})()
// Add passive listeners for touch/scroll to avoid blocking the main thread
try{
  window.addEventListener('touchstart', ()=>{}, { passive: true })
  window.addEventListener('touchmove', ()=>{}, { passive: true })
  window.addEventListener('wheel', ()=>{}, { passive: true })
}catch(e){/*older browsers ignore options*/}
// Auto-start celebratory effects: confetti and balloons — FORZADO por solicitud del usuario
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(!prefersReduced){
      // force a worker burst if available, else fallback
      try{ startWorkerConfetti(window._getConfettiCount ? window._getConfettiCount() : 60) }catch(e){ try{ launchConfetti(window._getConfettiCount ? window._getConfettiCount() : 60) }catch(e){} }
      try{ spawnBalloons(window.innerWidth < 640 ? 3 : 6) }catch(e){}
    }
  }catch(e){/*ignore*/}
})
 // Hero background effects: graffiti-only subtle worker
 ;(function(){
   const heroCanvas = document.getElementById('hero-effect-canvas')
   if(!heroCanvas) return
   const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
   if(prefersReduced){ heroCanvas.style.display = 'none'; return }
   try{
     if(window.OffscreenCanvas && window.Worker){
       const hw = new Worker('/js/confetti-worker.js')
       const off = heroCanvas.transferControlToOffscreen()
       const w = Math.max(240, Math.floor(heroCanvas.clientWidth || 480))
       const h = Math.max(88, Math.floor(heroCanvas.clientHeight || 140))
       hw.postMessage({ type: 'init', canvas: off, width: w, height: h, count: 12 }, [off])
       // one gentle initial graffiti burst
       setTimeout(()=>{ try{ hw.postMessage({ type: 'burst-graffiti', count: 3 }) }catch(e){} }, 300)
       // occasional subtle bursts
       const pid = setInterval(()=>{ if(!document.hidden) try{ hw.postMessage({ type: 'burst-graffiti', count: 2 }) }catch(e){} }, 7000)
       // resize forwarding
       window.addEventListener('resize', ()=>{ try{ hw.postMessage({ type: 'resize', width: Math.max(240, Math.floor(heroCanvas.clientWidth)), height: Math.max(88, Math.floor(heroCanvas.clientHeight)) }) }catch(e){} })
       // cleanup on pagehide
       window.addEventListener('pagehide', ()=>{ clearInterval(pid); try{ hw.postMessage({ type: 'stop' }) }catch(e){} })
     } else {
       // fallback: hide canvas if no worker support
       heroCanvas.style.display = 'none'
     }
   }catch(e){ heroCanvas.style.display = 'none' }
 })()
/* ---------- Confetti (simple) ---------- */
canvas.width = innerWidth
canvas.height = innerHeight
window.addEventListener('resize', ()=>{ canvas.width = innerWidth; canvas.height = innerHeight })
const ctx = canvas.getContext('2d')

function random(min,max){ return Math.random()*(max-min)+min }

function launchConfetti(count=120){
  // adaptive default
  if(typeof count === 'undefined' || count === null) count = (window._getConfettiCount && typeof window._getConfettiCount === 'function') ? window._getConfettiCount() : 120
  const pieces = []
  const shapes = ['square', 'circle', 'heart', 'star', 'triangle']
  const colors = ['#ffb3ba', '#bae1ff', '#ffffba', '#baffc9', '#d5baff', '#ffdfba', '#ffb3de']
  for(let i=0;i<count;i++){
    const shape = shapes[Math.floor(random(0, shapes.length))]
    pieces.push({
      x: random(0,canvas.width),
      y: random(-50,canvas.height/2),
      vx: random(-3,3),
      vy: random(1,8),
      size: random(8,16),
      color: colors[Math.floor(random(0, colors.length))],
      rot: random(0,360),
      vr: random(-8,8),
      shape: shape
    })
  }
  let t=0
  let lastTs = 0
  const minDelta = 1000 / 40 // 40 FPS target
  function draw(ts){
    if(!ts) ts = performance.now()
    if(lastTs && (ts - lastTs) < minDelta){ requestAnimationFrame(draw); return }
    lastTs = ts
    ctx.clearRect(0,0,canvas.width,canvas.height)
    for(const p of pieces){
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x,p.y)
      ctx.rotate(p.rot * Math.PI/180)
      ctx.fillStyle = p.color
      ctx.strokeStyle = p.color
      ctx.lineWidth = 2
      if(p.shape === 'circle'){
        ctx.beginPath()
        ctx.arc(0, 0, p.size/2, 0, 2 * Math.PI)
        ctx.fill()
      } else if(p.shape === 'heart'){
        ctx.beginPath()
        ctx.moveTo(0, p.size/4)
        ctx.bezierCurveTo(0, 0, -p.size/2, 0, -p.size/2, p.size/4)
        ctx.bezierCurveTo(-p.size/2, p.size/2, 0, p.size*0.75, 0, p.size)
        ctx.bezierCurveTo(0, p.size*0.75, p.size/2, p.size/2, p.size/2, p.size/4)
        ctx.bezierCurveTo(p.size/2, 0, 0, 0, 0, p.size/4)
        ctx.fill()
      } else if(p.shape === 'star'){
        ctx.beginPath()
        for(let i=0; i<5; i++){
          const angle = (i * 4 * Math.PI) / 5 - Math.PI/2
          const x = Math.cos(angle) * p.size/2
          const y = Math.sin(angle) * p.size/2
          if(i===0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
      } else if(p.shape === 'triangle'){
        ctx.beginPath()
        ctx.moveTo(0, -p.size/2)
        ctx.lineTo(-p.size/2, p.size/2)
        ctx.lineTo(p.size/2, p.size/2)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size)
      }
      ctx.restore()
    }
    t++
    if(t<350){ requestAnimationFrame(draw) }
    else{ ctx.clearRect(0,0,canvas.width,canvas.height) }
  }
  requestAnimationFrame(draw)
}

/* ---------- Balloons ---------- */
function spawnBalloons(n=6){
  for(let i=0;i<n;i++){
    const b = document.createElement('div')
    b.className = 'balloon'
    const colorClass = ['b-red','b-yellow','b-blue','b-green'][Math.floor(random(0,4))]
    b.classList.add(colorClass)
    const left = random(5,95)
    b.style.left = left+'%'
    const delay = random(0,2)
    const dur = random(8,18)
    b.style.animation = `floatUp ${dur}s linear ${delay}s forwards`
    const scale = random(0.7,1.1)
    b.style.transform = `scale(${scale})`
    const str = document.createElement('div')
    str.className = 'string'
    b.appendChild(str)
    document.body.appendChild(b)
    // remove later
    setTimeout(()=> b.remove(), (dur+delay+2)*1000)
  }
}

/* optional: create a tiny fallback audio if none provided */
(function ensureAudio(){
  if(!audio) return
  // if no source, create a short oscillator for one-time play
  const sources = audio.querySelectorAll('source')
  let hasSrc = false
  for(const s of sources) if(s.src && s.src.trim().length>0) hasSrc = true
  if(!hasSrc){
    let started=false
    playBtn.addEventListener('click', ()=>{
      if(started) return
      started=true
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type='sine'; o.frequency.value=520
      g.gain.value=0.02
      o.connect(g); g.connect(ctx.destination)
      o.start();
      setTimeout(()=>{ o.stop() }, 4000)
    })
  }
})()

function playTinySound(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type='triangle'; o.frequency.value=440
    g.gain.value=0.02
    o.connect(g); g.connect(ctx.destination)
    o.start()
    setTimeout(()=>{ o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime+0.12) }, 10)
    setTimeout(()=>{ o.stop(); ctx.close() }, 350)
  }catch(e){/*ignore*/}
}

// Optimized countdown scheduler
;(function(){
  const TARGET = new Date('2025-12-27T13:00:00')
  const nodes = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    container: document.querySelector('.countdown')
  }

  // prepare SVG ring cache: unit -> { fg, r, circ }
  const rings = {}
  document.querySelectorAll('.ring').forEach(svg => {
    try{
      const unit = svg.getAttribute('data-unit')
      const fg = svg.querySelector('.ring-fg')
      if(!fg) return
      const r = Number(fg.getAttribute('r')) || (unit==='days'?72:(unit==='hours'?56:(unit==='minutes'?40:24)))
      const c = 2 * Math.PI * r
      fg.style.strokeDasharray = c
      rings[unit] = { fg, r, c }
    }catch(e){/*ignore*/}
  })

  // capture initial total days to keep days ring stable
  const MS_DAY = 1000 * 60 * 60 * 24
  // Use a sensible cap for the days ring so its visual behavior matches other unit rings
  // If the event is far in the future, show the days ring as "full" until it enters the last window.
  const DAYS_RING_MAX = 30
  const initialTotalDaysRaw = Math.max(1, Math.ceil((TARGET - new Date()) / MS_DAY))
  const initialTotalDays = Math.min(initialTotalDaysRaw, DAYS_RING_MAX)
  let prev = { days: null, hours: null, minutes: null, seconds: null }
  let timerId = null

  function computeValues(now){
    const diff = Math.max(0, TARGET - now)
    const days = Math.floor(diff / (1000*60*60*24))
    let rem = diff - days * (1000*60*60*24)
    const hours = Math.floor(rem / (1000*60*60)); rem -= hours * (1000*60*60)
    const minutes = Math.floor(rem / (1000*60)); rem -= minutes * (1000*60)
    const seconds = Math.floor(rem / 1000)
    return { days, hours, minutes, seconds }
  }

  function applyValues(vals){
    // update numeric nodes only when changed
    let minutesChanged = false, hoursChanged = false, daysChanged = false
    Object.keys(vals).forEach(k => {
      const v = vals[k]
      if(prev[k] !== v){
        const el = nodes[k]
  if(el){ el.textContent = v }
        // mark higher-unit changes for rings
        if(k === 'minutes') minutesChanged = true
        if(k === 'hours') hoursChanged = true
        if(k === 'days') daysChanged = true
        prev[k] = v
      }
    })

    // update rings less frequently: every 5s or when higher unit changed
    try{
      const sec = typeof vals.seconds === 'number' ? vals.seconds : (prev.seconds || 0)
      const shouldUpdateRings = (sec % 5 === 0) || minutesChanged || hoursChanged || daysChanged
      if(shouldUpdateRings){
        Object.keys(rings).forEach(unit => {
          const info = rings[unit]
          if(!info) return
          let pct = 0
          if(unit==='days'){
              // if there are more days than the cap, show full ring until within the cap window
              pct = initialTotalDays > 0 ? (prev.days / initialTotalDays) : 0
            } else if(unit==='hours') pct = prev.hours / 24
          else if(unit==='minutes') pct = prev.minutes / 60
          else if(unit==='seconds') pct = prev.seconds / 60
          const offset = info.c * (1 - Math.max(0, Math.min(1, pct)))
          info.fg.style.strokeDashoffset = offset
        })
  // reset change flags (we used locals)
  // nothing to store on prev
      }
    }catch(e){}
  }

  function tick(){
    if(document.hidden){
      // pause updates while hidden; schedule a resume check
      if(timerId) clearTimeout(timerId)
      timerId = setTimeout(()=>{ if(!document.hidden) tick() }, 1000)
      return
    }

    const now = new Date()
    const vals = computeValues(now)
    // if event passed, show final message
    if(TARGET - now <= 0){
      if(nodes.container) nodes.container.innerHTML = '<h3>¡Es el día del cumpleaños!</h3>'
      return
    }
    applyValues(vals)

    // align next tick to next full second
    const ms = now.getMilliseconds()
    const delay = Math.max(200, 1000 - ms + 8)
    if(timerId) clearTimeout(timerId)
    timerId = setTimeout(tick, delay)
  }

  // visibility handling: resume immediately when visible
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) tick() })

  // start now
  tick()
})()

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Auto-load capybara GIF when page loads (single listener placed later)

/* ---------- Mapa interactivo (Leaflet) ---------- */
function initLeafletMap(){
  try{
    if(typeof L === 'undefined') return
    const lat = -32.9328978
    const lon = -60.6617052
    const mapEl = document.getElementById('leaflet-map')
    if(!mapEl) return
    const map = L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lon], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map)
    const marker = L.marker([lat, lon]).addTo(map)
  const address = 'Suipacha 41 bis, Rosario'
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  marker.bindPopup('<strong>Fiesta de Faustina</strong><br/>Suipacha 41 bis, Rosario<br/><a href="'+gmaps+'" target="_blank" rel="noopener">Abrir en Google Maps</a>')
    // Add accessible name to the marker's icon once it's added to the DOM
    marker.on('add', ()=>{
      try{
        const imgs = mapEl.querySelectorAll('img.leaflet-marker-icon')
  imgs.forEach(img=>{ if(!img.getAttribute('aria-label')) img.setAttribute('aria-label','Marcador: Fiesta de Faustina, Suipacha 41 bis'); if(!img.alt) img.alt='Marcador: Fiesta de Faustina' })
      }catch(e){/*ignore*/}
    })
    // also ensure future marker icons get accessible names
    function ensureMarkerA11y(){
      try{
        const imgs = mapEl.querySelectorAll('img.leaflet-marker-icon')
        imgs.forEach(img=>{
          if(!img.getAttribute('aria-label')) img.setAttribute('aria-label','Marcador: Fiesta de Faustina, Suipacha 41 bis')
          if(!img.getAttribute('role')) img.setAttribute('role','button')
        })
      }catch(e){/*ignore*/}
    }
    ensureMarkerA11y()
    // fallback: ensure after a short delay
    setTimeout(ensureMarkerA11y, 400)
    // observe dynamic additions
    try{
      const mo = new MutationObserver(ensureMarkerA11y)
      mo.observe(mapEl, { childList: true, subtree: true })
      // disconnect after a while to avoid leaks
      setTimeout(()=> mo.disconnect(), 30000)
    }catch(e){/*ignore*/}
  }catch(e){ console.warn('Leaflet init failed', e) }
}

window.addEventListener('load', initLeafletMap)

// ensure capy GIFs are observed/loaded once after DOM ready and enable ambient control wiring
document.addEventListener('DOMContentLoaded', ()=>{
  try{ loadCapyGifs() }catch(e){ console.warn('loadCapyGifs failed', e) }
  try{ enableAmbientControl() }catch(e){/*ignore*/}
})

// wire header global animation button if present
document.addEventListener('DOMContentLoaded', ()=>{
  const g = document.getElementById('globalAnimToggle')
  if(g){
    // initial state
    const on = g.getAttribute('data-on') !== 'false'
    setGlobalAnim(on)
    g.setAttribute('aria-pressed', String(on))
    g.textContent = on ? 'Anim' : 'Sin anim'
    g.addEventListener('click', ()=>{
      const now = !(g.getAttribute('data-on') === 'true')
      g.setAttribute('data-on', String(now))
      setGlobalAnim(now)
      g.setAttribute('aria-pressed', String(now))
      g.textContent = now ? 'Anim' : 'Sin anim'
    })
  }
})
// header toggles removed; global animation stays enabled by default

/* Ambient confetti: gentle, continuous background particles around the page */
function startAmbientConfetti(){
  const canvasA = document.getElementById('faustina-confetti-canvas')
  if(!canvasA) return
  const ctx = canvasA.getContext('2d')
  function resize(){ canvasA.width = innerWidth; canvasA.height = innerHeight }
  resize(); window.addEventListener('resize', resize)

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if(prefersReduced) return
  // Graffiti ambient: paint spray and strokes (no emojis)
  const colors = ['#ff3b3b','#ffd23f','#00d2ff','#9b5cff','#00f5a0','#ffffff']
  const particles = []
  const baseCount = Math.max(12, Math.floor((window.innerWidth*window.innerHeight)/300000))
  const COUNT = window.innerWidth < 720 ? Math.floor(baseCount * 0.45) : baseCount

  for(let i=0;i<COUNT;i++){
    const size = 12 + Math.random()*36
    const type = Math.random() < 0.6 ? 'spray' : 'stroke'
    const p = {
      x: Math.random()*canvasA.width,
      y: Math.random()*canvasA.height,
      vx: (Math.random()*0.6)-0.3,
      vy: (Math.random()*0.6)-0.3,
      size,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: (Math.random()-0.5)*40,
      vr: (Math.random()-0.5)*0.6,
      type
    }
    if(type === 'spray'){
      p.dots = 6 + Math.floor(Math.random()*18)
      p.spread = size * (0.6 + Math.random()*1.4)
    } else {
      p.len = 30 + Math.random()*120
      p.curve = 6 + Math.random()*40
      p.thickness = Math.max(2, size/6)
    }
    particles.push(p)
  }

  let rafId = null
  let lastTs = 0
  function draw(ts){
    if(document.hidden && ts - lastTs < 500){ rafId = requestAnimationFrame(draw); return }
    lastTs = ts
    // subtle fade to create trailing paint effect
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    ctx.fillRect(0,0,canvasA.width,canvasA.height)

    for(const p of particles){
      p.x += p.vx
      p.y += p.vy
      p.vx += Math.sin((p.y+Date.now()/1000)/80)*0.002
      p.vy += Math.cos((p.x+Date.now()/1000)/100)*0.002
      p.rot += p.vr

      if(p.type === 'spray'){
        // draw clustered dots to mimic spray paint
        for(let i=0;i<p.dots;i++){
          const angle = Math.random()*Math.PI*2
          const r = Math.random()*p.spread
          const dx = Math.cos(angle)*r
          const dy = Math.sin(angle)*r
          ctx.beginPath()
          ctx.fillStyle = p.color
          ctx.globalAlpha = 0.06 + Math.random()*0.18
          const s = Math.max(1, Math.random()* (p.size/6))
          ctx.fillRect(p.x + dx - s/2, p.y + dy - s/2, s, s)
        }
        // occasional tiny highlight
        if(Math.random() < 0.008){ ctx.fillStyle = '#fff'; ctx.fillRect(p.x-1, p.y-1, 2, 2) }
      } else {
        // paint stroke (curved tag-like stroke)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI/180)
        ctx.beginPath()
        const lx = -p.len/2
        const rx = p.len/2
        ctx.moveTo(lx, 0)
        ctx.bezierCurveTo(lx + p.curve, -p.curve, rx - p.curve, p.curve, rx, 0)
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.thickness
        ctx.lineCap = 'round'
        ctx.globalAlpha = 0.85
        ctx.stroke()
        // small drips
        if(Math.random() < 0.06){
          const dripX = lx + Math.random()*p.len
          ctx.beginPath(); ctx.moveTo(dripX, 2); ctx.lineTo(dripX, 6 + Math.random()*12); ctx.stroke()
        }
        ctx.restore()
      }

      // recycle if offscreen
      if(p.y > canvasA.height + 80) p.y = -40
      if(p.y < -80) p.y = canvasA.height + 40
      if(p.x < -120) p.x = canvasA.width + 120
      if(p.x > canvasA.width + 120) p.x = -120
    }
    rafId = requestAnimationFrame(draw)
  }

  function visibilityHandler(){
    if(document.hidden){ if(rafId) cancelAnimationFrame(rafId); rafId = null }
    else { if(!rafId) rafId = requestAnimationFrame(draw) }
  }
  document.addEventListener('visibilitychange', visibilityHandler)

  setTimeout(()=>{ if(!document.hidden) rafId = requestAnimationFrame(draw) }, 120)
  return ()=>{ if(rafId) cancelAnimationFrame(rafId); document.removeEventListener('visibilitychange', visibilityHandler) }
}

// Ambient confetti does not start automatically. Use the header toggle to enable it.

// Global animations toggle wiring (placed near confetti controls)
let globalAnimEnabled = true
function setGlobalAnim(enabled){
  globalAnimEnabled = Boolean(enabled)
  document.body.classList.toggle('no-anim', !globalAnimEnabled)
  // stop ambient confetti if disabling
  if(!globalAnimEnabled && typeof _stopAmbientConfetti === 'function'){
    try{ _stopAmbientConfetti(); _stopAmbientConfetti = null }catch(e){}
  }
}

// expose a safe wrapper for launchConfetti
const _safeLaunchConfetti = window.launchConfetti || function(){}
window.launchConfetti = function(count){ if(!globalAnimEnabled) return; return _safeLaunchConfetti(count) }


// Allow external control of ambient confetti (start/stop) and wire a small toggle button if present
let _stopAmbientConfetti = null
function enableAmbientControl(){
  const btn = document.getElementById('ambientConfettiToggle')
  if(btn){
    btn.addEventListener('click', ()=>{
      if(btn.getAttribute('data-on') === 'true'){
        // stop
        if(typeof _stopAmbientConfetti === 'function') _stopAmbientConfetti()
        btn.setAttribute('data-on','false')
        btn.textContent = 'Activar confetti'
      } else {
        // start
        _stopAmbientConfetti = startAmbientConfetti()
        btn.setAttribute('data-on','true')
        btn.textContent = 'Desactivar confetti'
      }
    })
  }
}

// wrap startAmbientConfetti so it returns a stopper we can call and keep reference
const _origStartAmbient = startAmbientConfetti
startAmbientConfetti = function(){
  const stopper = _origStartAmbient()
  _stopAmbientConfetti = stopper
  return stopper
}

window.addEventListener('load', enableAmbientControl)

// Auto-start ambient graffiti when DOM is ready, respecting prefers-reduced-motion and globalAnimEnabled
document.addEventListener('DOMContentLoaded', ()=>{
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if(prefersReduced) return
  if(globalAnimEnabled){
    try{ _stopAmbientConfetti = startAmbientConfetti() }catch(e){}
  }
})
