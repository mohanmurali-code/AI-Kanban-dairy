import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Type for the available theme modes.
 */
export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast'

/**
 * Type for the available font families.
 */
export type FontFamily = 'system-ui' | 'serif' | 'monospace'

/**
 * Type for line spacing options.
 */
export type LineSpacing = 'normal' | 'comfortable' | 'relaxed'

/**
 * Type for board density options.
 */
export type BoardDensity = 'compact' | 'cozy' | 'comfortable'

/**
 * Type for card size options.
 */
export type CardSize = 'S' | 'M' | 'L'

/**
 * Theme application status
 */
export type ThemeStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Interface for theme error information
 */
export interface ThemeError {
  code: string
  message: string
  details?: string
  timestamp: number
}

/**
 * Interface for user preference state.
 */
interface PreferencesState {
  version: 2 // Increment version for new schema
  appearance: {
    theme: ThemeMode
    highContrast: boolean
    accentColor: string // HEX color
    customScheme?: {
      light: { primary: string; surface: string; text: string }
      dark: { primary: string; surface: string; text: string }
    }
    fontFamily: FontFamily
    fontSize: 'S' | 'M' | 'L' | 'XL'
    lineSpacing: LineSpacing
    reducedMotion: 'system' | 'on' | 'off'
  }
  layout: {
    sidebar: 'left' | 'right'
    boardDensity: BoardDensity
    cardSize: CardSize
  }
  notifications: {
    dueReminders: { enabled: boolean; lead: '5m' | '15m' | '1h' | '1d' }
    completion: { enabled: boolean }
    quietHours: { enabled: boolean; from: string; to: string } // "HH:MM" format
  }
  behavior: {
    undoWindowSec: number
    animations: 'system' | 'on' | 'off'
  }
  // Transient state for UI
  customAccentColorInput: string
  
  // Theme application state
  themeStatus: ThemeStatus
  lastError?: ThemeError
  lastAppliedTheme?: ThemeMode
  themeLoadTime?: number
  
  // Actions
  setTheme: (theme: ThemeMode) => Promise<void>
  setAccentColor: (color: string) => void
  setHighContrast: (enabled: boolean) => void
  setFontFamily: (font: FontFamily) => void
  setFontSize: (size: 'S' | 'M' | 'L' | 'XL') => void
  setLineSpacing: (spacing: LineSpacing) => void
  setSidebarPosition: (position: 'left' | 'right') => void
  setBoardDensity: (density: BoardDensity) => void
  setCardSize: (size: CardSize) => void
  toggleDueReminders: (enabled: boolean) => void
  setDueReminderLead: (lead: '5m' | '15m' | '1h' | '1d') => void
  toggleCompletionNotifications: (enabled: boolean) => void
  toggleQuietHours: (enabled: boolean) => void
  setQuietHours: (from: string, to: string) => void
  setUndoWindowSec: (seconds: number) => void
  setAnimations: (animations: 'system' | 'on' | 'off') => void
  resetToDefaults: () => void
  setCustomAccentColorInput: (color: string) => void
  applyCustomAccentColor: () => void
  clearThemeError: () => void
  retryThemeApplication: () => Promise<void>
}

const defaultPreferences: Omit<PreferencesState, 'setTheme' | 'setAccentColor' | 'setHighContrast' | 'setFontFamily' | 'setFontSize' | 'setLineSpacing' | 'setSidebarPosition' | 'setBoardDensity' | 'setCardSize' | 'toggleDueReminders' | 'setDueReminderLead' | 'toggleCompletionNotifications' | 'toggleQuietHours' | 'setQuietHours' | 'setUndoWindowSec' | 'setAnimations' | 'resetToDefaults' | 'setCustomAccentColorInput' | 'applyCustomAccentColor' | 'clearThemeError' | 'retryThemeApplication'> = {
  version: 2,
  appearance: {
    theme: 'system',
    highContrast: false,
    accentColor: '#7c3aed', // Default Indigo 400
    fontFamily: 'system-ui',
    fontSize: 'M',
    lineSpacing: 'normal',
    reducedMotion: 'system',
  },
  layout: {
    sidebar: 'left',
    boardDensity: 'cozy',
    cardSize: 'M',
  },
  notifications: {
    dueReminders: { enabled: true, lead: '15m' },
    completion: { enabled: true },
    quietHours: { enabled: false, from: '22:00', to: '07:00' },
  },
  behavior: {
    undoWindowSec: 10,
    animations: 'system',
  },
  customAccentColorInput: '',
  themeStatus: 'idle',
}

/**
 * Enhanced theme application function with error handling and performance tracking
 */
const applyThemeToDocument = async (
  theme: ThemeMode, 
  accentColor: string, 
  highContrast: boolean,
  fontFamily: FontFamily
): Promise<void> => {
  const startTime = performance.now()
  
  try {
    const html = document.documentElement

    // Remove existing theme attributes to prevent conflicts
    html.removeAttribute('data-theme')
    html.style.removeProperty('--primary-rgb')
    html.style.removeProperty('--font-family-base')

    // Determine actual theme to apply
    let actualTheme = theme
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Apply theme with error handling
    if (highContrast) {
      html.setAttribute('data-theme', 'high-contrast')
    } else {
      html.setAttribute('data-theme', actualTheme)
      
      // Validate and apply accent color
      const rgbValue = hexToRgb(accentColor)
      if (rgbValue) {
        html.style.setProperty('--primary-rgb', rgbValue)
      } else {
        // Fallback to default if invalid color
        html.style.setProperty('--primary-rgb', '99 179 237')
        console.warn('Invalid accent color provided, using fallback')
      }
    }

    // Set font family with validation
    let fontStack = ''
    switch (fontFamily) {
      case 'serif':
        fontStack = 'serif'
        break
      case 'monospace':
        fontStack = 'monospace'
        break
      default:
        fontStack = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    }
    html.style.setProperty('--font-family-base', fontStack)

    // Verify theme was applied correctly
    const appliedTheme = html.getAttribute('data-theme')
    if (!appliedTheme) {
      throw new Error('Theme attribute was not set correctly')
    }

    const loadTime = performance.now() - startTime
    return Promise.resolve()
  } catch (error) {
    const loadTime = performance.now() - startTime
    throw {
      code: 'THEME_APPLICATION_FAILED',
      message: 'Failed to apply theme to document',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      loadTime
    }
  }
}

/**
 * Global preferences store, persisted under the key `kanban-diary-preferences`.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      setTheme: async (theme) => {
        const state = get()
        set({ themeStatus: 'loading' })
        
        try {
          await applyThemeToDocument(
            theme, 
            state.appearance.accentColor, 
            state.appearance.highContrast,
            state.appearance.fontFamily
          )
          
          set((state) => ({ 
            appearance: { ...state.appearance, theme },
            themeStatus: 'success',
            lastAppliedTheme: theme,
            themeLoadTime: performance.now(),
            lastError: undefined
          }))
        } catch (error) {
          const themeError: ThemeError = {
            code: 'THEME_SWITCH_FAILED',
            message: 'Failed to switch theme',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          }
          
          set((state) => ({ 
            themeStatus: 'error',
            lastError: themeError,
            // Keep the old theme if switching failed
            appearance: { ...state.appearance }
          }))
          
          console.error('Theme switching failed:', themeError)
        }
      },
      setAccentColor: (color) => {
        const state = get()
        set((state) => ({ appearance: { ...state.appearance, accentColor: color } }))
        
        // Re-apply theme with new accent color
        applyThemeToDocument(
          state.appearance.theme, 
          color, 
          state.appearance.highContrast,
          state.appearance.fontFamily
        ).catch(error => {
          console.error('Failed to apply accent color:', error)
        })
      },
      setHighContrast: (enabled) => {
        const state = get()
        set((state) => ({ appearance: { ...state.appearance, highContrast: enabled } }))
        
        // Re-apply theme with new high contrast setting
        applyThemeToDocument(
          state.appearance.theme, 
          state.appearance.accentColor, 
          enabled,
          state.appearance.fontFamily
        ).catch(error => {
          console.error('Failed to apply high contrast setting:', error)
        })
      },
      setFontFamily: (font) => {
        const state = get()
        set((state) => ({ appearance: { ...state.appearance, fontFamily: font } }))
        
        // Re-apply theme with new font family
        applyThemeToDocument(
          state.appearance.theme, 
          state.appearance.accentColor, 
          state.appearance.highContrast,
          font
        ).catch(error => {
          console.error('Failed to apply font family:', error)
        })
      },
      setFontSize: (size) =>
        set((state) => ({ appearance: { ...state.appearance, fontSize: size } })),
      setLineSpacing: (spacing) =>
        set((state) => ({ appearance: { ...state.appearance, lineSpacing: spacing } })),
      setSidebarPosition: (position) =>
        set((state) => ({ layout: { ...state.layout, sidebar: position } })),
      setBoardDensity: (density) =>
        set((state) => ({ layout: { ...state.layout, boardDensity: density } })),
      setCardSize: (size) =>
        set((state) => ({ layout: { ...state.layout, cardSize: size } })),
      toggleDueReminders: (enabled) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            dueReminders: { ...state.notifications.dueReminders, enabled },
          },
        })),
      setDueReminderLead: (lead) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            dueReminders: { ...state.notifications.dueReminders, lead },
          },
        })),
      toggleCompletionNotifications: (enabled) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            completion: { ...state.notifications.completion, enabled },
          },
        })),
      toggleQuietHours: (enabled) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            quietHours: { ...state.notifications.quietHours, enabled },
          },
        })),
      setQuietHours: (from, to) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            quietHours: { ...state.notifications.quietHours, from, to },
          },
        })),
      setUndoWindowSec: (seconds) =>
        set((state) => ({
          behavior: { ...state.behavior, undoWindowSec: seconds },
        })),
      setAnimations: (animations) =>
        set((state) => ({
          behavior: { ...state.behavior, animations },
        })),
      setCustomAccentColorInput: (color: string) =>
        set(() => ({ customAccentColorInput: color })),
      applyCustomAccentColor: () => {
        const { customAccentColorInput } = get()
        if (hexToRgb(customAccentColorInput)) {
          set((state) => ({
            appearance: { ...state.appearance, accentColor: customAccentColorInput },
            customAccentColorInput: '', // Clear input on successful apply
          }))
        }
      },
      resetToDefaults: () => {
        const state = get()
        set((state) => ({
          ...defaultPreferences,
          customAccentColorInput: '', // Also reset custom input
        }))
        
        // Re-apply default theme
        applyThemeToDocument(
          defaultPreferences.appearance.theme,
          defaultPreferences.appearance.accentColor,
          defaultPreferences.appearance.highContrast,
          defaultPreferences.appearance.fontFamily
        ).catch(error => {
          console.error('Failed to apply default theme:', error)
        })
      },
      clearThemeError: () => {
        set({ lastError: undefined, themeStatus: 'idle' })
      },
      retryThemeApplication: async () => {
        const state = get()
        if (state.lastAppliedTheme) {
          await get().setTheme(state.lastAppliedTheme)
        }
      }
    }),
    {
      name: 'kanban-diary-preferences',
      version: defaultPreferences.version,
      // Enhanced migration for future versions if schema changes
      migrate: (persistedState, version) => {
        const oldState = (persistedState || {}) as any
        
        // Handle version 1 to 2 migration
        if (version === 1) {
          const migratedState = {
            ...defaultPreferences,
            ...oldState,
            version: 2,
            // Add new fields with defaults
            themeStatus: 'idle' as ThemeStatus,
            appearance: {
              ...defaultPreferences.appearance,
              ...(oldState.appearance || {}),
            },
            layout: {
              ...defaultPreferences.layout,
              ...(oldState.layout || {}),
            },
            notifications: {
              ...defaultPreferences.notifications,
              ...(oldState.notifications || {}),
              dueReminders: {
                ...defaultPreferences.notifications.dueReminders,
                ...(oldState.notifications?.dueReminders || {}),
              },
              completion: {
                ...defaultPreferences.notifications.completion,
                ...(oldState.notifications?.completion || {}),
              },
              quietHours: {
                ...defaultPreferences.notifications.quietHours,
                ...(oldState.notifications?.quietHours || {}),
              },
            },
            behavior: {
              ...defaultPreferences.behavior,
              ...(oldState.behavior || {}),
            },
          }
          
          // Apply the migrated theme
          setTimeout(() => {
            applyThemeToDocument(
              migratedState.appearance.theme,
              migratedState.appearance.accentColor,
              migratedState.appearance.highContrast,
              migratedState.appearance.fontFamily
            ).catch(error => {
              console.error('Failed to apply migrated theme:', error)
            })
          }, 0)
          
          return migratedState
        }
        
        // Deep-merge with defaults so incomplete nested objects don't wipe required defaults
        const merged: PreferencesState = {
          ...defaultPreferences,
          ...oldState,
          appearance: {
            ...defaultPreferences.appearance,
            ...(oldState.appearance || {}),
          },
          layout: {
            ...defaultPreferences.layout,
            ...(oldState.layout || {}),
          },
          notifications: {
            ...defaultPreferences.notifications,
            ...(oldState.notifications || {}),
            dueReminders: {
              ...defaultPreferences.notifications.dueReminders,
              ...(oldState.notifications?.dueReminders || {}),
            },
            completion: {
              ...defaultPreferences.notifications.completion,
              ...(oldState.notifications?.completion || {}),
            },
            quietHours: {
              ...defaultPreferences.notifications.quietHours,
              ...(oldState.notifications?.quietHours || {}),
            },
          },
          behavior: {
            ...defaultPreferences.behavior,
            ...(oldState.behavior || {}),
          },
          version: 2,
        }
        return merged
      },
    },
  ),
)

// Basic hex to RGB converter for CSS variables
function hexToRgb(hex?: string | null): string | null {
  if (!hex || typeof hex !== 'string') return null
  const trimmed = hex.trim()
  if (trimmed.length === 0) return null
  // Ensure leading '#'
  let normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  // Expand shorthand like #abc to #aabbcc
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  normalized = normalized.replace(shorthandRegex, function (_m, r, g, b) {
    return `#${r}${r}${g}${g}${b}${b}`
  })
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null
}

// Export the enhanced theme application function for external use
export { applyThemeToDocument }
