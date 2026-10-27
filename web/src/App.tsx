import { useCallback, useEffect, useState } from 'react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NuiWrapper } from './components/NuiWrapper'
import { useNuiEvent } from './hooks/useNuiEvent'
import { AdminLayout } from './layouts/AdminLayout'
import { GroupLayout } from './layouts/GroupLayout'
import { AdminPanel } from './pages/admin/Index'
import { GroupPanel } from './pages/group/Index'
import type { PanelRoute, SetRouteData, SetVisibleData } from './types/nui'
import { debugData } from './utils/debugData'
import { fetchNui } from './utils/fetchNui'
import { isEnvBrowser } from './utils/nui'

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/group" element={<GroupLayout />}>
          <Route index element={<GroupPanel />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPanel />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  const [visible, setVisible] = useState(isEnvBrowser())
  const [route, setRoute] = useState<PanelRoute>('admin')

  const handleSetVisible = useCallback(({ visible: nextVisible }: SetVisibleData) => {
    setVisible(nextVisible)
  }, [])

  useNuiEvent<SetVisibleData>('setVisible', handleSetVisible)

  useNuiEvent<SetRouteData>('setRoute', ({ route: nextRoute }) => {
    if (nextRoute === 'admin' || nextRoute === 'group') setRoute(nextRoute)
  })

  useEffect(() => {
    void fetchNui('nuiReady', { ok: true })

    if (isEnvBrowser()) {
      debugData([
        { action: 'setVisible', data: { visible: true } },
        { action: 'setRoute', data: { route: 'admin' } },
      ])
    }
  }, [])

  return (
    <NuiWrapper visible={visible}>
      <MemoryRouter key={route} initialEntries={[`/${route}`]}>
        <AppRoutes />
      </MemoryRouter>
    </NuiWrapper>
  )
}
