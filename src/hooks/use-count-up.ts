'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  startOnView?: boolean
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function useCountUp({
  end,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  startOnView = true,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (end === 0) {
      setValue(0)
      return
    }

    setHasStarted(true)
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      const currentValue = easedProgress * end

      setValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setValue(end)
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [end, duration])

  useEffect(() => {
    if (!startOnView) {
      startAnimation()
      return
    }

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [startAnimation, startOnView])

  // Re-run animation when end value changes (e.g., data loaded async)
  useEffect(() => {
    if (end > 0 && hasStarted) {
      // Re-animate from 0 to new value
      startAnimation()
    }
  }, [end]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`

  return { ref, value, formatted, displayValue: value.toFixed(decimals) }
}
