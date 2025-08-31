# Theme System Guide

## Overview

The AI Kanban Diary application features a comprehensive, well-organized theme system with **10 professionally designed themes** organized into logical categories. This guide provides complete documentation for developers and users.

## Theme Categories

### 🌟 Light Themes
Clean, bright designs perfect for daytime use and professional environments.

### 🌙 Dark Themes  
Sophisticated dark designs ideal for low-light conditions and modern aesthetics.

### 🎨 Special Themes
Unique designs with distinctive characteristics for specific use cases.

### ♿ Accessibility Themes
WCAG compliant themes designed for maximum accessibility and readability.

## Complete Theme List

### Light Themes

#### 1. **Light Modern** (`theme-light-modern`)
- **File**: `light-modern.css`
- **Description**: Clean and contemporary design with subtle shadows
- **Accent Color**: Indigo (#6366f1)
- **Best For**: Professional work, modern interfaces
- **Features**: Subtle shadows, smooth transitions, indigo accents

#### 2. **Light Classic** (`theme-light-classic`)
- **File**: `light-classic.css`
- **Description**: Simple and clean light theme with blue accents
- **Accent Color**: Blue (#2563eb)
- **Best For**: Traditional interfaces, business applications
- **Features**: Clean lines, blue accents, minimal design

#### 3. **Light Warm** (`theme-light-warm`)
- **File**: `light-warm.css`
- **Description**: Warm and inviting design with amber accents
- **Accent Color**: Amber (#f59e42)
- **Best For**: Personal use, creative applications
- **Features**: Warm tones, rounded corners, amber accents

### Dark Themes

#### 4. **Dark Elegant** (`theme-dark-elegant`)
- **File**: `dark-elegant.css`
- **Description**: Sophisticated dark theme with cyan accents and glassmorphism
- **Accent Color**: Cyan (#00d4ff)
- **Best For**: Premium applications, modern aesthetics
- **Features**: Glassmorphism effects, advanced animations, cyan accents

#### 5. **Dark Dashboard** (`theme-dark-dashboard`)
- **File**: `dark-dashboard.css`
- **Description**: Classic dark dashboard theme with purple accents
- **Accent Color**: Purple (#7c3aed)
- **Best For**: Dashboard applications, data visualization
- **Features**: Classic dark design, purple accents, professional look

#### 6. **Dark Crimson** (`theme-dark-crimson`)
- **File**: `dark-crimson.css`
- **Description**: Bold and energetic dark theme with crimson accents
- **Accent Color**: Crimson (#e11d48)
- **Best For**: Creative applications, bold interfaces
- **Features**: High energy, crimson accents, bold design

#### 7. **Dark Emerald** (`theme-dark-emerald`)
- **File**: `dark-emerald.css`
- **Description**: Fresh and vibrant dark theme with emerald accents
- **Accent Color**: Emerald (#10b981)
- **Best For**: Nature-inspired applications, fresh interfaces
- **Features**: Natural colors, emerald accents, vibrant design

### Special Themes

#### 8. **Special Cozy** (`theme-special-cozy`)
- **File**: `special-cozy.css`
- **Description**: Comfortable and inviting design with warm tones
- **Accent Color**: Orange (#d97706)
- **Best For**: Personal applications, comfort-focused interfaces
- **Features**: Rounded elements, warm colors, comfort-focused design

### Accessibility Themes

#### 9. **High Contrast** (`theme-accessibility-high-contrast`)
- **File**: `accessibility-high-contrast.css`
- **Description**: WCAG compliant high contrast theme
- **Accent Color**: Yellow (#ffff00)
- **Best For**: Accessibility compliance, maximum readability
- **Features**: High contrast, large text, clear focus indicators

## File Structure

```
apps/web/src/themes/
├── index.css                           # Theme index and utilities
├── 
├── light-modern.css                    # Light modern theme
├── light-classic.css                   # Light classic theme
├── light-warm.css                      # Light warm theme
├── 
├── dark-elegant.css                    # Dark elegant theme
├── dark-dashboard.css                  # Dark dashboard theme
├── dark-crimson.css                    # Dark crimson theme
├── dark-emerald.css                    # Dark emerald theme
├── 
├── special-cozy.css                    # Special cozy theme
├── 
├── accessibility-high-contrast.css     # High contrast theme
├── 
├── README.md                           # Theme documentation
├── THEME_REFACTOR_SUMMARY.md          # Refactoring summary
└── THEME_SYSTEM_GUIDE.md              # This guide
```

## CSS Custom Properties

Each theme follows a consistent structure using CSS custom properties:

```css
.theme-[name] {
  /* Background Colors */
  --bg-main: #ffffff;           /* Main background */
  --bg-sidebar: #f5f5f5;        /* Sidebar background */
  --bg-card: #ffffff;           /* Card background */
  
  /* Text Colors */
  --text-main: #1f2937;         /* Primary text */
  --text-muted: #6b7280;        /* Secondary text */
  --text-subtle: #9ca3af;       /* Subtle text */
  
  /* Accent Colors */
  --accent: #6366f1;            /* Primary accent */
  --accent-light: #818cf8;      /* Light accent */
  
  /* Utility Colors */
  --divider: #e5e7eb;           /* Dividers and borders */
  --shadow: 0 1px 3px rgba(0,0,0,0.1); /* Default shadow */
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1); /* Large shadow */
}
```

## Theme Implementation

### Basic Usage

```tsx
import React from 'react';
import { useTheme } from '../utils/themeManager';

function MyComponent() {
  const { currentTheme, setTheme } = useTheme();
  
  return (
    <div className={`theme-container ${currentTheme}`}>
      <h1>Welcome to AI Kanban Diary</h1>
      <button onClick={() => setTheme('theme-light-modern')}>
        Switch to Light Modern
      </button>
    </div>
  );
}
```

### Theme Switching

```tsx
// Switch to a specific theme
setTheme('theme-dark-elegant');

// Get current theme
const currentTheme = getCurrentTheme();

// Get theme configuration
const themeConfig = getThemeConfig('theme-light-warm');
```

## Component Styling

### Cards and Containers

```css
/* All themes support these component classes */
.card, .kanban-column, .task-card {
  background: var(--bg-card);
  border: 1px solid var(--divider);
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}
```

### Buttons

```css
/* Button styling across all themes */
.btn, .button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

### Form Elements

```css
/* Form element styling */
input, textarea, select {
  background: var(--bg-card);
  border: 1px solid var(--divider);
  border-radius: 6px;
  padding: 0.5rem;
  color: var(--text-main);
  transition: border-color 0.2s ease;
}
```

## Accessibility Features

### High Contrast Support
- All themes support high contrast mode
- WCAG AA compliance for color contrast
- Clear focus indicators

### Reduced Motion
- Respects `prefers-reduced-motion` preference
- Smooth transitions can be disabled

### Screen Reader Support
- Semantic HTML structure
- Proper ARIA labels
- Logical tab order

## Performance Optimizations

### CSS Custom Properties
- Efficient theme switching
- No JavaScript re-rendering required
- Hardware-accelerated transitions

### Minimal JavaScript
- Lightweight theme management
- Local storage persistence
- Event-driven architecture

## Browser Support

- **Modern Browsers**: Full support (Chrome 88+, Firefox 87+, Safari 14+)
- **CSS Custom Properties**: IE11+ with polyfill
- **Grid Layout**: IE11+ with polyfill
- **Flexbox**: IE10+ with polyfill

## Migration from Legacy Themes

### Old Theme Names → New Theme Names

| Old Name | New Name | Category |
|----------|----------|----------|
| `modern-minimal` | `light-modern` | Light |
| `light-simple` | `light-classic` | Light |
| `webp-layout` | `light-warm` | Light |
| `dark-img-1` | `dark-crimson` | Dark |
| `dark-img-3` | `dark-emerald` | Dark |
| `warm-cozy` | `special-cozy` | Special |
| `high-contrast` | `accessibility-high-contrast` | Accessibility |

### Migration Steps

1. **Update CSS Classes**: Replace old theme class names with new ones
2. **Update Theme IDs**: Use new theme IDs in theme manager calls
3. **Test Functionality**: Verify all themes work correctly
4. **Update Documentation**: Reference new theme names

## Adding New Themes

### 1. Create CSS File
```css
/* themes/new-theme.css */
.theme-new-theme {
  --bg-main: #ffffff;
  --bg-sidebar: #f5f5f5;
  --bg-card: #ffffff;
  --accent: #your-color;
  /* ... other properties */
}
```

### 2. Add to Index
```css
/* themes/index.css */
@import './new-theme.css';
```

### 3. Register in Theme Manager
```typescript
// utils/themeManager.ts
export const AVAILABLE_THEMES: ThemeConfig[] = [
  // ... existing themes
  {
    id: 'theme-new-theme',
    name: 'New Theme',
    description: 'Description of the new theme',
    category: 'light', // or 'dark', 'accessibility', 'special'
    accentColor: '#your-color',
    preview: {
      bgMain: '#ffffff',
      bgCard: '#ffffff',
      textMain: '#000000',
      accent: '#your-color'
    }
  }
];
```

## Best Practices

### Design Principles
1. **Consistency**: Follow established patterns
2. **Accessibility**: Ensure WCAG compliance
3. **Performance**: Use efficient CSS properties
4. **Maintainability**: Keep code organized and documented

### CSS Guidelines
1. **Use CSS Custom Properties**: For theme-specific values
2. **Consistent Naming**: Follow established conventions
3. **Responsive Design**: Support all screen sizes
4. **Browser Compatibility**: Test across major browsers

### Theme Development
1. **Start with Base**: Use existing theme as template
2. **Test Thoroughly**: Verify across all components
3. **Document Changes**: Update this guide
4. **Performance Test**: Ensure smooth switching

## Troubleshooting

### Common Issues

#### Theme Not Switching
- Check theme ID matches exactly
- Verify CSS file is imported
- Check browser console for errors

#### Styling Not Applied
- Ensure component has theme class
- Check CSS specificity
- Verify CSS custom properties are defined

#### Performance Issues
- Reduce transition complexity
- Use `will-change` sparingly
- Optimize CSS selectors

### Debug Tools

#### Theme Inspector
```javascript
// Check current theme
console.log(getCurrentTheme());

// List all themes
console.log(AVAILABLE_THEMES);

// Check theme configuration
console.log(getThemeConfig('theme-light-modern'));
```

#### CSS Debugging
```css
/* Add to theme for debugging */
.theme-debug * {
  outline: 1px solid red;
}
```

## Future Enhancements

### Planned Features
- **Theme Customization**: User-defined modifications
- **Theme Sharing**: Export/import custom themes
- **Advanced Previews**: More detailed theme previews
- **Theme Analytics**: Usage statistics and preferences

### Technical Improvements
- **CSS-in-JS**: Consider CSS-in-JS for dynamic themes
- **Theme Builder**: Visual theme creation tool
- **Performance Monitoring**: Theme switching metrics
- **Automated Testing**: Theme validation and testing

## Support and Resources

### Documentation
- **This Guide**: Complete theme system documentation
- **Theme Examples**: See individual theme files
- **Component Library**: Check component implementations

### Development
- **Theme Manager**: Core theme management utility
- **Theme Selector**: UI component for theme selection
- **Migration Tools**: Utilities for legacy theme conversion

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Share themes and get help
- **Contributions**: Submit new themes and improvements

---

*This guide covers the complete theme system. For specific implementation details, refer to individual theme files and the theme manager utility.*
