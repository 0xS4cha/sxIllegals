import { Outlet } from 'react-router-dom'

export function GroupLayout() {
  return (
    <div className="flex h-full w-full font-help text-white antialiased selection:bg-help-accent/40 selection:text-white">
      <Outlet />
    </div>
  )
}
