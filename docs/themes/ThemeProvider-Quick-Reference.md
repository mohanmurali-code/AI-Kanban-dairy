# ThemeProvider Quick Reference

## Quick Start

### 1. Basic Usage

```tsx
import { useTheme } from '../components/ThemeProvider';

function MyComponent() {
  const { themeStatus, lastError, retryTheme } = useTheme();
  
  if (lastError) {
    return <button onClick={retryTheme}>Retry Theme</button>;
  }
  
  return <div>Current theme: {themeStatus}</div>;
}
```

### 2. App.tsx Setup

```tsx
import { ThemeProvider, ThemeErrorBoundary } from './components/ThemeProvider';
import { initializeAutoBackup, cleanupAutoBackup } from './utils/autoBackup';

function App() {
  useEffect(() => {
    initializeAutoBackup();
    return cleanupAutoBackup;
  }, []);

  return (
    <ThemeProvider>
      <ThemeErrorBoundary>
        {/* Your app content */}
      </ThemeErrorBoundary>
    </ThemeProvider>
  );
}
```

## Available Hooks & Components

### useTheme Hook

```tsx
const {
  themeStatus,        // Current theme name
  lastError,          // Last error that occurred
  retryTheme,         // Function to retry failed theme operations
  isLoading,          // Whether theme is currently loading
  setTheme,           // Function to change theme
  getThemeInfo        // Function to get theme details
} = useTheme();
```

### ThemeAwareCard Component

```tsx
import { ThemeAwareCard } from './ThemeAwareCard';

<ThemeAwareCard variant="elevated" className="my-custom-class">
  <h2>My Content</h2>
  <p>Automatically themed content</p>
</ThemeAwareCard>
```

**Variants:** `default`, `elevated`, `outlined`

## Theme Selection

### Basic Theme Selector

```tsx
import { ThemeSelector } from './ThemeSelector';

<ThemeSelector />
```

### Custom Theme Selection

```tsx
const { setTheme } = useTheme();

const handleThemeChange = (themeName: string) => {
  setTheme(themeName);
};

<button onClick={() => handleThemeChange('dark-elegant')}>
  Switch to Dark Elegant
</button>
```

## Error Handling

### Error Boundary (Automatic)

```tsx
// Automatically catches theme errors when wrapped
<ThemeErrorBoundary>
  <YourComponent />
</ThemeErrorBoundary>
```

### Manual Error Handling

```tsx
const { lastError, retryTheme } = useTheme();

if (lastError) {
  return (
    <div className="error-container">
      <p>Theme error: {lastError.message}</p>
      <button onClick={retryTheme}>Try Again</button>
    </div>
  );
}
```

## Loading States

### Automatic Loading Detection

```tsx
const { isLoading } = useTheme();

if (isLoading) {
  return <div>Changing theme...</div>;
}
```

### Custom Loading Component

```tsx
import { ThemeLoading } from './ThemeLoading';

<ThemeLoading message="Applying your theme..." />
```

## Development Tools

### Theme Status Indicator

```tsx
import { ThemeStatusIndicator } from './ThemeStatusIndicator';

// Only shows in development mode
<ThemeStatusIndicator />
```

### Debug Information

```tsx
const { themeStatus, lastError } = useTheme();

console.log('Theme Status:', themeStatus);
if (lastError) {
  console.error('Theme Error:', lastError);
}
```

## CSS Integration

### Theme-Aware Styling

```css
/* Automatically applies current theme */
.theme-aware-card {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* Theme-specific variations */
.theme-aware-card.variant-elevated {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Custom Theme Variables

```css
/* Define in your theme CSS files */
.theme-my-custom-theme {
  --bg-card: #f8f9fa;
  --text-primary: #212529;
  --border-color: #dee2e6;
}
```

## Auto-Backup System

### Configuration

```tsx
import { initializeAutoBackup } from './utils/autoBackup';

// Custom configuration
initializeAutoBackup({
  interval: 10 * 60 * 1000,  // 10 minutes
  maxBackups: 20,
  backupKey: 'my-app-backup'
});
```

### Manual Backup

```tsx
import { performBackup } from './utils/autoBackup';

const handleManualBackup = () => {
  performBackup({
    backupKey: 'manual-backup',
    maxBackups: 5
  });
};
```

## Common Patterns

### Theme-Dependent Rendering

```tsx
const { themeStatus } = useTheme();

const getThemeIcon = () => {
  switch (themeStatus) {
    case 'dark-elegant':
      return <MoonIcon />;
    case 'light-simple':
      return <SunIcon />;
    default:
      return <PaletteIcon />;
  }
};
```

### Conditional Styling

```tsx
const { themeStatus } = useTheme();

const containerClass = `container ${themeStatus === 'dark-elegant' ? 'dark' : 'light'}`;

return <div className={containerClass}>Content</div>;
```

### Theme Persistence

```tsx
const { setTheme } = useTheme();

const handleThemeChange = (themeName: string) => {
  setTheme(themeName);
  // Theme is automatically persisted
};
```

## Troubleshooting

### Common Issues

1. **"useTheme must be used within a ThemeProvider"**
   - Ensure component is wrapped in `<ThemeProvider>`

2. **Theme not changing**
   - Check if `ThemeErrorBoundary` is catching errors
   - Verify theme CSS files are properly loaded

3. **Performance issues**
   - Use `React.memo` for components that don't need theme updates
   - Avoid unnecessary theme status checks

### Debug Steps

1. Check browser console for errors
2. Verify `ThemeStatusIndicator` shows correct status
3. Ensure all required components are imported
4. Check theme CSS file paths and imports

## Migration Checklist

### From Old System

- [ ] Replace `themeManager` calls with `useTheme` hook
- [ ] Wrap components in `ThemeProvider` if needed
- [ ] Update theme selection logic to use new API
- [ ] Test error handling scenarios
- [ ] Verify loading states work correctly

### New Features

- [ ] Implement `ThemeAwareCard` for consistent theming
- [ ] Add error boundaries where needed
- [ ] Configure auto-backup system
- [ ] Test theme error recovery
- [ ] Verify development tools work

## Best Practices

1. **Always wrap theme-dependent components** in `ThemeProvider`
2. **Use error boundaries** to catch theme-related errors
3. **Implement loading states** for better UX
4. **Test error scenarios** to ensure graceful degradation
5. **Use theme-aware components** for consistent styling
6. **Monitor performance** during theme changes
7. **Implement proper cleanup** for auto-backup timers

## API Reference

### ThemeProvider Props

```tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  enableAutoBackup?: boolean;
  backupInterval?: number;
}
```

### useTheme Return Values

```tsx
interface ThemeContextType {
  themeStatus: string;
  lastError: Error | null;
  isLoading: boolean;
  retryTheme: () => void;
  setTheme: (themeName: string) => void;
  getThemeInfo: (themeName: string) => ThemeInfo | null;
}
```

### ThemeAwareCard Props

```tsx
interface ThemeAwareCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}
```

This quick reference provides the essential information needed to work with the new ThemeProvider architecture. For detailed implementation information, refer to the full documentation files.
