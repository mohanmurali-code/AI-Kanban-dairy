import { NavLink, Outlet } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
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


const themeOptions = [
  { label: 'Dark Dashboard', value: 'theme-dark-dashboard' },
  { label: 'Light Simple', value: 'theme-light-simple' },
  { label: 'Dark Image 1', value: 'theme-dark-img-1' },
  { label: 'Dark Image 3', value: 'theme-dark-img-3' },
  { label: 'WebP Layout', value: 'theme-webp-layout' },
]

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme-dark-dashboard')

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className={`min-h-screen ${theme}`}>
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
            <NavLink to="/themes" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Themes
            </NavLink>
            <NavLink to="/layouts" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Layouts
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-cyan-300 font-medium' : 'opacity-80 hover:opacity-100'}>
              Settings
            </NavLink>
          </nav>
          {/* Theme Selector */}
          <div className="ml-8">
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-main))]"
              aria-label="Select Theme"
            >
              {themeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <main className="container-app py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
