import { NavLink, Outlet } from 'react-router-dom'
import './dark-dashboard.css'
import './light-simple.css'
import './dark-img-1.css'
import './dark-img-3.css'
import './webp-layout.css'

/**
 * Root application layout.
 *
 * Renders the top navigation and an `Outlet` for child routes.
 * Styling is kept minimal and relies on utility classes.
 */


function App() {

  return (
  <div className="min-h-screen">
      <header className="border-b bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">
        <div className="container-app flex items-center justify-between py-4">
          <div className="text-lg font-semibold opacity-95">Kanban Personal Diary</div>
          <nav className="flex gap-6 text-sm">
            <NavLink to="/kanban" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Kanban
            </NavLink>
            <NavLink to="/notes" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Notes
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Tasks
            </NavLink>
            <NavLink to="/theme-layout" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Theme & Layout
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Settings
            </NavLink>
          </nav>
          {/* Theme Selector removed, now in Theme & Layout page */}
        </div>
      </header>
      <main className="container-app py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
