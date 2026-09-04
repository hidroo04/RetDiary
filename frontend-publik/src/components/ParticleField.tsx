import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  wanderAngle: number
  wanderStrength: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let particles: Particle[] = []
    let frame = 0
    let width = 0
    let height = 0
    const movementSpeed = 0.72
    const pointer = { x: -1000, y: -1000, active: false }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reset = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(28, Math.min(76, Math.round((width * height) / 10500)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        radius: 1.4 + Math.random() * 2.3,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderStrength: 0.001 + Math.random() * 0.002,
      }))
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      const linkDistance = width < 600 ? 92 : 124

      particles.forEach((particle, index) => {
        if (!reducedMotion) {
          let isRepelled = false

          // Brownian-like wandering: each particle continuously changes direction
          // at its own random rate, so the field never moves in a fixed pattern.
          particle.wanderAngle += (Math.random() - 0.5) * 0.055
          particle.vx += Math.cos(particle.wanderAngle) * particle.wanderStrength
          particle.vy += Math.sin(particle.wanderAngle) * particle.wanderStrength

          // Give a small, occasional random impulse for more visible direction changes.
          if (Math.random() < 0.002) {
            particle.vx += (Math.random() - 0.5) * 0.05
            particle.vy += (Math.random() - 0.5) * 0.05
          }

          if (pointer.active) {
            const dx = particle.x - pointer.x
            const dy = particle.y - pointer.y
            const distance = Math.hypot(dx, dy)
            const repelRadius = 175
            if (distance < repelRadius && distance > 0) {
              const force = (repelRadius - distance) / repelRadius
              const directionX = dx / distance
              const directionY = dy / distance
              isRepelled = true

              // A stronger temporary impulse makes the avoidance clearly visible,
              // while the direct displacement keeps the response immediate.
              particle.vx += directionX * force * 0.085
              particle.vy += directionY * force * 0.085
              particle.x += directionX * force * 1.15
              particle.y += directionY * force * 1.15
            }
          }
          particle.vx *= 0.996
          particle.vy *= 0.996
          const speed = Math.hypot(particle.vx, particle.vy)
          const maxSpeed = isRepelled ? 0.9 : 0.28
          if (speed > maxSpeed) {
            particle.vx = (particle.vx / speed) * maxSpeed
            particle.vy = (particle.vy / speed) * maxSpeed
          }
          particle.x += particle.vx * movementSpeed
          particle.y += particle.vy * movementSpeed
          if (particle.x < -8) particle.x = width + 8
          if (particle.x > width + 8) particle.x = -8
          if (particle.y < -8) particle.y = height + 8
          if (particle.y > height + 8) particle.y = -8
        }

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex]
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y)
          if (distance < linkDistance) {
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(other.x, other.y)
            context.strokeStyle = `rgba(125, 211, 252, ${(1 - distance / linkDistance) * 0.32})`
            context.lineWidth = 0.8
            context.stroke()
          }
        }

        const glow = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 4,
        )
        glow.addColorStop(0, 'rgba(255,255,255,.95)')
        glow.addColorStop(0.25, 'rgba(110,231,183,.9)')
        glow.addColorStop(1, 'rgba(16,185,129,0)')
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2)
        context.fillStyle = glow
        context.fill()
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = '#d1fae5'
        context.fill()
      })

      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    const observer = new ResizeObserver(reset)
    observer.observe(canvas)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    reset()
    draw()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}
