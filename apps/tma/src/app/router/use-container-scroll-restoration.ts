import { type RefObject, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const savedScrollPositions = new Map<string, number>()

const setScrollTop = (element: HTMLElement, top: number) => {
  if (typeof element.scrollTo === 'function') {
    element.scrollTo({ top })

    return
  }

  element.scrollTop = top
}

const getScrollKey = (location: ReturnType<typeof useLocation>) =>
  location.key || `${location.pathname}${location.search}${location.hash}`

export const useContainerScrollRestoration = (
  containerRef: RefObject<HTMLElement | null>,
): void => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const scrollKey = getScrollKey(location)

  useLayoutEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    if (navigationType === 'POP') {
      const savedPosition = savedScrollPositions.get(scrollKey)

      if (typeof savedPosition === 'number') {
        setScrollTop(container, savedPosition)

        return
      }
    }

    setScrollTop(container, 0)
  }, [containerRef, navigationType, scrollKey])

  useLayoutEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const saveScrollPosition = () => {
      savedScrollPositions.set(scrollKey, container.scrollTop)
    }

    saveScrollPosition()
    container.addEventListener('scroll', saveScrollPosition, { passive: true })

    return () => {
      saveScrollPosition()
      container.removeEventListener('scroll', saveScrollPosition)
    }
  }, [containerRef, scrollKey])
}

export const resetSavedScrollPositionsForTests = (): void => {
  savedScrollPositions.clear()
}
