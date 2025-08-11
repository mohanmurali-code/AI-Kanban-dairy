import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const Kanban = React.lazy(() => import('./pages/Kanban'))
const Notes = React.lazy(() => import('./pages/Notes'))
const Tasks = React.lazy(() => import('./pages/Tasks'))
const Themes = React.lazy(() => import('./pages/Themes'))
const Settings = React.lazy(() => import('./pages/Settings'))

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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
