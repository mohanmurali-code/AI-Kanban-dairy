---

## Component Theming Standards & Checklist

To ensure all UI components are fully theme-compliant and future-proof:

- Use only CSS classes and variables defined in theme files (no hardcoded colors or styles).
- Avoid inline styles for theme-dependent properties; rely on classes like `.card`, `.button`, `.badge`, `.muted`, etc.
- Add an optional `className` prop to all components for extra flexibility and overrides.
- Do not use fixed color values for backgrounds, text, borders, or accents—always use theme variables.
- Document these standards in component guidelines and review new components for compliance before merging.

### Checklist for New Components

- [ ] Uses only theme CSS classes and variables for all visual styles
- [ ] Accepts an optional `className` prop for overrides
- [ ] No hardcoded colors/styles for theme-dependent properties
- [ ] Tested with all available themes for correct appearance
- [ ] Reviewed for theme compliance before merge

Following these standards ensures consistent, dynamic theming across your app and makes it easy to add new themes in the future.

# Enhanced Theme System Standards & Guidelines

## Overview

This document defines comprehensive theming standards for the AI-Kanban-dairy application, ensuring consistent, maintainable, and accessible theme implementation across all components.

## Table of Contents

1. [Theme Architecture](#theme-architecture)
2. [CSS Variable Standards](#css-variable-standards)
3. [Component Theming Guidelines](#component-theming-guidelines)
4. [Theme Implementation Checklist](#theme-implementation-checklist)
5. [Accessibility Standards](#accessibility-standards)
6. [Performance Guidelines](#performance-guidelines)
7. [Theme Development Workflow](#theme-development-workflow)

---

## Theme Architecture

### Current Theme System

The application uses a hybrid approach combining:
- **CSS Custom Properties** (CSS Variables) for dynamic theming
- **Tailwind CSS** for utility classes
- **Zustand** for theme state management
- **Scoped theme classes** for complex theme variations

### Theme Structure

```
src/
├── index.css                 # Base CSS variables and global styles
├── store/theme.ts           # Theme state management
├── components/              # Theme-aware components
├── pages/ThemeLayout.tsx    # Theme configuration UI
└── [theme-name].css         # Individual theme files
```

### Theme State Management

```typescript
interface ThemeState {
  appearance: {
    theme: 'light' | 'dark' | 'system' | 'high-contrast'
    accentColor: string
    highContrast: boolean
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
}
```

---

## CSS Variable Standards

### Core Color Variables

All themes must define these core variables:

```css
:root {
  /* Background Colors */
  --bg: 14 34 48;              /* Main background */
  --surface: 20 44 60;         /* Panel backgrounds */
  --surface-2: 26 54 73;       /* Card/input backgrounds */
  
  /* Text Colors */
  --fg: 225 232 238;           /* Primary text */
  --fg-muted: 159 174 186;     /* Secondary text */
  --fg-subtle: 107 114 128;    /* Tertiary text */
  
  /* Accent Colors */
  --primary: 99 179 237;       /* Primary accent */
  --primary-light: 147 197 253; /* Light accent variant */
  --primary-dark: 59 130 246;  /* Dark accent variant */
  
  /* Border Colors */
  --border: 38 66 84;          /* Standard borders */
  --border-subtle: 30 58 75;   /* Subtle borders */
  
  /* Status Colors */
  --success: 34 197 94;        /* Success states */
  --warning: 251 191 36;       /* Warning states */
  --error: 239 68 68;          /* Error states */
  --info: 59 130 246;          /* Info states */
}
```

### Semantic Color Mapping

Use semantic color names for better maintainability:

```css
/* Semantic mappings */
--color-background: rgb(var(--bg));
--color-surface: rgb(var(--surface));
--color-surface-elevated: rgb(var(--surface-2));
--color-text-primary: rgb(var(--fg));
--color-text-secondary: rgb(var(--fg-muted));
--color-text-tertiary: rgb(var(--fg-subtle));
--color-accent: rgb(var(--primary));
--color-border: rgb(var(--border));
```

### Spacing and Typography Variables

```css
:root {
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## Component Theming Guidelines

### 1. Use CSS Variables Only

✅ **Correct:**
```tsx
<div className="bg-[rgb(var(--surface))] text-[rgb(var(--fg))] border-[rgb(var(--border))]">
  Content
</div>
```

❌ **Incorrect:**
```tsx
<div className="bg-gray-800 text-white border-gray-600">
  Content
</div>
```

### 2. Component Class Structure

All components should follow this class naming pattern:

```css
.component-name {
  /* Base styles using CSS variables */
  background-color: rgb(var(--surface));
  color: rgb(var(--fg));
  border: 1px solid rgb(var(--border));
}

.component-name--variant {
  /* Variant styles */
  background-color: rgb(var(--surface-2));
}

.component-name__element {
  /* Element styles */
  color: rgb(var(--fg-muted));
}
```

### 3. Required Component Props

Every component must accept these props:

```tsx
interface ComponentProps {
  className?: string;           // For custom styling
  theme?: 'light' | 'dark';     // For theme-specific behavior
  variant?: 'default' | 'elevated' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}
```

### 4. Theme-Aware Component Example

```tsx
interface CardProps {
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  children: React.ReactNode;
}

export function Card({ className, variant = 'default', children }: CardProps) {
  const baseClasses = "rounded-lg border transition-colors";
  const variantClasses = {
    default: "bg-[rgb(var(--surface))] border-[rgb(var(--border))]",
    elevated: "bg-[rgb(var(--surface-2))] border-[rgb(var(--border-subtle))] shadow-lg",
    subtle: "bg-transparent border-[rgb(var(--border-subtle))]"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </div>
  );
}
```

---

## Theme Implementation Checklist

### For New Components

- [ ] Uses only CSS variables for colors, spacing, and typography
- [ ] Accepts `className` prop for custom styling
- [ ] Implements theme-aware variants (default, elevated, subtle)
- [ ] Supports size variants (sm, md, lg)
- [ ] Includes proper TypeScript interfaces
- [ ] Tested with all available themes
- [ ] Follows accessibility guidelines
- [ ] Includes hover and focus states
- [ ] Uses semantic color names
- [ ] Implements proper contrast ratios

### For New Themes

- [ ] Defines all required CSS variables
- [ ] Implements light and dark variants
- [ ] Includes high-contrast mode support
- [ ] Tested for accessibility compliance
- [ ] Documented color palette and usage
- [ ] Includes theme preview in documentation
- [ ] Follows naming conventions
- [ ] Implements proper fallbacks

### For Theme Modifications

- [ ] Updates all affected components
- [ ] Maintains backward compatibility
- [ ] Updates documentation
- [ ] Tests across all themes
- [ ] Validates accessibility standards
- [ ] Updates theme preview
- [ ] Increments version number

---

## Accessibility Standards

### Color Contrast Requirements

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 4.5:1 contrast ratio

### High Contrast Mode

```css
:root[data-theme='high-contrast'] {
  --bg: 0 0 0;
  --surface: 0 0 0;
  --fg: 255 255 255;
  --border: 255 255 255;
  --primary: 255 255 0;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Indicators

```css
.focus-visible {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}
```

---

## Performance Guidelines

### CSS Variable Optimization

1. **Use RGB values** for better performance
2. **Minimize variable nesting** to reduce lookup time
3. **Group related variables** for better caching
4. **Use CSS custom properties** instead of CSS-in-JS

### Theme Switching Performance

```typescript
// Efficient theme switching
const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
  
  // Add new theme class
  root.classList.add(`theme-${theme}`);
  
  // Update CSS variables
  root.style.setProperty('--primary-rgb', getThemeColors(theme).primary);
};
```

### Lazy Loading Themes

```typescript
// Dynamic theme loading
const loadTheme = async (themeName: string) => {
  if (!loadedThemes.has(themeName)) {
    await import(`./themes/${themeName}.css`);
    loadedThemes.add(themeName);
  }
};
```

---

## Theme Development Workflow

### 1. Theme Creation Process

1. **Define color palette** with accessibility in mind
2. **Create theme CSS file** with all required variables
3. **Implement component variants** for the new theme
4. **Test across all components** and pages
5. **Validate accessibility** compliance
6. **Update documentation** and theme selector
7. **Add theme preview** to documentation

### 2. Component Development Process

1. **Design with theme variables** from the start
2. **Implement all required variants** and sizes
3. **Add proper TypeScript interfaces**
4. **Test with all available themes**
5. **Validate accessibility** standards
6. **Document component usage** and examples
7. **Add to component library** if reusable

### 3. Theme Testing Checklist

- [ ] All components render correctly
- [ ] Color contrast meets accessibility standards
- [ ] Interactive states work properly
- [ ] Typography scales appropriately
- [ ] Spacing is consistent
- [ ] Animations respect reduced motion preferences
- [ ] Focus indicators are visible
- [ ] Theme switching is smooth and performant

---

## Current Theme Inventory

| Theme Name | CSS File | Status | Description |
|------------|----------|--------|-------------|
| Dark Dashboard | `dark-dashboard.css` | ✅ Active | Modern dark theme with purple accent |
| Light Simple | `light-simple.css` | ✅ Active | Clean light theme |
| Dark Image 1 | `dark-img-1.css` | ✅ Active | Dark theme with image backgrounds |
| Dark Image 3 | `dark-img-3.css` | ✅ Active | Alternative dark theme |
| WebP Layout | `webp-layout.css` | ✅ Active | Optimized layout theme |
| High Contrast | Built-in | ✅ Active | Accessibility-focused theme |

---

## Best Practices Summary

1. **Always use CSS variables** for theme-dependent properties
2. **Implement semantic color naming** for better maintainability
3. **Test with all themes** before merging changes
4. **Follow accessibility guidelines** for all color choices
5. **Use TypeScript interfaces** for component props
6. **Document theme usage** and examples
7. **Implement proper fallbacks** for all variables
8. **Optimize for performance** with efficient CSS
9. **Support reduced motion** preferences
10. **Maintain consistent spacing** and typography scales

---

## Maintenance

- **Review themes quarterly** for accessibility compliance
- **Update documentation** when adding new themes
- **Test theme switching** performance regularly
- **Monitor component library** for theme compliance
- **Update color palettes** based on design system changes

---

*Last updated: [Current Date]*
*Version: 2.0*
*Maintainer: Development Team*