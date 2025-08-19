# Enhanced Theme System Guide

This guide explains how to use the robust theme system in the Kanban Diary application. The theme system has been enhanced with error handling, performance optimizations, accessibility features, and comprehensive validation.

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Theme Store](#theme-store)
4. [Theme Provider](#theme-provider)
5. [Theme Utilities](#theme-utilities)
6. [Theme Components](#theme-components)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The enhanced theme system provides:

- **Robust Error Handling**: Graceful fallbacks and error recovery
- **Performance Optimizations**: Caching and memoization for better performance
- **Accessibility Compliance**: WCAG AA/AAA contrast validation
- **Type Safety**: Full TypeScript support with proper interfaces
- **Theme Validation**: Comprehensive validation with detailed feedback
- **System Integration**: Automatic system theme detection and switching

## Core Components

### 1. Theme Store (`store/theme.ts`)

The central state management for theme preferences using Zustand with persistence.

```typescript
import { usePreferencesStore } from '../store/theme'

// Access theme state
const { appearance, setTheme, setAccentColor } = usePreferencesStore()

// Change theme
await setTheme('dark')

// Change accent color
setAccentColor('#6366f1')
```

**Key Features:**
- Async theme switching with error handling
- Automatic persistence to localStorage
- Version migration support
- Performance tracking
- Error state management

### 2. Theme Provider (`components/ThemeProvider.tsx`)

Provides theme context and handles initialization.

```typescript
import { ThemeProvider, useTheme } from './components/ThemeProvider'

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use in components
const { themeStatus, lastError, retryTheme } = useTheme()
```

**Components:**
- `ThemeProvider`: Main provider component
- `ThemeErrorBoundary`: Error display and recovery
- `ThemeLoading`: Loading state component
- `ThemeStatusIndicator`: Development status indicator

### 3. Theme Utilities (`utils/themeUtils.ts`)

Helper functions for theme management and validation.

```typescript
import { 
  useThemeStyles, 
  validateThemeColors, 
  generateColorVariants 
} from '../utils/themeUtils'

// Get theme-aware styles
const styles = useThemeStyles()

// Validate theme colors
const validation = validateThemeColors(colors)

// Generate color variants
const variants = generateColorVariants('#6366f1')
```

## Theme Store

### State Structure

```typescript
interface PreferencesState {
  version: number
  appearance: {
    theme: 'light' | 'dark' | 'system' | 'high-contrast'
    highContrast: boolean
    accentColor: string
    fontFamily: 'system-ui' | 'serif' | 'monospace'
    fontSize: 'S' | 'M' | 'L' | 'XL'
    lineSpacing: 'normal' | 'comfortable' | 'relaxed'
    reducedMotion: 'system' | 'on' | 'off'
  }
  layout: {
    sidebar: 'left' | 'right'
    boardDensity: 'compact' | 'cozy' | 'comfortable'
    cardSize: 'S' | 'M' | 'L'
  }
  notifications: {
    dueReminders: { enabled: boolean; lead: '5m' | '15m' | '1h' | '1d' }
    completion: { enabled: boolean }
    quietHours: { enabled: boolean; from: string; to: string }
  }
  behavior: {
    undoWindowSec: number
    animations: 'system' | 'on' | 'off'
  }
  // Theme application state
  themeStatus: 'idle' | 'loading' | 'success' | 'error'
  lastError?: ThemeError
  lastAppliedTheme?: ThemeMode
  themeLoadTime?: number
}
```

### Actions

```typescript
// Theme switching
await setTheme('dark')

// Color customization
setAccentColor('#6366f1')
setHighContrast(true)

// Typography
setFontFamily('serif')
setFontSize('L')
setLineSpacing('comfortable')

// Layout
setSidebarPosition('right')
setBoardDensity('cozy')
setCardSize('M')

// Error handling
clearThemeError()
await retryThemeApplication()
```

## Theme Provider

### Usage

```typescript
import { ThemeProvider, ThemeErrorBoundary } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <ThemeErrorBoundary>
        <YourAppContent />
      </ThemeErrorBoundary>
    </ThemeProvider>
  )
}
```

### Hook Usage

```typescript
import { useTheme } from './components/ThemeProvider'

function MyComponent() {
  const { 
    isInitialized, 
    themeStatus, 
    lastError, 
    retryTheme, 
    clearError 
  } = useTheme()

  if (!isInitialized) {
    return <div>Loading theme...</div>
  }

  if (themeStatus === 'error') {
    return (
      <div>
        <p>Theme error: {lastError?.message}</p>
        <button onClick={retryTheme}>Retry</button>
      </div>
    )
  }

  return <div>Your content</div>
}
```

## Theme Utilities

### Color Management

```typescript
// Convert hex to RGB
const rgb = hexToRgb('#6366f1') // [99, 107, 241]

// Convert RGB to hex
const hex = rgbToHex(99, 107, 241) // '#6366f1'

// Calculate contrast ratio
const ratio = calculateContrastRatio('#000000', '#ffffff') // 21.0

// Validate contrast
const validation = validateContrast('#000000', '#ffffff', 'AA')
// { isValid: true, ratio: 21.0, required: 4.5 }
```

### Color Variants

```typescript
// Generate accessible variants
const variants = generateColorVariants('#6366f1', {
  lightness: 0.1,
  saturation: 0.1,
  alpha: 0.8
})

// Result:
// {
//   light: '#818cf8',
//   dark: '#4f46e5',
//   muted: '#6366f1',
//   alpha: 'rgba(99, 107, 241, 0.8)'
// }
```

### Theme Validation

```typescript
// Validate theme colors
const validation = validateThemeColors({
  bg: '#ffffff',
  surface: '#f3f4f6',
  fg: '#000000',
  primary: '#6366f1'
})

// Result:
// {
//   isValid: true,
//   errors: [],
//   warnings: [],
//   suggestions: ['Theme meets accessibility standards'],
//   accessibility: {
//     aaCompliant: true,
//     aaaCompliant: true,
//     contrastIssues: []
//   }
// }
```

### Theme Styles Hook

```typescript
import { useThemeStyles } from '../utils/themeUtils'

function MyComponent() {
  const styles = useThemeStyles()

  return (
    <div className={styles.bg.surface}>
      <h1 className={styles.text.primary}>Title</h1>
      <p className={styles.text.secondary}>Description</p>
      <button className={styles.interactive.hover}>
        Click me
      </button>
    </div>
  )
}
```

## Theme Components

### ThemeAwareCard

```typescript
import { ThemeAwareCard } from './components/ThemeAwareCard'

function MyComponent() {
  return (
    <ThemeAwareCard
      variant="elevated"
      size="lg"
      title="Card Title"
      subtitle="Card subtitle"
      badge="New"
      badgeVariant="success"
    >
      Card content goes here
    </ThemeAwareCard>
  )
}
```

### ThemeSelector

```typescript
import { ThemeSelector, SimpleThemeSelector } from './components/ThemeSelector'

// Full theme selector
<ThemeSelector />

// Simple theme selector
<SimpleThemeSelector />
```

### ThemeValidator

```typescript
import { ThemeValidator } from './components/ThemeValidator'

// Development tool for theme validation
<ThemeValidator />
```

## Best Practices

### 1. Error Handling

Always handle theme errors gracefully:

```typescript
try {
  await setTheme('dark')
} catch (error) {
  console.error('Theme switching failed:', error)
  // Show user-friendly error message
  showNotification('Failed to switch theme. Please try again.')
}
```

### 2. Performance Optimization

Use memoization for expensive theme operations:

```typescript
import { useMemo } from 'react'

function MyComponent() {
  const styles = useThemeStyles()
  
  const expensiveComputation = useMemo(() => {
    // Expensive theme-related computation
    return computeThemeStyles(styles)
  }, [styles])
}
```

### 3. Accessibility

Always validate contrast ratios:

```typescript
import { validateContrast } from '../utils/themeUtils'

const validation = validateContrast(textColor, backgroundColor, 'AA')
if (!validation.isValid) {
  console.warn('Insufficient contrast ratio')
}
```

### 4. Type Safety

Use proper TypeScript types:

```typescript
import { type ThemeMode, type ThemeError } from '../store/theme'

function handleThemeChange(theme: ThemeMode) {
  // Type-safe theme handling
}
```

### 5. System Integration

Respect user's system preferences:

```typescript
// Use 'system' theme to follow OS settings
await setTheme('system')

// Listen for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', handleSystemThemeChange)
```

## Troubleshooting

### Common Issues

1. **Theme not applying**
   - Check if ThemeProvider is wrapping your app
   - Verify CSS variables are defined in index.css
   - Check browser console for errors

2. **Performance issues**
   - Clear theme cache: `clearThemeCache()`
   - Check for memory leaks in theme components
   - Use React DevTools to profile re-renders

3. **Accessibility warnings**
   - Run ThemeValidator component
   - Check contrast ratios manually
   - Use browser accessibility tools

4. **Persistence issues**
   - Check localStorage quota
   - Verify migration logic for version updates
   - Clear localStorage and reset to defaults

### Debug Tools

```typescript
// Enable development status indicator
<ThemeStatusIndicator />

// Validate current theme
<ThemeValidator />

// Export theme for debugging
const themeExport = exportTheme('Current Theme')
console.log(themeExport)
```

### Error Recovery

```typescript
// Clear theme error
clearThemeError()

// Retry theme application
await retryThemeApplication()

// Reset to defaults
resetToDefaults()
```

## Migration Guide

### From Version 1 to 2

The theme system has been enhanced with new features. Existing themes will be automatically migrated:

1. **New fields added**: `themeStatus`, `lastError`, `lastAppliedTheme`, `themeLoadTime`
2. **Enhanced error handling**: All theme operations now return promises
3. **Performance improvements**: Caching and memoization added
4. **Better accessibility**: Enhanced contrast validation

### Breaking Changes

- `setTheme()` now returns a Promise
- New required CSS variables for enhanced features
- Theme validation is more strict

### Migration Steps

1. Update your App component to use ThemeProvider
2. Handle async theme operations
3. Add error boundaries for theme errors
4. Update CSS variables if needed

## Conclusion

The enhanced theme system provides a robust, performant, and accessible foundation for theming in the Kanban Diary application. By following the best practices outlined in this guide, you can create reliable and user-friendly theme experiences.

For more information, see the individual component documentation and the theme utilities reference.
