import { NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider, ThemeStatusIndicator } from './components/ThemeProvider'
import { initializeAutoBackup, cleanupAutoBackup } from './utils/autoBackup'
// Theme styles now consolidated in main index.css

/**
 * Root application layout.
 *
 * Renders the top navigation and an `Outlet` for child routes.
 * Styling is kept minimal and relies on utility classes.
 * Now includes robust theme handling with error boundaries and loading states.
 * Uses the new organized theme system from /themes/index.css
 */

function App() {
  // Initialize auto-backup system
  useEffect(() => {
    initializeAutoBackup()
    
    // Cleanup on unmount
    return () => {
      cleanupAutoBackup()
    }
  }, [])

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <header className="border-b bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">
          <div className="container-app flex items-center justify-between py-4">
            <div className="text-lg font-semibold opacity-95">Kanban Personal Diary</div>
            <nav className="flex gap-6 text-sm">
              <NavLink to="/" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Home
              </NavLink>
              <NavLink to="/kanban" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Kanban
              </NavLink>
              <NavLink to="/notes" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Notes
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Tasks
              </NavLink>
              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Calendar
              </NavLink>
              <NavLink to="/themes" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Themes & Layout
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
                Settings
              </NavLink>
            </nav>
            {/* Theme Selector removed, now in Themes & Layout page */}
          </div>
        </header>
        <main className="container-app py-8">
          <Outlet />
        </main>
        
        {/* Development theme status indicator */}
        <ThemeStatusIndicator />
      </div>
    </ThemeProvider>
  )
}

export default App
