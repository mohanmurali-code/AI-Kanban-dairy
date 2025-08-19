/**
 * Theme Provider Component
 * 
 * A robust theme provider that handles theme initialization, error handling,
 * and provides theme context throughout the application. This component
 * ensures themes are properly applied and provides fallback mechanisms.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePreferencesStore, type ThemeStatus, type ThemeError } from '../store/theme'

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
 * Apply theme to document using CSS custom properties
 */
function applyThemeToDocument(
  theme: string,
  accentColor: string,
  highContrast: boolean,
  fontFamily: string
): void {
  const root = document.documentElement
  
  // Set the theme attribute
  root.setAttribute('data-theme', theme)
  
  // Apply accent color if provided
  if (accentColor) {
    // Convert hex to RGB format for CSS variables
    const rgbValue = hexToRgb(accentColor)
    root.style.setProperty('--primary', rgbValue)
    
    // Create a lighter variant for --primary-light
    const lighterRgb = createLighterVariant(rgbValue)
    root.style.setProperty('--primary-light', lighterRgb)
  }
  
  // Apply high contrast if enabled
  if (highContrast) {
    root.setAttribute('data-theme', 'high-contrast')
  }
  
  // Apply font family
  if (fontFamily && fontFamily !== 'system-ui') {
    root.style.setProperty('--font-family-base', fontFamily)
  }
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `${r} ${g} ${b}`
  }
  return '99 102 241' // Default primary color
}

/**
 * Create a lighter variant of an RGB color
 */
function createLighterVariant(rgbString: string): string {
  const [r, g, b] = rgbString.split(' ').map(Number)
  
  // Make the color lighter by increasing each component
  const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.3))
  const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.3))
  const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.3))
  
  return `${lighterR} ${lighterG} ${lighterB}`
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
        applyThemeToDocument(
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
      )
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

  // Show loading state while initializing
  if (!isInitialized) {
    return <ThemeLoading />
  }

  // Show error state if theme failed to load
  if (themeStatus === 'error' && lastError) {
    return <ThemeErrorDisplay error={lastError} onRetry={retryTheme} onDismiss={clearError} />
  }

  return (
    <ThemeContext.Provider value={{
      isInitialized,
      themeStatus,
      lastError,
      retryTheme,
      clearError
    }}>
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
 * Theme Error Display Component
 * 
 * Shows error state when theme fails to load
 */
function ThemeErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: ThemeError
  onRetry: () => void
  onDismiss: () => void
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[rgb(var(--surface))] border border-[rgb(var(--error))] rounded-lg p-6 shadow-lg">
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
            {error.message}
          </p>
          {error.details && (
            <p className="text-xs text-[rgb(var(--fg-subtle))]">
              {error.details}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="flex-1 px-3 py-2 bg-[rgb(var(--primary))] text-white rounded hover:opacity-90 transition-opacity text-sm"
          >
            Retry
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 px-3 py-2 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--surface-2))] transition-colors text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Theme Loading Component
 * 
 * Shows loading state while theme is being initialized
 */
function ThemeLoading() {
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
  
  // Only show in development mode
  if (window.location.hostname !== 'localhost') {
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
