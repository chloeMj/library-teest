import { ref, shallowRef, onBeforeUnmount, getCurrentInstance } from 'vue'
import { notify } from '@/utils'
// const API_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_URL = import.meta.env.VITE_SSE_URL || import.meta.env.VITE_API_BASE_URL

const resolveSseUrl = (path: string) => {
  const base = API_URL || window.location.origin
  return new URL(path, base).toString()
}

interface UseSSEOptions {
  autoReconnect?: boolean // 연결 끊기면 자동 재연결 여부
  reconnectInterval?: number // 재연결 간격(ms)
  reconnectMaxCount?: number // 재연결 횟수
  handlers?: Record<string, (event: MessageEvent) => void> // 외부 이벤트 핸들러 주입
  autoCleanupOnUnmount?: boolean
}

export function useSSE(options: UseSSEOptions) {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    reconnectMaxCount = 0,
    handlers = {},
    autoCleanupOnUnmount = true,
  } = options

  const messages = ref<any[]>([])
  const isConnected = ref(false)
  const error = shallowRef<any>(null)
  const isComplete = ref(false)
  const completeResult = ref(null)

  let eventSource: EventSource | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let connectTryCount: number = 0

  /**
   * JSON 파싱 헬퍼
   */
  const handleJSONEvent = (
    event: MessageEvent,
    callback: (data: any) => void,
  ) => {
    try {
      const data = JSON.parse(event.data)
      callback(data)
    } catch {
      callback(event.data)
      notify({
        type: 'negative',
        message: `[SSE] ${event.type} 파싱 에러`,
      })
    }
  }

  /**
   * 기본 이벤트 핸들러 (내장 로직)
   */
  const defaultHandlers: Record<string, (event: MessageEvent) => void> = {
    connected: (event) =>
      handleJSONEvent(event, (data) => {
        messages.value.push(data)
      }),
    complete: (event) =>
      handleJSONEvent(event, (data) => {
        messages.value.push(data)
        completeResult.value = data
        isComplete.value = true
      }),
    heartbeat: () => {
      console.log('💓 heartbeat received')
    },
    message: (event) =>
      handleJSONEvent(event, (data) => {
        messages.value.push(data)
      }),
  }

  const connect = (url: string) => {
    if (eventSource) return // 이미 연결 중이면 무시

    connectTryCount += 1
    eventSource = new EventSource(`${resolveSseUrl(API_URL)}${url}`, {
      withCredentials: true,
    })

    eventSource.onopen = () => {
      isConnected.value = true
      error.value = null
      connectTryCount = 0
    }
    eventSource.onerror = (err) => {
      error.value = err
      isConnected.value = false
      cleanup()

      if (autoReconnect) {
        if (
          !reconnectMaxCount ||
          (reconnectMaxCount && reconnectMaxCount > connectTryCount)
        ) {
          connectTryCount += 1
          reconnectTimer = setTimeout(() => {
            connect(url)
          }, reconnectInterval)
        } else {
          error.value = {
            type: 'error',
            reason: 'reconnect limit over',
          }
          connectTryCount = 0

          notify({
            type: 'negative',
            message: '[SSE] 에러 발생',
          })
        }
      }
    }
    // 사용자 정의 핸들러 병합
    const mergedHandlers = { ...defaultHandlers, ...handlers }

    for (const [eventName, handler] of Object.entries(mergedHandlers)) {
      if (eventName === 'message') {
        eventSource.onmessage = handler
      } else {
        eventSource.addEventListener(eventName, handler)
      }
    }

    // on message
    eventSource.onmessage = (event) => {
      try {
        messages.value.push(JSON.parse(event.data))
      } catch {
        messages.value.push(event.data)
        notify({
          type: 'negative',
          message: '[SSE] 에러 발생',
        })
      }
    }
  }

  const cleanup = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    isConnected.value = false
  }

  const disconnect = cleanup

  // setup 컨텍스트 밖에서 호출될 수도 있으므로 인스턴스가 있을 때만 등록
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (autoCleanupOnUnmount) {
        cleanup()
      }
    })
  }

  return {
    messages,
    isConnected,
    error,
    isComplete,
    completeResult,
    connect,
    disconnect,
    handleJSONEvent,
  }
}
