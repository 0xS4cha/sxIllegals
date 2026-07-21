export type PanelRoute = 'group' | 'admin'

export interface SetVisibleData {
  visible: boolean
}

export interface SetRouteData {
  route: PanelRoute
}

export interface SetLocaleData {
  locale: string
}

export type NuiMessageData =
  | SetVisibleData
  | SetRouteData
  | SetLocaleData
  | Record<string, unknown>

export interface NuiMessage<T = NuiMessageData> {
  action: string
  data: T
}

export interface NuiCallbackResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export interface NuiCallbacks {
  nuiReady: { ok: boolean }
  close: { ok: boolean }
  debugLog: { ok: boolean }
}
