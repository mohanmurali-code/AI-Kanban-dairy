/**
 * Theme Provider Component
 * 
 * A robust theme provider that handles theme initialization, error handling,
 * and provides theme context throughout the application. This component
 * ensures themes are properly applied and provides fallback mechanisms.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePreferencesStore, type ThemeStatus, type ThemeError } from '../store/theme'
import { applyThemeToDocument } from '../store/theme'

interface ThemeContextType {
  isInitialized: boolean
  themeStatus: ThemeStatus
  lastError?: ThemeError
  retryTheme: () => Promise<void>
  clearError: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Theme Provider that handles theme initialization and error handling
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { 
    appearance, 
    themeStatus, 
    lastError, 
    setTheme, 
    clearThemeError,
    retryThemeApplication 
  } = usePreferencesStore()

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Apply the current theme from store
        await applyThemeToDocument(
          appearance.theme,
          appearance.accentColor,
          appearance.highContrast,
          appearance.fontFamily
        )
        
        // Set up system theme change listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemThemeChange = () => {
          if (appearance.theme === 'system') {
            setTheme('system').catch(error => {
              console.error('Failed to update system theme:', error)
            })
          }
        }
        
        mediaQuery.addEventListener('change', handleSystemThemeChange)
        
        setIsInitialized(true)
        
        // Cleanup listener on unmount
        return () => {
          mediaQuery.removeEventListener('change', handleSystemThemeChange)
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error)
        setIsInitialized(true) // Still mark as initialized to prevent infinite loading
      }
    }

    initializeTheme()
  }, []) // Only run on mount

  // Handle theme changes
  useEffect(() => {
    if (isInitialized) {
      applyThemeToDocument(
        appearance.theme,
        appearance.accentColor,
        appearance.highContrast,
        appearance.fontFamily
      ).catch(error => {
        console.error('Failed to apply theme change:', error)
      })
    }
  }, [appearance.theme, appearance.accentColor, appearance.highContrast, appearance.fontFamily, isInitialized])

  const retryTheme = async () => {
    try {
      await retryThemeApplication()
    } catch (error) {
      console.error('Failed to retry theme application:', error)
    }
  }

  const clearError = () => {
    clearThemeError()
  }

  const contextValue: ThemeContextType = {
    isInitialized,
    themeStatus,
    lastError,
    retryTheme,
    clearError
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Theme Error Boundary Component
 * 
 * Displays theme errors and provides recovery options
 */
export function ThemeErrorBoundary({ children }: { children: ReactNode }) {
  const { themeStatus, lastError, retryTheme, clearError } = useTheme()

  if (themeStatus === 'error' && lastError) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[rgb(var(--error))] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <h2 className="text-lg font-semibold text-[rgb(var(--fg))]">
              Theme Error
            </h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-[rgb(var(--fg-muted))] mb-2">
              {lastError.message}
            </p>
            {lastError.details && (
              <p className="text-xs text-[rgb(var(--fg-subtle))]">
                {lastError.details}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={retryTheme}
              className="flex-1 px-3 py-2 bg-[rgb(var(--primary))] text-white rounded hover:opacity-90 transition-opacity text-sm"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="flex-1 px-3 py-2 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--surface-2))] transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Theme Loading Component
 * 
 * Shows loading state while theme is being initialized
 */
export function ThemeLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[rgb(var(--fg-muted))] text-sm">Loading theme...</p>
      </div>
    </div>
  )
}

/**
 * Theme Status Indicator Component
 * 
 * Shows current theme status for debugging
 */
export function ThemeStatusIndicator() {
  const { themeStatus, lastError } = useTheme()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getStatusColor = () => {
    switch (themeStatus) {
      case 'success': return 'bg-[rgb(var(--success))]'
      case 'error': return 'bg-[rgb(var(--error))]'
      case 'loading': return 'bg-[rgb(var(--warning))]'
      default: return 'bg-[rgb(var(--fg-muted))]'
    }
  }

  const getStatusText = () => {
    switch (themeStatus) {
      case 'success': return 'Theme OK'
      case 'error': return 'Theme Error'
      case 'loading': return 'Loading...'
      default: return 'Idle'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-2 py-1 rounded text-xs text-white ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      {lastError && (
        <div className="mt-1 px-2 py-1 bg-[rgb(var(--error))] text-white rounded text-xs">
          {lastError.code}
        </div>
      )}
    </div>
  )
}
