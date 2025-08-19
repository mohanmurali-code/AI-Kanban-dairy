/**
 * Theme Registry System
 * 
 * Manages dynamic loading and application of individual theme CSS files
 * across the entire application.
 */

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  category: 'light' | 'dark' | 'accessibility' | 'special'
  preview: {
    bgMain: string
    textMain: string
    accent: string
  }
  cssFile: string
  accentColor: string
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'light-classic',
    name: 'Light Classic',
    description: 'Clean, minimal light theme with classic styling',
    category: 'light',
    preview: {
      bgMain: '#ffffff',
      textMain: '#1f2937',
      accent: '#3b82f6'
    },
    cssFile: 'light-classic.css',
    accentColor: '#3b82f6'
  },
  {
    id: 'light-modern',
    name: 'Light Modern',
    description: 'Contemporary light theme with modern aesthetics',
    category: 'light',
    preview: {
      bgMain: '#f8fafc',
      textMain: '#0f172a',
      accent: '#6366f1'
    },
    cssFile: 'light-modern.css',
    accentColor: '#6366f1'
  },
  {
    id: 'light-warm',
    name: 'Light Warm',
    description: 'Warm, cozy light theme with soft colors',
    category: 'light',
    preview: {
      bgMain: '#fef7ed',
      textMain: '#292524',
      accent: '#f59e0b'
    },
    cssFile: 'light-warm.css',
    accentColor: '#f59e0b'
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    description: 'Sophisticated dark theme with elegant styling',
    category: 'dark',
    preview: {
      bgMain: '#0f0f23',
      textMain: '#e8e8e8',
      accent: '#00d4ff'
    },
    cssFile: 'dark-elegant.css',
    accentColor: '#00d4ff'
  },
  {
    id: 'dark-dashboard',
    name: 'Dark Dashboard',
    description: 'Professional dark theme optimized for dashboards',
    category: 'dark',
    preview: {
      bgMain: '#0f172a',
      textMain: '#f1f5f9',
      accent: '#06b6d4'
    },
    cssFile: 'dark-dashboard.css',
    accentColor: '#06b6d4'
  },
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    description: 'Rich dark theme with emerald accents',
    category: 'dark',
    preview: {
      bgMain: '#064e3b',
      textMain: '#ecfdf5',
      accent: '#10b981'
    },
    cssFile: 'dark-emerald.css',
    accentColor: '#10b981'
  },
  {
    id: 'dark-crimson',
    name: 'Dark Crimson',
    description: 'Bold dark theme with crimson highlights',
    category: 'dark',
    preview: {
      bgMain: '#450a0a',
      textMain: '#fef2f2',
      accent: '#dc2626'
    },
    cssFile: 'dark-crimson.css',
    accentColor: '#dc2626'
  },
  {
    id: 'accessibility-high-contrast',
    name: 'High Contrast',
    description: 'Accessibility-focused theme with maximum contrast',
    category: 'accessibility',
    preview: {
      bgMain: '#000000',
      textMain: '#ffffff',
      accent: '#ffff00'
    },
    cssFile: 'accessibility-high-contrast.css',
    accentColor: '#ffff00'
  },
  {
    id: 'special-cozy',
    name: 'Cozy Special',
    description: 'Unique cozy theme with special styling',
    category: 'special',
    preview: {
      bgMain: '#2d1b69',
      textMain: '#f3e8ff',
      accent: '#a855f7'
    },
    cssFile: 'special-cozy.css',
    accentColor: '#a855f7'
  }
]

class ThemeRegistry {
  private loadedThemes = new Set<string>()
  private currentTheme: string | null = null

  /**
   * Load a theme CSS file dynamically
   */
  async loadTheme(themeId: string): Promise<void> {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId)
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`)
    }

    // If theme is already loaded, just apply it
    if (this.loadedThemes.has(themeId)) {
      this.applyTheme(themeId)
      return
    }

    try {
      // Load the CSS file
      await this.loadCSSFile(theme.cssFile)
      this.loadedThemes.add(themeId)
      this.applyTheme(themeId)
    } catch (error) {
      console.error(`Failed to load theme ${themeId}:`, error)
      throw error
    }
  }

  /**
   * Load CSS file from the themes directory
   */
  private async loadCSSFile(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = `/themes/${filename}` // Vite public path
      
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to load CSS file: ${filename}`))
      
      document.head.appendChild(link)
    })
  }

  /**
   * Apply a theme to the document
   */
  private applyTheme(themeId: string): void {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId)
    if (!theme) return

    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove(...Array.from(this.loadedThemes))
    
    // Add the new theme class
    root.classList.add(themeId)
    
    // Set the theme attribute
    root.setAttribute('data-theme', themeId)
    
    // Apply accent color
    if (theme.accentColor) {
      const rgbValue = this.hexToRgb(theme.accentColor)
      if (rgbValue) {
        root.style.setProperty('--primary', rgbValue)
        const lighterRgb = this.createLighterVariant(rgbValue)
        root.style.setProperty('--primary-light', lighterRgb)
      }
    }

    this.currentTheme = themeId
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeId, config: theme }
    }))
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string | null {
    return this.currentTheme
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): ThemeDefinition[] {
    return AVAILABLE_THEMES
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): ThemeDefinition | undefined {
    return AVAILABLE_THEMES.find(t => t.id === themeId)
  }

  /**
   * Check if theme is loaded
   */
  isThemeLoaded(themeId: string): boolean {
    return this.loadedThemes.has(themeId)
  }

  /**
   * Convert hex to RGB
   */
  private hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `${r} ${g} ${b}`
    }
    return null
  }

  /**
   * Create lighter variant
   */
  private createLighterVariant(rgbString: string): string {
    const [r, g, b] = rgbString.split(' ').map(Number)
    
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.3))
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.3))
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.3))
    
    return `${lighterR} ${lighterG} ${lighterB}`
  }
}

// Export singleton instance
export const themeRegistry = new ThemeRegistry()
export default themeRegistry
