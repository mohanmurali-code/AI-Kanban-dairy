import { NavLink, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b">
        <div className="container-app flex items-center justify-between py-3">
          <div className="font-semibold">Kanban Personal Diary</div>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/kanban" className={({ isActive }) => isActive ? 'text-violet-500 font-medium' : 'opacity-80 hover:opacity-100'}>
              Kanban
            </NavLink>
            <NavLink to="/notes" className={({ isActive }) => isActive ? 'text-violet-500 font-medium' : 'opacity-80 hover:opacity-100'}>
              Notes
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? 'text-violet-500 font-medium' : 'opacity-80 hover:opacity-100'}>
              Tasks
            </NavLink>
            <NavLink to="/themes" className={({ isActive }) => isActive ? 'text-violet-500 font-medium' : 'opacity-80 hover:opacity-100'}>
              Themes
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-violet-500 font-medium' : 'opacity-80 hover:opacity-100'}>
              Settings
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container-app py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App
