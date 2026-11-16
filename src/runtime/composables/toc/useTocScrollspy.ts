import { onBeforeUnmount, ref, type Ref } from 'vue'

function resolveTopMargin(firstId?: string): number {
  const topMargin = 96
  if (typeof window === 'undefined') return topMargin

  const targetEl = (firstId && document.getElementById(firstId)) || document.documentElement
  const styles = window.getComputedStyle(targetEl)
  const scrollMargin = Number.parseFloat(styles.scrollMarginTop)
  if (Number.isFinite(scrollMargin) && scrollMargin > 0) {
    return Math.ceil(scrollMargin) + 16
  }

  const layoutTop = Number.parseFloat(styles.getPropertyValue('--v-layout-top'))
  if (Number.isFinite(layoutTop) && layoutTop > 0) {
    return Math.ceil(layoutTop) + 32
  }
  return topMargin
}

export function useTocScrollspy(headingIds: Ref<string[]>) {
  const activeId = ref<string>(headingIds.value[0] || '')
  const visibleIds = new Set<string>()
  let observer: IntersectionObserver | null = null
  let isProgrammaticScroll = false
  let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null
  let scrollMaxTimer: ReturnType<typeof setTimeout> | null = null
  let cleanupScrollListeners: (() => void) | null = null

  function stopScrollLock() {
    isProgrammaticScroll = false
    if (scrollIdleTimer !== null) {
      clearTimeout(scrollIdleTimer)
      scrollIdleTimer = null
    }
    if (scrollMaxTimer !== null) {
      clearTimeout(scrollMaxTimer)
      scrollMaxTimer = null
    }
    if (cleanupScrollListeners) {
      cleanupScrollListeners()
      cleanupScrollListeners = null
    }
  }

  function startScrollLock() {
    stopScrollLock()
    if (!import.meta.client || typeof window === 'undefined') return

    isProgrammaticScroll = true

    const resetIdleTimer = (delay = 140) => {
      if (scrollIdleTimer !== null) clearTimeout(scrollIdleTimer)
      scrollIdleTimer = setTimeout(() => {
        stopScrollLock()
      }, delay)
    }

    const onScroll = () => resetIdleTimer(140)
    const onStop = () => stopScrollLock()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onStop, { passive: true })
    window.addEventListener('wheel', onStop, { passive: true })
    window.addEventListener('touchstart', onStop, { passive: true })

    cleanupScrollListeners = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onStop)
      window.removeEventListener('wheel', onStop)
      window.removeEventListener('touchstart', onStop)
    }

    // Release promptly if no scroll occurs, or cap long smooth scrolls
    resetIdleTimer(180)
    scrollMaxTimer = setTimeout(() => {
      stopScrollLock()
    }, 1200)
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    visibleIds.clear()
  }

  function startObserver() {
    stopObserver()
    const ids = headingIds.value
    activeId.value = ids[0] || ''

    if (!import.meta.client || typeof IntersectionObserver === 'undefined' || ids.length === 0) {
      return
    }

    const topMargin = resolveTopMargin(ids[0])
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const targetId = entry.target.id
          if (!targetId) continue
          if (entry.isIntersecting) {
            visibleIds.add(targetId)
          }
          else {
            visibleIds.delete(targetId)
          }
        }

        if (isProgrammaticScroll) return

        const firstVisible = ids.find(id => visibleIds.has(id))
        if (firstVisible) {
          activeId.value = firstVisible
        }
      },
      {
        rootMargin: `-${topMargin}px 0px -65% 0px`,
        threshold: [0, 1],
      },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  function scrollToId(id: string) {
    activeId.value = id
    if (!import.meta.client) return

    startScrollLock()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(window.history.state, '', `#${id}`)
    }
  }

  onBeforeUnmount(() => {
    stopObserver()
    stopScrollLock()
  })

  return {
    activeId,
    startObserver,
    stopObserver,
    stopScrollLock,
    scrollToId,
  }
}
