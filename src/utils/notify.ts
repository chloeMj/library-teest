// utils/notify.ts
import { Notify, type QNotifyCreateOptions } from 'quasar'

// interface NotifyOptions {
//   type?: 'positive' | 'negative' | 'warning' | 'info'
//   message: string
//   timeout?: number
//   position?: string
//   color?: string
// }

const defaultOptions: QNotifyCreateOptions = {
  position: 'bottom-right',
  timeout: 5000,
  progress: true,
  actions: [{ icon: 'close', color: 'white', round: true }],
}

export function notify(options: QNotifyCreateOptions) {
  return Notify.create({
    ...defaultOptions,
    ...options,
  })
}
