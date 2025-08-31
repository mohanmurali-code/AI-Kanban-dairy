# Theme System Documentation

This directory contains the organized theme system for the Kanban Personal Diary application. The theme system provides a comprehensive, accessible, and user-friendly way to customize the application's appearance.

## Overview

The theme system consists of:
- **Individual theme CSS files** - Each theme is defined in its own CSS file
- **Theme index** - Centralized theme management and utilities
- **Theme manager utility** - TypeScript utility for theme switching and management
- **Theme selector component** - React component for theme selection UI

## Available Themes

### Light Themes
- **Modern Minimal** (`theme-modern-minimal`) - Clean and contemporary design with subtle shadows
- **Light Simple** (`theme-light-simple`) - Simple and clean light theme
- **Warm Cozy** (`theme-warm-cozy`) - Comfortable and inviting with warm tones

### Dark Themes
- **Dark Elegant** (`theme-dark-elegant`) - Sophisticated dark theme with cyan accents
- **Dark Dashboard** (`theme-dark-dashboard`) - Classic dark dashboard theme

### Accessibility Themes
- **High Contrast** (`theme-high-contrast`) - Optimized for accessibility and readability

## File Structure

```
themes/
├── index.css              # Theme index and utilities
├── modern-minimal.css     # Modern minimal theme
├── dark-elegant.css      # Dark elegant theme
├── warm-cozy.css         # Warm cozy theme
├── high-contrast.css     # High contrast theme
└── README.md             # This documentation
```

## Theme Architecture

### CSS Structure
Each theme follows a consistent structure:

```css
.theme-{name} {
  /* CSS Custom Properties */
  --bg-main: #color;
  --bg-sidebar: #color;
  --bg-card: #color;
  --accent: #color;
  --accent-light: #color;
  --text-main: #color;
  --text-muted: #color;
  --text-subtle: #color;
  --divider: #color;
  --shadow-sm: shadow;
  --shadow-md: shadow;
  --shadow-lg: shadow;
}

/* Component Styles */
.theme-{name} .component {
  /* Component-specific styles */
}
```

### Required CSS Variables
Every theme must define these CSS custom properties:

- `--bg-main` - Main background color
- `--bg-sidebar` - Sidebar background color
- `--bg-card` - Card background color
- `--accent` - Primary accent color
- `--accent-light` - Light accent color variant
- `--text-main` - Main text color
- `--text-muted` - Muted text color
- `--text-subtle` - Subtle text color
- `--divider` - Divider/border color

## Usage

### Basic Theme Switching
```typescript
import { themeManager } from '../utils/themeManager';

// Switch to a specific theme
themeManager.setTheme('theme-modern-minimal');

// Get current theme
const currentTheme = themeManager.getCurrentTheme();
```

### Using the Theme Selector Component
```tsx
import ThemeSelector from '../components/ThemeSelector';

// Full theme selector with previews and categories
<ThemeSelector showPreview={true} showCategories={true} />

// Compact theme selector
<ThemeSelector compact={true} />
```

### Subscribing to Theme Changes
```typescript
import { subscribeToThemeChanges } from '../utils/themeManager';

const unsubscribe = subscribeToThemeChanges((themeId) => {
  console.log('Theme changed to:', themeId);
});

// Clean up subscription
unsubscribe();
```

## Creating a New Theme

### 1. Create the CSS File
Create a new CSS file in the `themes/` directory:

```css
/* New Theme Name - Description */
.theme-new-theme {
  --bg-main: #your-color;
  --bg-sidebar: #your-color;
  --bg-card: #your-color;
  --accent: #your-color;
  --accent-light: #your-color;
  --text-main: #your-color;
  --text-muted: #your-color;
  --text-subtle: #your-color;
  --divider: #your-color;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Add component styles following the pattern */
.theme-new-theme {
  background: var(--bg-main);
  color: var(--text-main);
  font-family: 'Inter', system-ui, sans-serif;
}

/* Continue with other component styles... */
```

### 2. Import in Theme Index
Add the import to `themes/index.css`:

```css
@import './new-theme.css';
```

### 3. Register in Theme Manager
Add the theme configuration to `utils/themeManager.ts`:

```typescript
{
  id: 'theme-new-theme',
  name: 'New Theme',
  description: 'Description of your new theme',
  category: 'light', // or 'dark' or 'accessibility'
  accentColor: '#your-accent-color',
  preview: {
    bgMain: '#your-bg-color',
    bgCard: '#your-card-color',
    textMain: '#your-text-color',
    accent: '#your-accent-color'
  }
}
```

## Accessibility Features

All themes include:
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **Focus Indicators** - Clear focus indicators for all interactive elements
- **Reduced Motion Support** - Respects `prefers-reduced-motion` media query
- **High Contrast Support** - Dedicated high contrast theme

## Performance Considerations

- Themes are loaded on-demand
- CSS custom properties provide efficient theme switching
- Minimal JavaScript overhead for theme management
- Optimized for reduced motion preferences

## Browser Support

- Modern browsers with CSS custom properties support
- Graceful degradation for older browsers
- Progressive enhancement approach

## Contributing

When adding new themes:
1. Follow the established naming convention
2. Include all required CSS variables
3. Test with different content types
4. Ensure accessibility compliance
5. Add comprehensive documentation
6. Include preview images if applicable

## Troubleshooting

### Theme Not Loading
- Check that the theme CSS file is properly imported
- Verify the theme ID matches the CSS class name
- Ensure the theme is registered in the theme manager

### Styles Not Applying
- Confirm the theme class is applied to the document element
- Check for CSS specificity conflicts
- Verify CSS custom properties are defined

### Performance Issues
- Use CSS custom properties instead of class-based styling
- Minimize the use of complex selectors
- Consider using CSS containment for large themes
