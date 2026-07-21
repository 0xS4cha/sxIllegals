import type { NuiMessage } from '../types/nui'

export function debugData(messages: NuiMessage[], delay = 500): void {
  for (const message of messages) {
    window.setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: message,
        }),
      )
    }, delay)
  }
}
