import { useCallback, useEffect, useState } from 'react'
import { MemoryRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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

function RouterBridge() {
  const navigate = useNavigate()

  useNuiEvent<SetRouteData>('setRoute', ({ route }) => {
    navigate(`/${route}`, { replace: true })
  })

  return null
}

function AppRoutes() {
  return (
    <>
      <RouterBridge />
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
  const [initialRoute] = useState<PanelRoute>(isEnvBrowser() ? 'admin' : 'admin')

  const handleSetVisible = useCallback(({ visible: nextVisible }: SetVisibleData) => {
    setVisible(nextVisible)
  }, [])

  useNuiEvent<SetVisibleData>('setVisible', handleSetVisible)

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
      <MemoryRouter initialEntries={[`/${initialRoute}`]}>
        <AppRoutes />
      </MemoryRouter>
    </NuiWrapper>
  )
}
