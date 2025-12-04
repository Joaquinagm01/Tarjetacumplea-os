// Simple confetti worker drawing into an OffscreenCanvas at ~40 FPS
let canvas = null
let ctx = null
let width = 0
let height = 0
let pieces = []
let rafId = null
let intervalId = null
const GRAVITY = 0.08

// helper emoji set for graffiti
const GRAFFITI_EMOJI = ['🎉','✨','💥','🎨','🪧','🔥','⭐']

function random(min,max){ return Math.random()*(max-min)+min }

function init(data){
  if(data.canvas){
    canvas = data.canvas
    ctx = canvas.getContext('2d')
  }
  width = data.width || (canvas && canvas.width) || 800
  height = data.height || (canvas && canvas.height) || 600
  const count = data.count || 60
  pieces = []
  const colors = data.colors || ['#ffb3ba','#bae1ff','#ffffba','#baffc9','#d5baff','#ffdfba']
  for(let i=0;i<count;i++){
    // default to confetti pieces
    pieces.push({
      type: 'confetti',
      x: random(0,width), y: random(-50,height/2), vx: random(-3,3), vy: random(1,6), size: random(8,16), color: colors[Math.floor(random(0,colors.length))], rot: random(0,360), vr: random(-8,8)
    })
  }
  startLoop()
}

function startLoop(){
  // use setInterval at ~40 FPS to avoid requestAnimationFrame absence in worker
  if(intervalId) clearInterval(intervalId)
  intervalId = setInterval(()=>{
    if(!ctx || !canvas) return
    ctx.clearRect(0,0,canvas.width,canvas.height)
    for(const p of pieces){
      // update motion based on type
      if(p.type === 'balloon'){
        // balloons rise
        p.y += p.vy; p.x += p.vx; p.vy -= 0.02; // slight upward acceleration
        // draw balloon (simple circle + string)
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = p.color || '#ff6b6b'
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        ctx.lineWidth = 1
        ctx.ellipse(p.x, p.y, p.size, p.size*1.1, 0, 0, Math.PI*2)
        ctx.fill()
        // string
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'
        ctx.moveTo(p.x, p.y + p.size*1.1)
        ctx.lineTo(p.x + (p.vx*6), p.y + p.size*3)
        ctx.stroke()
        ctx.restore()
        // recycle balloons that left top
        if(p.y < -60) { p.y = canvas.height + random(10,200); p.x = random(0,canvas.width); p.vy = -random(0.6,1.8) }
      } else if(p.type === 'graffiti'){
        // graffiti: emoji drawn as text with rotation
        p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.rot += p.vr
        ctx.save()
        ctx.translate(p.x,p.y)
        ctx.rotate((p.rot||0) * Math.PI/180)
        ctx.font = (p.size || 28) + 'px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.char || '🎉', 0, 0)
        ctx.restore()
        if(p.y > canvas.height + 80){ p.y = -20; p.x = Math.random()*canvas.width }
      } else {
        // confetti fallback
        p.x += p.vx; p.y += p.vy; p.vy += GRAVITY; p.rot += p.vr
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot * Math.PI/180); ctx.fillStyle = p.color || '#ffd'; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore()
        if(p.y > canvas.height + 40){ p.y = -20; p.x = Math.random()*canvas.width }
      }
    }
  }, 1000/40)
}

function addBurst(n){
  const colors = ['#ffb3ba','#bae1ff','#ffffba','#baffc9','#d5baff','#ffdfba']
  for(let i=0;i<n;i++){
    pieces.push({ type: 'confetti', x: random(0,width), y: random(-50,height/2), vx: random(-3,3), vy: random(1,6), size: random(8,16), color: colors[Math.floor(random(0,colors.length))], rot: random(0,360), vr: random(-8,8) })
  }
}

function addGraffiti(n){
  for(let i=0;i<n;i++){
    pieces.push({ type: 'graffiti', x: random(0,width), y: random(-60,height/2), vx: random(-1.5,1.5), vy: random(0.6,3), size: random(22,40), char: GRAFFITI_EMOJI[Math.floor(random(0,GRAFFITI_EMOJI.length))], rot: random(-30,30), vr: random(-4,4) })
  }
}

function addBalloons(n){
  const balloonColors = ['#ff6b6b','#ffd166','#6bcBff','#a0e7a0','#d5baff']
  for(let i=0;i<n;i++){
    pieces.push({ type: 'balloon', x: random(0,width), y: canvas ? (canvas.height + random(20,200)) : (height + random(20,200)), vx: random(-0.6,0.6), vy: -random(0.6,1.8), size: random(12,28), color: balloonColors[Math.floor(random(0,balloonColors.length))] })
  }
}

onmessage = function(e){
  const data = e.data
  if(!data || !data.type) return
  if(data.type === 'init'){
    init(data)
  } else if(data.type === 'resize'){
    if(canvas){ canvas.width = data.width; canvas.height = data.height }
  } else if(data.type === 'burst'){
    addBurst(data.count || 40)
  } else if(data.type === 'burst-graffiti'){
    addGraffiti(data.count || 8)
  } else if(data.type === 'burst-balloons'){
    addBalloons(data.count || 6)
  } else if(data.type === 'stop'){
    if(intervalId) clearInterval(intervalId); intervalId = null
    pieces = []
    if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height)
  }
}
