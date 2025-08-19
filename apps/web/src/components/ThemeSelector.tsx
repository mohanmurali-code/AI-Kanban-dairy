/**
 * Enhanced Theme Selector Component
 * 
 * A robust theme selector that provides theme switching with error handling,
 * loading states, and accessibility features. This component uses the enhanced
 * theme system for reliable theme management.
 */

import React, { useState, useCallback } from 'react'
import { usePreferencesStore, type ThemeMode } from '../store/theme'
import { useTheme } from './ThemeProvider'
import { ThemeAwareCard } from './ThemeAwareCard'

interface ThemeOption {
  id: ThemeMode
  name: string
  description: string
  icon: string
  preview: {
    bg: string
    surface: string
    primary: string
  }
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    icon: '☀️',
    preview: {
      bg: '#f3f4f6',
      surface: '#ffffff',
      primary: '#6366f1'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    icon: '🌙',
    preview: {
      bg: '#0e1420',
      surface: '#1a2332',
      primary: '#63b3ed'
    }
  },
  {
    id: 'system',
    name: 'System',
    description: 'Follows your device settings',
    icon: '⚙️',
    preview: {
      bg: '#f3f4f6',
      surface: '#ffffff',
      primary: '#6366f1'
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum accessibility',
    icon: '🎯',
    preview: {
      bg: '#000000',
      surface: '#000000',
      primary: '#ffff00'
    }
  }
]

export function ThemeSelector() {
  const { appearance, setTheme, setAccentColor, setHighContrast } = usePreferencesStore()
  const { themeStatus, lastError, retryTheme } = useTheme()
  const [isChanging, setIsChanging] = useState(false)
  const [customColor, setCustomColor] = useState(appearance.accentColor)

  const handleThemeChange = useCallback(async (theme: ThemeMode) => {
    setIsChanging(true)
    try {
      await setTheme(theme)
    } catch (error) {
      console.error('Failed to change theme:', error)
    } finally {
      setIsChanging(false)
    }
  }, [setTheme])

  const handleAccentColorChange = useCallback((color: string) => {
    setCustomColor(color)
    setAccentColor(color)
  }, [setAccentColor])

  const handleHighContrastToggle = useCallback((enabled: boolean) => {
    setHighContrast(enabled)
  }, [setHighContrast])

  const handleRetry = useCallback(async () => {
    await retryTheme()
  }, [retryTheme])

  return (
    <div className="space-y-6">
      {/* Theme Status */}
      {themeStatus === 'error' && lastError && (
        <ThemeAwareCard variant="subtle" className="border-[rgb(var(--error))] bg-[rgb(var(--error))] bg-opacity-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[rgb(var(--error))]">Theme Error</h3>
              <p className="text-sm text-[rgb(var(--fg-muted))]">{lastError.message}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-[rgb(var(--error))] text-white rounded hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </ThemeAwareCard>
      )}

      {/* Theme Options */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeOptions.map((option) => (
            <ThemeAwareCard
              key={option.id}
              variant={appearance.theme === option.id ? 'elevated' : 'interactive'}
              className={`relative ${appearance.theme === option.id ? 'ring-2 ring-[rgb(var(--primary))]' : ''}`}
              onClick={() => handleThemeChange(option.id)}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{option.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-[rgb(var(--fg))]">{option.name}</h4>
                  <p className="text-sm text-[rgb(var(--fg-muted))]">{option.description}</p>
                </div>
                {appearance.theme === option.id && (
                  <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></div>
                )}
              </div>
              
              {/* Theme Preview */}
              <div className="mt-3 flex gap-1">
                <div 
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.bg }}
                ></div>
                <div 
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.surface }}
                ></div>
                <div 
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.primary }}
                ></div>
              </div>
            </ThemeAwareCard>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4">Accent Color</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleAccentColorChange(e.target.value)}
              className="w-12 h-12 rounded border border-[rgb(var(--border))] cursor-pointer"
              disabled={isChanging}
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleAccentColorChange(e.target.value)}
              placeholder="#6366f1"
              className="flex-1 px-3 py-2 border border-[rgb(var(--border))] rounded bg-[rgb(var(--surface-2))] text-[rgb(var(--fg))]"
              disabled={isChanging}
            />
          </div>
          
          {/* Preset Colors */}
          <div className="flex gap-2">
            {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
              <button
                key={color}
                onClick={() => handleAccentColorChange(color)}
                className="w-8 h-8 rounded border-2 border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-colors"
                style={{ backgroundColor: color }}
                disabled={isChanging}
                aria-label={`Select ${color} as accent color`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* High Contrast Toggle */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--fg))] mb-4">Accessibility</h3>
        <ThemeAwareCard variant="subtle">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[rgb(var(--fg))]">High Contrast</h4>
              <p className="text-sm text-[rgb(var(--fg-muted))]">
                Enhanced contrast for better accessibility
              </p>
            </div>
            <button
              onClick={() => handleHighContrastToggle(!appearance.highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appearance.highContrast 
                  ? 'bg-[rgb(var(--primary))]' 
                  : 'bg-[rgb(var(--border))]'
              }`}
              disabled={isChanging}
              role="switch"
              aria-checked={appearance.highContrast}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appearance.highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </ThemeAwareCard>
      </div>

      {/* Loading State */}
      {isChanging && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[rgb(var(--fg-muted))]">Changing theme...</span>
        </div>
      )}
    </div>
  )
}

// Export a simplified version for basic use
export function SimpleThemeSelector() {
  const { appearance, setTheme } = usePreferencesStore()
  const { themeStatus } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <select
        value={appearance.theme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className="px-3 py-1 border border-[rgb(var(--border))] rounded bg-[rgb(var(--surface-2))] text-[rgb(var(--fg))] text-sm"
        disabled={themeStatus === 'loading'}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
        <option value="high-contrast">High Contrast</option>
      </select>
      
      {themeStatus === 'loading' && (
        <div className="w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  )
}
