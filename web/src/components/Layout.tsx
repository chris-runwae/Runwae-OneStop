import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="shrink-0 border-b border-border bg-surface px-10 py-7">
          <h1 className="font-display text-xl font-bold text-black">
            Welcome Admin 👋
          </h1>
        </header>

        <main className="flex-1 overflow-auto bg-page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
