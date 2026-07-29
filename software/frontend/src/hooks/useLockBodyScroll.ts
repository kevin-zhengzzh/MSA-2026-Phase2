import { useEffect } from 'react'

// Modal overlays are `fixed inset-0` and cover the viewport, but without
// this the page underneath is still the scrollable element — wheel/touch
// scrolling over the backdrop scrolls the background page behind it.
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [locked])
}
