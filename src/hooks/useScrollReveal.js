import { useEffect } from 'react'

/** Toggle class 'visible' khi element vào viewport */
export function useScrollReveal(ref, options = {}) {
  useEffect(() => {
    const el = ref?.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08, ...options },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

/** Áp dụng reveal cho tất cả .reveal elements trong container */
export function useScrollRevealAll(containerRef) {
  useEffect(() => {
    const container = containerRef?.current ?? document
    const els = container.querySelectorAll('.reveal')
    if (!els.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 },
    )

    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })
}
