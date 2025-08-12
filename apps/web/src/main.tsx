import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { usePreferencesStore, applyThemeToDocument } from './store/theme'

/**
 * Application entry point.
 *
 * - Configures client-side routing using `react-router-dom`.
 * - Lazily loads route components to keep the initial bundle small.
 * - Mounts the app into the `#root` element.
 */

const Kanban = React.lazy(() => import('./pages/Kanban'))
const Notes = React.lazy(() => import('./pages/Notes'))
const Tasks = React.lazy(() => import('./pages/Tasks'))
const Themes = React.lazy(() => import('./pages/Themes'))
const Settings = React.lazy(() => import('./pages/Settings'))

/** Router definition and route hierarchy. */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/kanban" replace /> },
      { path: 'kanban', element: <React.Suspense fallback={<div>Loading…</div>}><Kanban /></React.Suspense> },
      { path: 'notes', element: <React.Suspense fallback={<div>Loading…</div>}><Notes /></React.Suspense> },
      { path: 'tasks', element: <React.Suspense fallback={<div>Loading…</div>}><Tasks /></React.Suspense> },
      { path: 'themes', element: <React.Suspense fallback={<div>Loading…</div>}><Themes /></React.Suspense> },
      { path: 'settings', element: <React.Suspense fallback={<div>Loading…</div>}><Settings /></React.Suspense> },
    ],
  },
])

function Main() {
  const { theme, accentColor, highContrast, animations } = usePreferencesStore()

  useEffect(() => {
    applyThemeToDocument(theme, accentColor, highContrast)

    // Handle prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleReducedMotion = () => {
      if (animations === 'system') {
        document.documentElement.classList.toggle('--reduced-motion', mediaQuery.matches)
      } else if (animations === 'off') {
        document.documentElement.classList.classList.add('--reduced-motion')
      } else {
        document.documentElement.classList.remove('--reduced-motion')
      }
    }

    mediaQuery.addEventListener('change', handleReducedMotion)
    handleReducedMotion() // Apply initially

    return () => mediaQuery.removeEventListener('change', handleReducedMotion)
  }, [theme, accentColor, highContrast, animations])

  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
)
