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
    function launchConfetti(count=80){
      const pieces=[]
      for(let i=0;i<count;i++) pieces.push({x:random(0,canvas.width),y:random(-50,canvas.height/2),vx:random(-2,2),vy:random(1,6),size:random(6,12),color:`hsl(${Math.floor(random(0,360))} 80% 60%)`,rot:random(0,360),vr:random(-6,6)})
      let t=0
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height)
        for(const p of pieces){p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.rot+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore()}
        t++
        if(t<220) requestAnimationFrame(draw)
        else ctx.clearRect(0,0,canvas.width,canvas.height)
      }
      draw()
    }
    if(confettiBtn) confettiBtn.addEventListener('click', ()=>{
      launchConfetti(120)
      playConfettiSound()
    })
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
  'https://media.giphy.com/media/XU5ERVcMVEsrgZR3Jh/giphy.gif?cid=790b7611c40c784b3608209b5baec086ecdece91e86d1513&ep=v1_user_favorites&rid=giphy.gif&ct=s',
  'https://media.giphy.com/media/zNTrlsMxLVANIGBmgr/giphy.gif?cid=790b7611d22af94741bc54fc74190bcc68d0b72dd6ce74de&ep=v1_user_favorites&rid=giphy.gif&ct=s'
  ]

  // Array of placeholder IDs
  const placeholders = ['hero-capy', 'date-capy', 'location-capy', 'details-capy']

  // Load GIFs into each placeholder
  placeholders.forEach((placeholderId, index) => {
    const placeholder = document.getElementById(placeholderId)
    if (!placeholder) return

    // Cycle through GIFs for each placeholder
    const gifUrl = gifUrls[index % gifUrls.length]

  const img = document.createElement('img')
  // if this is the date placeholder (invitación), use the user-provided specific gif
  const forcedDateGif = 'https://media.giphy.com/media/XnUqczw4HRtdVk5HWe/giphy.gif?cid=790b7611d22af94741bc54fc74190bcc68d0b72dd6ce74de&ep=v1_user_favorites&rid=giphy.gif&ct=s'
  img.src = placeholderId === 'date-capy' ? forcedDateGif : gifUrl
    img.alt = 'Capybara animada'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.borderRadius = '10px'

    img.onload = () => {
      placeholder.innerHTML = ''
      // wrap larger for .capy-large placeholders
      if(placeholder.classList.contains('capy-large')){
        const w = document.createElement('div')
        w.style.width='100%'
        w.style.height='100%'
        w.style.display='flex'
        w.style.alignItems='center'
        w.style.justifyContent='center'
        w.appendChild(img)
        placeholder.appendChild(w)
      } else {
        placeholder.appendChild(img)
      }
    }

    img.onerror = () => {
      console.error('Error cargando el GIF específico para', placeholderId)
      placeholder.innerHTML = '<span style="color: #666;">Capybara</span>'
    }
  })
}

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
      img.src = url
      img.alt = 'capibara externa'
      img.onload = ()=>{
        externalPreview.appendChild(img.cloneNode())
        externalPreview.setAttribute('aria-hidden','false')
        const replace = document.createElement('img')
        replace.src = url
        replace.alt = 'capibara externa'
        setCapyToElement(replace)
        hideSpinner()
      }
      img.onerror = ()=>{
        externalPreview.textContent = 'No se pudo cargar la imagen.'
      }
    } else if(lower.endsWith('.mp4')){
      const v = document.createElement('video')
      v.src = url
      v.autoplay = false
      v.loop = true
      v.muted = true
      v.playsInline = true
      v.style.maxWidth = '100%'
      showSpinner()
      v.oncanplay = ()=>{
        externalPreview.appendChild(v)
        externalPreview.setAttribute('aria-hidden','false')
        const replace = document.createElement('video')
        replace.src = url
        replace.autoplay = false
        replace.loop = true
        replace.muted = true
        replace.playsInline = true
        replace.style.maxWidth='100%'
        setCapyToElement(replace)
        // autoplay only after user interaction
        if(userInteracted){ try{ replace.play() }catch(e){} }
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
})
/* ---------- Confetti (simple) ---------- */
canvas.width = innerWidth
canvas.height = innerHeight
window.addEventListener('resize', ()=>{ canvas.width = innerWidth; canvas.height = innerHeight })
const ctx = canvas.getContext('2d')

function random(min,max){ return Math.random()*(max-min)+min }

function launchConfetti(count=120){
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
  function draw(){
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
  draw()
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

// Countdown timer
function updateCountdown() {
  const birthday = new Date('2024-12-27T13:00:00'); // Faustina's birthday
  const now = new Date();
  const diff = birthday - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
  } else {
    document.querySelector('.countdown').innerHTML = '<h3>¡Es el día del cumpleaños!</h3>';
  }
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

/* Visual countdown updater: updates SVG rings and numbers */
function updateVisualCountdown(){
  const birthday = new Date('2024-12-27T13:00:00')
  const now = new Date()
  let diff = Math.max(0, birthday - now)
  const days = Math.floor(diff / (1000*60*60*24))
  diff -= days * (1000*60*60*24)
  const hours = Math.floor(diff / (1000*60*60))
  diff -= hours * (1000*60*60)
  const minutes = Math.floor(diff / (1000*60))
  diff -= minutes * (1000*60)
  const seconds = Math.floor(diff / 1000)

  // set text
  const ids = { days, hours, minutes, seconds }
  Object.keys(ids).forEach(k=>{ const el = document.getElementById(k); if(el) el.textContent = ids[k] })

  // animate rings: compute circumference from r attribute
  document.querySelectorAll('.ring').forEach(rsvg=>{
    try{
      const unit = rsvg.getAttribute('data-unit')
      const fg = rsvg.querySelector('.ring-fg')
      const bg = rsvg.querySelector('.ring-bg')
      if(!fg || !bg) return
      const r = Number(fg.getAttribute('r'))
      const c = 2 * Math.PI * r
      fg.style.strokeDasharray = c
      // compute percent remaining for each unit
      let pct = 0
      if(unit==='days'){
        // approximate total days until birthday starting from today: use 365 as baseline, but compute percent of days left modulo a year
        const total = Math.max(1, Math.ceil((new Date('2024-12-27T13:00:00') - new Date())/(1000*60*60*24)))
        // percent filled = days remaining / total
        pct = total>0 ? (ids.days / total) : 0
      } else if(unit==='hours'){
        pct = ids.hours / 24
      } else if(unit==='minutes'){
        pct = ids.minutes / 60
      } else if(unit==='seconds'){
        pct = ids.seconds / 60
      }
      const offset = c * (1 - Math.max(0, Math.min(1, pct)))
      fg.style.strokeDashoffset = offset
    }catch(e){/*ignore*/}
  })
}

// run visual updater every second (and immediately)
setInterval(updateVisualCountdown, 1000)
updateVisualCountdown()

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

// Auto-load capybara GIF when page loads
window.addEventListener('DOMContentLoaded', loadCapyGifs)

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
    const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}`
    marker.bindPopup('<strong>Fiesta de Faustina</strong><br/>Suipacha 41, Rosario<br/><a href="'+gmaps+'" target="_blank" rel="noopener">Abrir en Google Maps</a>')
    // Add accessible name to the marker's icon once it's added to the DOM
    marker.on('add', ()=>{
      try{
        const imgs = mapEl.querySelectorAll('img.leaflet-marker-icon')
        imgs.forEach(img=>{ if(!img.getAttribute('aria-label')) img.setAttribute('aria-label','Marcador: Fiesta de Faustina, Suipacha 41'); if(!img.alt) img.alt='Marcador: Fiesta de Faustina' })
      }catch(e){/*ignore*/}
    })
    // also ensure future marker icons get accessible names
    function ensureMarkerA11y(){
      try{
        const imgs = mapEl.querySelectorAll('img.leaflet-marker-icon')
        imgs.forEach(img=>{
          if(!img.getAttribute('aria-label')) img.setAttribute('aria-label','Marcador: Fiesta de Faustina, Suipacha 41')
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
