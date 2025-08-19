# Theme Development Guide

## Quick Start

This guide provides step-by-step instructions for implementing the enhanced theming standards in your AI Kanban dairy project.

## Table of Contents

1. [Setting Up a New Theme](#setting-up-a-new-theme)
2. [Creating Theme-Aware Components](#creating-theme-aware-components)
3. [Testing and Validation](#testing-and-validation)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## Setting Up a New Theme

### Step 1: Create Theme CSS File

Create a new CSS file in `apps/web/src/` with the naming convention `[theme-name].css`:

```css
/* apps/web/src/my-new-theme.css */

/* Theme-specific CSS variables */
.theme-my-new-theme {
  /* Background Colors */
  --bg: 18 26 36;              /* Main background */
  --surface: 24 32 42;         /* Panel backgrounds */
  --surface-2: 30 38 48;       /* Card/input backgrounds */
  
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

/* Theme-specific component styles */
.theme-my-new-theme .card {
  background: rgb(var(--surface));
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-my-new-theme .button {
  background: rgb(var(--primary));
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  transition: background-color 0.2s;
}

.theme-my-new-theme .button:hover {
  background: rgb(var(--primary-dark));
}
```

### Step 2: Import Theme in App.tsx

Add the import to your main App component:

```tsx
// apps/web/src/App.tsx
import './my-new-theme.css'
```

### Step 3: Add Theme to Theme Selector

Update the theme options in your ThemeLayout component:

```tsx
// apps/web/src/pages/ThemeLayout.tsx
const themeOptions = [
  { label: 'Dark Dashboard', value: 'theme-dark-dashboard' },
  { label: 'Light Simple', value: 'theme-light-simple' },
  { label: 'My New Theme', value: 'theme-my-new-theme' }, // Add your theme
  // ... other themes
];
```

### Step 4: Update Documentation

Add your theme to the theme inventory in the README:

```markdown
| Theme Name | CSS File | Status | Description |
|------------|----------|--------|-------------|
| My New Theme | `my-new-theme.css` | ✅ Active | Your theme description |
```

---

## Creating Theme-Aware Components

### Step 1: Use Theme Utilities

Import the theme utilities in your component:

```tsx
import { useThemeStyles, createComponentVariants } from '../utils/themeUtils'
```

### Step 2: Define Component Interface

Create a TypeScript interface following the standards:

```tsx
interface MyComponentProps {
  /** Custom CSS classes to apply */
  className?: string
  /** Visual variant of the component */
  variant?: 'default' | 'elevated' | 'subtle'
  /** Size variant of the component */
  size?: 'sm' | 'md' | 'lg'
  /** Component content */
  children: React.ReactNode
  /** Optional click handler */
  onClick?: () => void
}
```

### Step 3: Implement Component Variants

Use the utility function to create variants:

```tsx
const componentVariants = createComponentVariants({
  default: 'bg-[rgb(var(--surface))] border-[rgb(var(--border))]',
  elevated: 'bg-[rgb(var(--surface-2))] border-[rgb(var(--border-subtle))] shadow-lg',
  subtle: 'bg-transparent border-[rgb(var(--border-subtle))]'
})

const componentSizes = createComponentVariants({
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
})
```

### Step 4: Build the Component

```tsx
export function MyComponent({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  onClick
}: MyComponentProps) {
  const themeStyles = useThemeStyles()
  
  const baseClasses = 'rounded-lg border transition-colors'
  const variantClasses = componentVariants(variant, className)
  const sizeClasses = componentSizes(size)
  
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
      `.trim()}
      onClick={onClick}
    >
      <div className={themeStyles.text.primary}>
        {children}
      </div>
    </div>
  )
}
```

---

## Testing and Validation

### Step 1: Use Theme Validator

Add the ThemeValidator component to your development environment:

```tsx
import { ThemeValidator } from '../components/ThemeValidator'

// In your development page or component
<ThemeValidator />
```

### Step 2: Test Across All Themes

Create a test component to verify your component works with all themes:

```tsx
function ComponentTestSuite() {
  const themes = ['theme-dark-dashboard', 'theme-light-simple', 'theme-my-new-theme']
  
  return (
    <div className="space-y-8">
      {themes.map(theme => (
        <div key={theme} className={theme}>
          <h3 className="text-lg font-semibold mb-4">{theme}</h3>
          <div className="space-y-4">
            <MyComponent variant="default">Default Variant</MyComponent>
            <MyComponent variant="elevated">Elevated Variant</MyComponent>
            <MyComponent variant="subtle">Subtle Variant</MyComponent>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Step 3: Accessibility Testing

Use the validation utilities to test accessibility:

```tsx
import { validateContrast, calculateContrastRatio } from '../utils/themeUtils'

// Test contrast ratios
const contrast = calculateContrastRatio('#ffffff', '#000000')
const isValid = validateContrast('#ffffff', '#000000', 'AA')

console.log(`Contrast ratio: ${contrast}:1`)
console.log(`Meets AA standard: ${isValid}`)
```

---

## Common Patterns

### Pattern 1: Interactive Components

```tsx
interface InteractiveComponentProps {
  className?: string
  variant?: 'default' | 'elevated' | 'subtle'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function InteractiveComponent({
  className = '',
  variant = 'default',
  children,
  onClick,
  disabled = false
}: InteractiveComponentProps) {
  const themeStyles = useThemeStyles()
  
  const isInteractive = onClick && !disabled
  const interactiveClasses = isInteractive 
    ? 'cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2' 
    : ''
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <div
      className={`
        bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-4
        transition-all duration-200
        ${interactiveClasses}
        ${disabledClasses}
        ${className}
      `.trim()}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {children}
    </div>
  )
}
```

### Pattern 2: Status Components

```tsx
interface StatusComponentProps {
  status: 'success' | 'warning' | 'error' | 'info'
  message: string
  className?: string
}

export function StatusComponent({
  status,
  message,
  className = ''
}: StatusComponentProps) {
  const statusClasses = {
    success: 'bg-[rgb(var(--success))] bg-opacity-10 border-[rgb(var(--success))] text-[rgb(var(--success))]',
    warning: 'bg-[rgb(var(--warning))] bg-opacity-10 border-[rgb(var(--warning))] text-[rgb(var(--warning))]',
    error: 'bg-[rgb(var(--error))] bg-opacity-10 border-[rgb(var(--error))] text-[rgb(var(--error))]',
    info: 'bg-[rgb(var(--info))] bg-opacity-10 border-[rgb(var(--info))] text-[rgb(var(--info))]'
  }
  
  return (
    <div className={`
      border rounded-lg p-3
      ${statusClasses[status]}
      ${className}
    `.trim()}>
      {message}
    </div>
  )
}
```

### Pattern 3: Form Components

```tsx
interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  className = ''
}: FormInputProps) {
  const themeStyles = useThemeStyles()
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`block text-sm font-medium ${themeStyles.text.primary}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-lg
          bg-[rgb(var(--surface-2))] text-[rgb(var(--fg))]
          border-[rgb(var(--border))]
          focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]
          ${error ? 'border-[rgb(var(--error))]' : ''}
        `.trim()}
      />
      {error && (
        <p className={`text-sm ${themeStyles.status.error}`}>
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## Troubleshooting

### Issue 1: Colors Not Updating

**Problem**: Theme colors are not changing when switching themes.

**Solution**: 
1. Ensure you're using CSS variables with `rgb()` function
2. Check that theme classes are properly applied to the root element
3. Verify CSS variable names match between theme files

```tsx
// ✅ Correct
<div className="bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">

// ❌ Incorrect
<div className="bg-gray-800 text-white">
```

### Issue 2: Inconsistent Styling

**Problem**: Components look different across themes.

**Solution**:
1. Use the `useThemeStyles()` hook for consistent styling
2. Avoid hardcoded colors in components
3. Test components with all available themes

### Issue 3: Poor Accessibility

**Problem**: Theme doesn't meet accessibility standards.

**Solution**:
1. Use the ThemeValidator component to check contrast ratios
2. Ensure all text has sufficient contrast (4.5:1 minimum)
3. Test with high-contrast mode enabled

### Issue 4: Performance Issues

**Problem**: Theme switching is slow or causes layout shifts.

**Solution**:
1. Use CSS variables instead of CSS-in-JS
2. Minimize DOM manipulation during theme switching
3. Use `transform` instead of changing layout properties

### Issue 5: TypeScript Errors

**Problem**: TypeScript errors related to theme utilities.

**Solution**:
1. Ensure all imports are correct
2. Check that component interfaces match the standards
3. Use proper type annotations for theme-related props

---

## Best Practices Checklist

- [ ] Use CSS variables for all theme-dependent properties
- [ ] Implement proper TypeScript interfaces
- [ ] Test with all available themes
- [ ] Validate accessibility compliance
- [ ] Use semantic color names
- [ ] Include hover and focus states
- [ ] Support reduced motion preferences
- [ ] Document component usage
- [ ] Follow naming conventions
- [ ] Implement proper fallbacks

---

## Resources

- [Enhanced Theme Standards](../README.md)
- [Theme Utilities](../../apps/web/src/utils/themeUtils.ts)
- [Theme-Aware Card Example](../../apps/web/src/components/ThemeAwareCard.tsx)
- [Theme Validator](../../apps/web/src/components/ThemeValidator.tsx)

---

*This guide is part of the enhanced theming standards for the AI Kanban dairy project.*
