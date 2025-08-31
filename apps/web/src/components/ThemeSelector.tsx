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
      bg: '#fafafa',
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
      bg: '#0f172a',
      surface: '#1e293b',
      primary: '#63b3ed'
    }
  },
  {
    id: 'system',
    name: 'System',
    description: 'Follows your device settings',
    icon: '⚙️',
    preview: {
      bg: '#fafafa',
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

  // Predefined accent colors
  const accentColors = [
    '#7c3aed', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ]

  if (themeStatus === 'error' && lastError) {
    return (
      <div className="bg-[rgb(var(--error))] bg-opacity-10 border border-[rgb(var(--error))] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[rgb(var(--error))]">⚠️</span>
          <span className="font-medium text-[rgb(var(--fg))]">Theme Error</span>
        </div>
        <p className="text-sm text-[rgb(var(--fg-muted))] mb-3">
          {lastError.message}
        </p>
        <button
          onClick={handleRetry}
          className="px-3 py-1 bg-[rgb(var(--error))] text-white rounded text-sm hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Theme Mode Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[rgb(var(--fg))]">Theme Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              disabled={isChanging}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                appearance.theme === option.id
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] bg-opacity-10'
                  : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--surface-2))]'
              } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-[rgb(var(--fg))]">{option.name}</div>
                  <div className="text-sm text-[rgb(var(--fg-muted))]">{option.description}</div>
                </div>
              </div>
              
              {/* Theme Preview */}
              <div className="mt-3 flex gap-1">
                <div
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.bg }}
                />
                <div
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.surface }}
                />
                <div
                  className="w-4 h-4 rounded border border-[rgb(var(--border))]"
                  style={{ backgroundColor: option.preview.primary }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[rgb(var(--fg))]">Accent Color</h3>
        <div className="grid grid-cols-5 gap-2">
          {accentColors.map((color) => (
            <button
              key={color}
              onClick={() => handleAccentColorChange(color)}
              className={`w-full h-10 rounded-md border-2 transition-all ${
                appearance.accentColor === color
                  ? 'border-[rgb(var(--fg))] scale-110'
                  : 'border-transparent hover:border-[rgb(var(--border))]'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        {/* Custom Color Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))] focus:border-[rgb(var(--primary))] focus:outline-none"
            placeholder="Custom HEX color (e.g., #RRGGBB)"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onBlur={() => handleAccentColorChange(customColor)}
          />
          <button
            onClick={() => handleAccentColorChange(customColor)}
            className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>

      {/* High Contrast Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-[rgb(var(--fg))]">High Contrast</h3>
            <p className="text-sm text-[rgb(var(--fg-muted))]">Enhanced accessibility mode</p>
          </div>
          <button
            onClick={() => handleHighContrastToggle(!appearance.highContrast)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              appearance.highContrast
                ? 'bg-[rgb(var(--primary))]'
                : 'bg-[rgb(var(--border))]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                appearance.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isChanging && (
        <div className="flex items-center gap-2 text-[rgb(var(--fg-muted))]">
          <div className="w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Applying theme...</span>
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
