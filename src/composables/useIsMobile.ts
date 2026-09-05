import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 뷰포트 너비가 breakpoint 이하인지 반응형으로 추적합니다.
 * (예: Select를 모바일에서 bottomSheet로 띄울지 판단할 때 사용)
 */
export function useIsMobile(breakpoint = 640) {
  const isMobile = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const update = () => {
    isMobile.value = mediaQuery?.matches ?? false
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    update()
    mediaQuery.addEventListener('change', update)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', update)
  })

  return isMobile
}
