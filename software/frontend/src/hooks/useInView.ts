import { useEffect, useRef, useState } from 'react'

// Fires once when the element first scrolls into view, then stops
// observing — for one-shot scroll-triggered entrance animations rather
// than something that re-fires every time the element crosses the viewport.
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.2, ...options })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView] as const
}
