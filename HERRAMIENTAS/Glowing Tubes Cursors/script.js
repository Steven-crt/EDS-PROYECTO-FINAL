const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  targetX: window.innerWidth * 0.5,
  targetY: window.innerHeight * 0.5,
  active: false,
  idleTime: 0
}

const trail = []
const trailLength = 28

let palette = createPalette()
let animationFrame = 0

for (let index = 0; index < trailLength; index += 1) {
  trail.push({
    x: pointer.x - index * 18,
    y: pointer.y + Math.sin(index * 0.45) * 14
  })
}

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1
  canvas.width = Math.floor(window.innerWidth * scale)
  canvas.height = Math.floor(window.innerHeight * scale)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  context.setTransform(scale, 0, 0, scale, 0, 0)
}

function setPointer(x, y) {
  pointer.targetX = x
  pointer.targetY = y
  pointer.active = true
  pointer.idleTime = 0
}

function updateIdlePointer() {
  pointer.idleTime += 1

  if (pointer.idleTime < 90) {
    return
  }

  const time = animationFrame * 0.012
  const radiusX = window.innerWidth * 0.28
  const radiusY = window.innerHeight * 0.18
  pointer.targetX = window.innerWidth * 0.5 + Math.cos(time) * radiusX
  pointer.targetY = window.innerHeight * 0.52 + Math.sin(time * 1.4) * radiusY
}

function updateTrail() {
  updateIdlePointer()
  pointer.x += (pointer.targetX - pointer.x) * 0.22
  pointer.y += (pointer.targetY - pointer.y) * 0.22

  trail[0].x += (pointer.x - trail[0].x) * 0.35
  trail[0].y += (pointer.y - trail[0].y) * 0.35

  for (let index = 1; index < trail.length; index += 1) {
    const point = trail[index]
    const leader = trail[index - 1]
    point.x += (leader.x - point.x) * 0.4
    point.y += (leader.y - point.y) * 0.4
  }
}

function drawRibbon(color, offset, width, alpha) {
  context.beginPath()
  for (let index = 0; index < trail.length; index += 1) {
    const point = trail[index]
    const prev = trail[index - 1] || point
    const angle = Math.atan2(point.y - prev.y, point.x - prev.x) + Math.PI / 2
    const distanceScale = 1 - index / trail.length
    const wave = Math.sin(animationFrame * 0.05 + index * 0.55 + offset) * 28 * distanceScale
    const x = point.x + Math.cos(angle) * wave
    const y = point.y + Math.sin(angle) * wave

    if (index === 0) {
      context.moveTo(x, y)
    } else {
      const prevPoint = trail[index - 1]
      const controlX = (prevPoint.x + x) * 0.5
      const controlY = (prevPoint.y + y) * 0.5
      context.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY)
    }
  }

  context.strokeStyle = color
  context.lineWidth = width
  context.globalAlpha = alpha
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.shadowBlur = 34
  context.shadowColor = color
  context.stroke()
}

function renderBackground() {
  const gradient = context.createLinearGradient(0, 0, window.innerWidth, window.innerHeight)
  gradient.addColorStop(0, '#050816')
  gradient.addColorStop(0.5, '#0d1329')
  gradient.addColorStop(1, '#05070f')
  context.globalCompositeOperation = 'source-over'
  context.globalAlpha = 1
  context.fillStyle = gradient
  context.fillRect(0, 0, window.innerWidth, window.innerHeight)

  context.globalCompositeOperation = 'lighter'
  palette.lights.forEach((color, index) => {
    const radius = 160 + index * 50
    const x = window.innerWidth * (0.2 + index * 0.22)
    const y = window.innerHeight * (0.25 + Math.sin(animationFrame * 0.01 + index) * 0.12)
    const glow = context.createRadialGradient(x, y, 0, x, y, radius)
    glow.addColorStop(0, `${color}55`)
    glow.addColorStop(1, `${color}00`)
    context.fillStyle = glow
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  })
}

function animate() {
  animationFrame += 1
  updateTrail()
  renderBackground()

  context.globalCompositeOperation = 'lighter'
  drawRibbon(palette.tubes[0], 0, 34, 0.3)
  drawRibbon(palette.tubes[1], 2.2, 22, 0.5)
  drawRibbon(palette.tubes[2], 4.4, 12, 0.95)

  requestAnimationFrame(animate)
}

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

function createPalette() {
  return {
    tubes: ['#ff4fd8', '#7bff5d', '#57c7ff'],
    lights: ['#ff8ae2', '#8dff84', '#ffb36b', '#69d4ff']
  }
}

window.addEventListener('resize', resizeCanvas)

window.addEventListener('pointermove', (event) => {
  setPointer(event.clientX, event.clientY)
})

window.addEventListener('pointerdown', (event) => {
  setPointer(event.clientX, event.clientY)
  palette = {
    tubes: [randomColor(), randomColor(), randomColor()],
    lights: [randomColor(), randomColor(), randomColor(), randomColor()]
  }
})

window.addEventListener('touchmove', (event) => {
  const touch = event.touches[0]
  if (!touch) {
    return
  }

  setPointer(touch.clientX, touch.clientY)
}, { passive: true })

resizeCanvas()
animate()
