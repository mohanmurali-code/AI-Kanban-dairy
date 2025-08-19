/**
 * Theme Manager Utility
 * Handles theme switching, persistence, and management
 */

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'accessibility' | 'special';
  accentColor: string;
  preview: {
    bgMain: string;
    bgCard: string;
    textMain: string;
    accent: string;
  };
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  // ===== LIGHT THEMES =====
  {
    id: 'theme-light-modern',
    name: 'Light Modern',
    description: 'Clean and contemporary design with subtle shadows and indigo accents',
    category: 'light',
    accentColor: '#6366f1',
    preview: {
      bgMain: '#fafafa',
      bgCard: '#ffffff',
      textMain: '#1f2937',
      accent: '#6366f1'
    }
  },
  {
    id: 'theme-light-classic',
    name: 'Light Classic',
    description: 'Simple and clean light theme with blue accents',
    category: 'light',
    accentColor: '#2563eb',
    preview: {
      bgMain: '#f7fafc',
      bgCard: '#ffffff',
      textMain: '#1e293b',
      accent: '#2563eb'
    }
  },
  {
    id: 'theme-light-warm',
    name: 'Light Warm',
    description: 'Warm and inviting design with amber accents',
    category: 'light',
    accentColor: '#f59e42',
    preview: {
      bgMain: '#f3f4f6',
      bgCard: '#ffffff',
      textMain: '#22223b',
      accent: '#f59e42'
    }
  },

  // ===== DARK THEMES =====
  {
    id: 'theme-dark-elegant',
    name: 'Dark Elegant',
    description: 'Sophisticated dark theme with cyan accents and glassmorphism effects',
    category: 'dark',
    accentColor: '#00d4ff',
    preview: {
      bgMain: '#0f0f23',
      bgCard: '#16213e',
      textMain: '#e8e8e8',
      accent: '#00d4ff'
    }
  },
  {
    id: 'theme-dark-dashboard',
    name: 'Dark Dashboard',
    description: 'Classic dark dashboard theme with purple accents',
    category: 'dark',
    accentColor: '#7c3aed',
    preview: {
      bgMain: '#181a20',
      bgCard: '#23263a',
      textMain: '#f9fafb',
      accent: '#7c3aed'
    }
  },
  {
    id: 'theme-dark-crimson',
    name: 'Dark Crimson',
    description: 'Bold and energetic dark theme with crimson accents',
    category: 'dark',
    accentColor: '#e11d48',
    preview: {
      bgMain: '#16181d',
      bgCard: '#23263a',
      textMain: '#f3f4f6',
      accent: '#e11d48'
    }
  },
  {
    id: 'theme-dark-emerald',
    name: 'Dark Emerald',
    description: 'Fresh and vibrant dark theme with emerald accents',
    category: 'dark',
    accentColor: '#10b981',
    preview: {
      bgMain: '#181820',
      bgCard: '#23263a',
      textMain: '#f9fafb',
      accent: '#10b981'
    }
  },

  // ===== SPECIAL THEMES =====
  {
    id: 'theme-special-cozy',
    name: 'Special Cozy',
    description: 'Comfortable and inviting design with warm tones and rounded elements',
    category: 'special',
    accentColor: '#d97706',
    preview: {
      bgMain: '#fef7f0',
      bgCard: '#ffffff',
      textMain: '#292524',
      accent: '#d97706'
    }
  },

  // ===== ACCESSIBILITY THEMES =====
  {
    id: 'theme-accessibility-high-contrast',
    name: 'High Contrast',
    description: 'WCAG compliant high contrast theme for maximum accessibility',
    category: 'accessibility',
    accentColor: '#ffff00',
    preview: {
      bgMain: '#000000',
      bgCard: '#000000',
      textMain: '#ffffff',
      accent: '#ffff00'
    }
  }
];

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: string = 'theme-dark-dashboard';
  private listeners: Set<(theme: string) => void> = new Set();

  private constructor() {
    this.loadThemeFromStorage();
    this.applyTheme(this.currentTheme);
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Get all available themes
   */
  getThemes(): ThemeConfig[] {
    return AVAILABLE_THEMES;
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category: 'light' | 'dark' | 'accessibility'): ThemeConfig[] {
    return AVAILABLE_THEMES.filter(theme => theme.category === category);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Get current theme config
   */
  getCurrentThemeConfig(): ThemeConfig | undefined {
    return AVAILABLE_THEMES.find(theme => theme.id === this.currentTheme);
  }

  /**
   * Set and apply a new theme
   */
  setTheme(themeId: string): boolean {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (!theme) {
      console.warn(`Theme "${themeId}" not found`);
      return false;
    }

    this.currentTheme = themeId;
    this.applyTheme(themeId);
    this.saveThemeToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(themeId: string): void {
    const html = document.documentElement;
    
    // Remove all existing theme classes
    AVAILABLE_THEMES.forEach(theme => {
      html.classList.remove(theme.id);
    });

    // Add the new theme class
    html.classList.add(themeId);

    // Set CSS custom properties for the theme
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (theme) {
      html.style.setProperty('--current-theme-accent', theme.accentColor);
    }

    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeId, config: theme }
    }));
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: string) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Load theme from localStorage
   */
  private loadThemeFromStorage(): void {
    try {
      const savedTheme = localStorage.getItem('kanban-theme');
      if (savedTheme && AVAILABLE_THEMES.some(t => t.id === savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveThemeToStorage(): void {
    try {
      localStorage.setItem('kanban-theme', this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }

  /**
   * Get theme preview styles
   */
  getThemePreviewStyles(themeId: string): React.CSSProperties {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (!theme) return {};

    return {
      backgroundColor: theme.preview.bgMain,
      color: theme.preview.textMain,
      border: `2px solid ${theme.preview.accent}`,
    };
  }

  /**
   * Check if theme supports reduced motion
   */
  supportsReducedMotion(themeId: string): boolean {
    return true; // All themes support reduced motion
  }

  /**
   * Get theme accessibility features
   */
  getAccessibilityFeatures(themeId: string): string[] {
    const features: string[] = [];
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    
    if (!theme) return features;

    if (theme.category === 'accessibility') {
      features.push('High Contrast', 'Large Text', 'Clear Focus Indicators');
    }

    if (theme.category === 'dark') {
      features.push('Dark Mode', 'Reduced Eye Strain');
    }

    features.push('Keyboard Navigation', 'Screen Reader Support');

    return features;
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    this.setTheme('theme-dark-dashboard');
  }

  /**
   * Get theme statistics
   */
  getThemeStats(): { total: number; byCategory: Record<string, number> } {
    const byCategory = AVAILABLE_THEMES.reduce((acc, theme) => {
      acc[theme.category] = (acc[theme.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: AVAILABLE_THEMES.length,
      byCategory
    };
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();

// Export convenience functions
export const setTheme = (themeId: string) => themeManager.setTheme(themeId);
export const getCurrentTheme = () => themeManager.getCurrentTheme();
export const getThemes = () => themeManager.getThemes();
export const subscribeToThemeChanges = (callback: (theme: string) => void) => 
  themeManager.subscribe(callback);
