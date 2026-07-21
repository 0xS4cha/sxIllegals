import { Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-zinc-100 font-sans antialiased">
      <Outlet />
    </div>
  )
}
