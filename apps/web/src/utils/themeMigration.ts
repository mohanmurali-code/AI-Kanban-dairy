/**
 * Theme Migration Utility
 * Helps migrate existing themes to the new organized theme system
 */

export interface LegacyTheme {
  id: string;
  name: string;
  cssContent: string;
  variables?: Record<string, string>;
}

export interface MigrationResult {
  success: boolean;
  migratedTheme?: string;
  errors: string[];
  warnings: string[];
}

export class ThemeMigration {
  /**
   * Migrate a legacy theme to the new format
   */
  static migrateLegacyTheme(legacyTheme: LegacyTheme): MigrationResult {
    const result: MigrationResult = {
      success: false,
      errors: [],
      warnings: []
    };

    try {
      // Extract CSS custom properties
      const variables = this.extractCSSVariables(legacyTheme.cssContent);
      
      // Validate required variables
      const validation = this.validateRequiredVariables(variables);
      if (!validation.valid) {
        result.errors.push(...validation.errors);
        return result;
      }

      // Generate new theme CSS
      const newThemeCSS = this.generateNewThemeCSS(legacyTheme, variables);
      
      result.migratedTheme = newThemeCSS;
      result.success = true;
      result.warnings.push(...validation.warnings);

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Extract CSS custom properties from CSS content
   */
  private static extractCSSVariables(cssContent: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const variableRegex = /--([^:]+):\s*([^;]+);/g;
    
    let match;
    while ((match = variableRegex.exec(cssContent)) !== null) {
      const [, name, value] = match;
      variables[name.trim()] = value.trim();
    }

    return variables;
  }

  /**
   * Validate that all required variables are present
   */
  private static validateRequiredVariables(variables: Record<string, string>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const required = [
      'bg-main',
      'bg-sidebar', 
      'bg-card',
      'accent',
      'accent-light',
      'text-main',
      'text-muted',
      'text-subtle',
      'divider'
    ];

    const errors: string[] = [];
    const warnings: string[] = [];
    let valid = true;

    // Check for missing required variables
    for (const req of required) {
      if (!variables[req]) {
        errors.push(`Missing required variable: --${req}`);
        valid = false;
      }
    }

    // Check for deprecated variables
    const deprecated = ['primary', 'secondary', 'background', 'foreground'];
    for (const dep of deprecated) {
      if (variables[dep]) {
        warnings.push(`Deprecated variable --${dep} found. Consider updating to new naming convention.`);
      }
    }

    return { valid, errors, warnings };
  }

  /**
   * Generate new theme CSS in the standardized format
   */
  private static generateNewThemeCSS(legacyTheme: LegacyTheme, variables: Record<string, string>): string {
    const themeName = legacyTheme.name.replace(/\s+/g, '-').toLowerCase();
    
    let css = `/* ${legacyTheme.name} Theme - Migrated from legacy format */\n`;
    css += `.theme-${themeName} {\n`;
    
    // Add CSS custom properties
    for (const [name, value] of Object.entries(variables)) {
      css += `  --${name}: ${value};\n`;
    }
    
    // Add default shadow variables if not present
    if (!variables['shadow-sm']) {
      css += `  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);\n`;
    }
    if (!variables['shadow-md']) {
      css += `  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);\n`;
    }
    if (!variables['shadow-lg']) {
      css += `  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);\n`;
    }
    
    css += `}\n\n`;
    
    // Add base theme styles
    css += `.theme-${themeName} {\n`;
    css += `  background: var(--bg-main);\n`;
    css += `  color: var(--text-main);\n`;
    css += `  font-family: 'Inter', system-ui, sans-serif;\n`;
    css += `}\n\n`;
    
    // Add component styles (simplified migration)
    css += this.generateComponentStyles(themeName, variables);
    
    return css;
  }

  /**
   * Generate standardized component styles
   */
  private static generateComponentStyles(themeName: string, variables: Record<string, string>): string {
    let css = '';
    
    // Tabs
    css += `/* Top Heading Tabs */\n`;
    css += `.theme-${themeName} .tabs-bar {\n`;
    css += `  display: flex;\n`;
    css += `  background: var(--bg-main);\n`;
    css += `  border-bottom: 1px solid var(--divider);\n`;
    css += `  gap: 0.5rem;\n`;
    css += `  padding: 0.5rem 1.5rem;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .tab {\n`;
    css += `  padding: 0.75rem 1.5rem;\n`;
    css += `  color: var(--text-muted);\n`;
    css += `  font-weight: 500;\n`;
    css += `  border-radius: 8px 8px 0 0;\n`;
    css += `  background: none;\n`;
    css += `  cursor: pointer;\n`;
    css += `  transition: all 0.2s ease;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .tab.active {\n`;
    css += `  color: var(--accent-light);\n`;
    css += `  background: rgba(var(--accent-rgb, 0, 0, 0), 0.1);\n`;
    css += `  font-weight: 600;\n`;
    css += `}\n\n`;
    
    // Search Bar
    css += `/* Search Bar */\n`;
    css += `.theme-${themeName} .search-bar {\n`;
    css += `  background: var(--bg-card);\n`;
    css += `  border-radius: 8px;\n`;
    css += `  padding: 0.5rem 1rem;\n`;
    css += `  display: flex;\n`;
    css += `  align-items: center;\n`;
    css += `  margin: 1rem 0;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .search-bar input {\n`;
    css += `  background: transparent;\n`;
    css += `  color: var(--text-main);\n`;
    css += `  border: none;\n`;
    css += `  font-size: 1rem;\n`;
    css += `  outline: none;\n`;
    css += `  flex: 1;\n`;
    css += `}\n\n`;
    
    // Cards
    css += `/* Card Arrangement */\n`;
    css += `.theme-${themeName} .cards {\n`;
    css += `  display: grid;\n`;
    css += `  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));\n`;
    css += `  gap: 1.5rem;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .card {\n`;
    css += `  background: var(--bg-card);\n`;
    css += `  border-radius: 12px;\n`;
    css += `  box-shadow: var(--shadow-sm);\n`;
    css += `  padding: 1.25rem;\n`;
    css += `  font-size: 1rem;\n`;
    css += `  transition: all 0.2s ease;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .card:hover {\n`;
    css += `  box-shadow: var(--shadow-md);\n`;
    css += `}\n\n`;
    
    // Buttons
    css += `/* Buttons */\n`;
    css += `.theme-${themeName} .button {\n`;
    css += `  background: var(--accent);\n`;
    css += `  color: white;\n`;
    css += `  border-radius: 8px;\n`;
    css += `  font-weight: 600;\n`;
    css += `  padding: 0.5rem 1.25rem;\n`;
    css += `  border: none;\n`;
    css += `  cursor: pointer;\n`;
    css += `  transition: background 0.2s;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .button:hover {\n`;
    css += `  background: var(--accent-light);\n`;
    css += `}\n\n`;
    
    // Typography
    css += `/* Typography */\n`;
    css += `.theme-${themeName} h1, .theme-${themeName} h2, .theme-${themeName} h3 {\n`;
    css += `  font-weight: 700;\n`;
    css += `  color: var(--text-main);\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} h4, .theme-${themeName} h5, .theme-${themeName} h6 {\n`;
    css += `  font-weight: 600;\n`;
    css += `  color: var(--accent-light);\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} p, .theme-${themeName} span, .theme-${themeName} li {\n`;
    css += `  font-weight: 400;\n`;
    css += `  color: var(--text-main);\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} .muted {\n`;
    css += `  color: var(--text-subtle);\n`;
    css += `}\n\n`;
    
    // Misc
    css += `/* Misc */\n`;
    css += `.theme-${themeName} .divider {\n`;
    css += `  border-top: 1px solid var(--divider);\n`;
    css += `  margin: 1rem 0;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} ::-webkit-scrollbar {\n`;
    css += `  background: var(--bg-card);\n`;
    css += `  width: 8px;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} ::-webkit-scrollbar-thumb {\n`;
    css += `  background: var(--accent);\n`;
    css += `  border-radius: 8px;\n`;
    css += `}\n\n`;
    
    css += `.theme-${themeName} :focus {\n`;
    css += `  outline: 2px solid var(--accent-light);\n`;
    css += `}\n`;
    
    return css;
  }

  /**
   * Generate theme configuration for the theme manager
   */
  static generateThemeConfig(legacyTheme: LegacyTheme, variables: Record<string, string>): any {
    const themeName = legacyTheme.name.replace(/\s+/g, '-').toLowerCase();
    
    return {
      id: `theme-${themeName}`,
      name: legacyTheme.name,
      description: `Migrated from legacy theme: ${legacyTheme.name}`,
      category: this.determineCategory(variables),
      accentColor: variables['accent'] || '#007acc',
      preview: {
        bgMain: variables['bg-main'] || '#ffffff',
        bgCard: variables['bg-card'] || '#ffffff',
        textMain: variables['text-main'] || '#000000',
        accent: variables['accent'] || '#007acc'
      }
    };
  }

  /**
   * Determine theme category based on variables
   */
  private static determineCategory(variables: Record<string, string>): 'light' | 'dark' | 'accessibility' {
    const bgMain = variables['bg-main'] || '';
    const textMain = variables['text-main'] || '';
    
    // Check if it's a high contrast theme
    if (bgMain.includes('#000000') && textMain.includes('#ffffff')) {
      return 'accessibility';
    }
    
    // Check if it's a dark theme
    if (bgMain.includes('#000') || bgMain.includes('#1') || bgMain.includes('#2')) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  }

  /**
   * Batch migrate multiple legacy themes
   */
  static batchMigrate(legacyThemes: LegacyTheme[]): {
    successful: MigrationResult[];
    failed: MigrationResult[];
  } {
    const successful: MigrationResult[] = [];
    const failed: MigrationResult[] = [];

    for (const theme of legacyThemes) {
      const result = this.migrateLegacyTheme(theme);
      if (result.success) {
        successful.push(result);
      } else {
        failed.push(result);
      }
    }

    return { successful, failed };
  }
}

// Export convenience functions
export const migrateTheme = (legacyTheme: LegacyTheme) => ThemeMigration.migrateLegacyTheme(legacyTheme);
export const batchMigrateThemes = (legacyThemes: LegacyTheme[]) => ThemeMigration.batchMigrate(legacyThemes);
export const generateConfig = (legacyTheme: LegacyTheme, variables: Record<string, string>) => 
  ThemeMigration.generateThemeConfig(legacyTheme, variables);
