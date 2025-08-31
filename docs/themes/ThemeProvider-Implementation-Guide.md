# ThemeProvider Implementation Guide

## Overview

This document provides the technical implementation details for the missing components and utilities referenced in the new ThemeProvider architecture. These components need to be created to make the application functional with the new theme system.

## Required Components

### 1. ThemeProvider.tsx

**Location:** `apps/web/src/components/ThemeProvider.tsx`

**Purpose:** Main theme context provider that manages theme state and provides theme-related functions to child components.

**Key Features:**
- Theme state management
- Error boundary integration
- Loading state management
- Theme persistence
- System theme detection

**Implementation Structure:**
```tsx
// Theme context interface
interface ThemeContextType {
  themeStatus: string;
  lastError: Error | null;
  retryTheme: () => void;
  // Additional theme-related functions
}

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state management
  // Error handling
  // Loading states
  // Theme operations
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 2. ThemeErrorBoundary.tsx

**Location:** `apps/web/src/components/ThemeErrorBoundary.tsx`

**Purpose:** React error boundary that catches theme-related errors and provides fallback UI.

**Implementation Structure:**
```tsx
export class ThemeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error information
    console.error('Theme Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="theme-error-fallback">
          <h2>Theme Error</h2>
          <p>Something went wrong with the theme system.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. ThemeLoading.tsx

**Location:** `apps/web/src/components/ThemeLoading.tsx`

**Purpose:** Component that displays loading states during theme operations.

**Implementation Structure:**
```tsx
export const ThemeLoading: React.FC<{ message?: string }> = ({ 
  message = "Loading theme..." 
}) => {
  return (
    <div className="theme-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};
```

### 4. ThemeStatusIndicator.tsx

**Location:** `apps/web/src/components/ThemeStatusIndicator.tsx`

**Purpose:** Development tool that displays current theme status and debugging information.

**Implementation Structure:**
```tsx
export const ThemeStatusIndicator: React.FC = () => {
  const { themeStatus, lastError } = useTheme();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="theme-status-indicator">
      <h4>Theme Status (Dev)</h4>
      <p>Status: {themeStatus}</p>
      {lastError && (
        <p>Error: {lastError.message}</p>
      )}
    </div>
  );
};
```

### 5. ThemeAwareCard.tsx

**Location:** `apps/web/src/components/ThemeAwareCard.tsx`

**Purpose:** Component that automatically adapts its styling to the current theme.

**Implementation Structure:**
```tsx
interface ThemeAwareCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const ThemeAwareCard: React.FC<ThemeAwareCardProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  const { themeStatus } = useTheme();
  
  const cardClasses = [
    'theme-aware-card',
    `theme-${themeStatus}`,
    `variant-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};
```

### 6. autoBackup.ts

**Location:** `apps/web/src/utils/autoBackup.ts`

**Purpose:** Utility system for automatically backing up application state and data.

**Implementation Structure:**
```tsx
interface BackupConfig {
  interval: number; // milliseconds
  maxBackups: number;
  backupKey: string;
}

let backupTimer: NodeJS.Timeout | null = null;
let backupCount = 0;

export const initializeAutoBackup = (config: BackupConfig = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxBackups: 10,
  backupKey: 'app-backup'
}) => {
  if (backupTimer) {
    cleanupAutoBackup();
  }

  backupTimer = setInterval(() => {
    try {
      // Perform backup operation
      performBackup(config);
      backupCount++;
      
      // Clean up old backups if limit exceeded
      if (backupCount > config.maxBackups) {
        cleanupOldBackups(config);
      }
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }, config.interval);
};

export const cleanupAutoBackup = () => {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
  backupCount = 0;
};

const performBackup = (config: BackupConfig) => {
  // Implementation of actual backup logic
  // This could include:
  // - Saving current app state to localStorage
  // - Sending data to a backup service
  // - Creating local backup files
};

const cleanupOldBackups = (config: BackupConfig) => {
  // Implementation of backup cleanup logic
};
```

## Integration Points

### 1. App.tsx Integration

The main application file needs to import and use these components:

```tsx
import { ThemeProvider, ThemeErrorBoundary, ThemeStatusIndicator } from './components/ThemeProvider';
import { initializeAutoBackup, cleanupAutoBackup } from './utils/autoBackup';

function App() {
  useEffect(() => {
    initializeAutoBackup();
    return () => cleanupAutoBackup();
  }, []);

  return (
    <ThemeProvider>
      <ThemeErrorBoundary>
        {/* Application content */}
        <ThemeStatusIndicator />
      </ThemeErrorBoundary>
    </ThemeProvider>
  );
}
```

### 2. ThemeSelector.tsx Integration

The updated ThemeSelector component uses the new context:

```tsx
import { useTheme } from './ThemeProvider';
import { ThemeAwareCard } from './ThemeAwareCard';

export const ThemeSelector: React.FC = () => {
  const { themeStatus, lastError, retryTheme } = useTheme();
  
  // Component implementation using the theme context
};
```

## CSS Requirements

### 1. Theme Loading Styles

```css
.theme-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 2. Theme Error Styles

```css
.theme-error-fallback {
  padding: 2rem;
  text-align: center;
  background: var(--bg-error);
  color: var(--text-error);
  border: 1px solid var(--border-error);
  border-radius: 0.5rem;
  margin: 1rem;
}
```

### 3. Theme Status Indicator Styles

```css
.theme-status-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 4. Theme-Aware Card Styles

```css
.theme-aware-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.theme-aware-card.variant-elevated {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-aware-card.variant-outlined {
  background: transparent;
  border-width: 2px;
}
```

## State Management

### 1. Theme Context State

The ThemeProvider manages several pieces of state:

```tsx
interface ThemeState {
  currentTheme: string;
  isLoading: boolean;
  error: Error | null;
  lastApplied: Date | null;
  preferences: ThemePreferences;
}
```

### 2. State Updates

State updates should be handled through actions:

```tsx
const setTheme = useCallback((themeName: string) => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    // Apply theme logic
    applyTheme(themeName);
    setState(prev => ({
      ...prev,
      currentTheme: themeName,
      isLoading: false,
      lastApplied: new Date()
    }));
  } catch (error) {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error as Error
    }));
  }
}, []);
```

## Error Handling Strategy

### 1. Error Types

Define specific error types for different failure scenarios:

```tsx
class ThemeLoadError extends Error {
  constructor(message: string, public themeName: string) {
    super(message);
    this.name = 'ThemeLoadError';
  }
}

class ThemeApplyError extends Error {
  constructor(message: string, public themeName: string) {
    super(message);
    this.name = 'ThemeApplyError';
  }
}
```

### 2. Error Recovery

Implement recovery mechanisms:

```tsx
const retryTheme = useCallback(() => {
  if (state.lastApplied) {
    setTheme(state.currentTheme);
  }
}, [state.currentTheme, state.lastApplied, setTheme]);
```

## Performance Considerations

### 1. Context Optimization

Use React.memo and useMemo to prevent unnecessary re-renders:

```tsx
export const ThemeProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  // Implementation
});
```

### 2. Lazy Loading

Load theme resources on-demand:

```tsx
const loadTheme = useCallback(async (themeName: string) => {
  if (!loadedThemes.has(themeName)) {
    const themeModule = await import(`../themes/${themeName}.css`);
    loadedThemes.add(themeName);
  }
}, []);
```

## Testing Strategy

### 1. Unit Tests

Test individual components and utilities:

```tsx
describe('ThemeProvider', () => {
  it('should provide theme context to children', () => {
    // Test implementation
  });
  
  it('should handle theme errors gracefully', () => {
    // Test error handling
  });
});
```

### 2. Integration Tests

Test component interactions:

```tsx
describe('ThemeSelector Integration', () => {
  it('should update theme through context', () => {
    // Test theme selection flow
  });
});
```

## Deployment Considerations

### 1. Environment Variables

Use environment variables for configuration:

```tsx
const BACKUP_INTERVAL = process.env.REACT_APP_BACKUP_INTERVAL || 5 * 60 * 1000;
const MAX_BACKUPS = process.env.REACT_APP_MAX_BACKUPS || 10;
```

### 2. Feature Flags

Implement feature flags for gradual rollout:

```tsx
const ENABLE_AUTO_BACKUP = process.env.REACT_APP_ENABLE_AUTO_BACKUP === 'true';
const ENABLE_THEME_ERROR_BOUNDARY = process.env.REACT_APP_ENABLE_THEME_ERROR_BOUNDARY === 'true';
```

## Conclusion

This implementation guide provides the technical foundation for the new ThemeProvider architecture. Each component and utility is designed to work together seamlessly while maintaining clean separation of concerns and following React best practices.

The system provides:
- Robust error handling
- Performance optimization
- Developer-friendly debugging tools
- Automatic backup capabilities
- Theme-aware components

By implementing these components according to this guide, the application will have a fully functional and maintainable theme system that integrates seamlessly with the existing codebase.
