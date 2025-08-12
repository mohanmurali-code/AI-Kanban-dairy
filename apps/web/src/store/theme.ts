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
 * Interface for user preference state.
 */
interface PreferencesState {
  version: 1
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
  
  // Actions
  setTheme: (theme: ThemeMode) => void
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
}

const defaultPreferences: PreferencesState = {
  version: 1,
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

  // Actions will be defined below in the create function
  setTheme: () => {},
  setAccentColor: () => {},
  setHighContrast: () => {},
  setFontFamily: () => {},
  setFontSize: () => {},
  setLineSpacing: () => {},
  setSidebarPosition: () => {},
  setBoardDensity: () => {},
  setCardSize: () => {},
  toggleDueReminders: () => {},
  setDueReminderLead: () => {},
  toggleCompletionNotifications: () => {},
  toggleQuietHours: () => {},
  setQuietHours: () => {},
  setUndoWindowSec: () => {},
  setAnimations: () => {},
  resetToDefaults: () => {},
  setCustomAccentColorInput: () => {},
  applyCustomAccentColor: () => {},
}

/**
 * Global preferences store, persisted under the key `kanban-diary-preferences`.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      setTheme: (theme) =>
        set((state) => ({ appearance: { ...state.appearance, theme } })),
      setAccentColor: (color) =>
        set((state) => ({ appearance: { ...state.appearance, accentColor: color } })),
      setHighContrast: (enabled) =>
        set((state) => ({ appearance: { ...state.appearance, highContrast: enabled } })),
      setFontFamily: (font) =>
        set((state) => ({ appearance: { ...state.appearance, fontFamily: font } })),
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
      resetToDefaults: () =>
        set((state) => ({
          ...defaultPreferences,
          customAccentColorInput: '', // Also reset custom input
        })),
    }),
    {
      name: 'kanban-diary-preferences',
      version: defaultPreferences.version,
      // Simple migration for future versions if schema changes
      migrate: (persistedState, version) => {
        const oldState = (persistedState || {}) as any
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
          version: 1,
        }
        return merged
      },
    },
  ),
)

// Helper to apply theme to the document
export const applyThemeToDocument = (theme: ThemeMode, accentColor: string, highContrast: boolean) => {
  const html = document.documentElement

  // Remove existing theme attributes to prevent conflicts
  html.removeAttribute('data-theme')
  html.style.removeProperty('--primary-rgb')
  html.style.removeProperty('--font-family-base') // Remove font family style

  if (highContrast) {
    html.setAttribute('data-theme', 'high-contrast')
  } else {
    html.setAttribute('data-theme', theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme)
    html.style.setProperty('--primary-rgb', hexToRgb(accentColor) || '99 179 237') // Fallback to default
  }

  // Set font family
  const { fontFamily } = usePreferencesStore.getState().appearance
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
}

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
