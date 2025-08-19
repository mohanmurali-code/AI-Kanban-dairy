# Dynamic Theme System Implementation

## Overview

The AI Kanban application now features a **dynamic theme system** that allows individual theme CSS files to be loaded and applied across the entire application. This system resolves the previous conflicts between hardcoded CSS variables and dynamically applied accent colors.

## How It Works

### 1. Theme Registry (`apps/web/src/utils/themeRegistry.ts`)

The `ThemeRegistry` class manages:
- **Dynamic CSS Loading**: Loads individual theme CSS files on-demand
- **Theme Application**: Applies themes by setting CSS classes and variables
- **Accent Color Management**: Automatically sets `--primary` and `--primary-light` variables
- **Theme Caching**: Keeps track of loaded themes to avoid reloading

### 2. Theme Definitions

Each theme is defined with:
```typescript
interface ThemeDefinition {
  id: string                    // Unique theme identifier
  name: string                  // Human-readable name
  description: string           // Theme description
  category: 'light' | 'dark' | 'accessibility' | 'special'
  preview: {                    // Preview colors for UI
    bgMain: string
    textMain: string
    accent: string
  }
  cssFile: string               // CSS filename to load
  accentColor: string           // Default accent color
}
```

### 3. Available Themes

#### Light Themes
- **Light Classic**: Clean, minimal styling
- **Light Modern**: Contemporary aesthetics
- **Light Warm**: Cozy, soft colors

#### Dark Themes
- **Dark Elegant**: Sophisticated styling
- **Dark Dashboard**: Professional dashboard theme
- **Dark Emerald**: Rich emerald accents
- **Dark Crimson**: Bold crimson highlights

#### Accessibility
- **High Contrast**: Maximum contrast for accessibility

#### Special
- **Cozy Special**: Unique cozy styling

## Implementation Details

### CSS File Structure

Theme CSS files are stored in `apps/web/public/themes/` and contain:
- CSS custom properties for colors, spacing, typography
- Component-specific styles
- Theme-specific overrides

### Dynamic Loading Process

1. **User selects a theme** from the ThemeGrid component
2. **ThemeRegistry.loadTheme()** is called with the theme ID
3. **CSS file is dynamically loaded** using `<link>` element
4. **Theme is applied** by:
   - Setting CSS class on `document.documentElement`
   - Setting `data-theme` attribute
   - Applying accent color variables
5. **Theme change event** is dispatched for other components

### Accent Color Integration

- **Automatic Application**: Accent colors are automatically applied when themes are loaded
- **Variable Override**: CSS variables in theme files can override the default `--primary` values
- **Lighter Variants**: System automatically generates `--primary-light` variants

## Usage

### For Users

1. **Navigate to Themes & Layout page**
2. **Browse available themes** in the ThemeGrid
3. **Click on a theme** to apply it immediately
4. **Use accent color picker** to customize the primary color

### For Developers

#### Adding New Themes

1. **Create CSS file** in `apps/web/public/themes/`
2. **Add theme definition** to `AVAILABLE_THEMES` array in `themeRegistry.ts`
3. **Define preview colors** and metadata
4. **Test theme loading** and application

#### Theme CSS Structure

```css
/* Example theme CSS file */
.theme-your-theme-name {
  --bg-main: #your-background-color;
  --text-main: #your-text-color;
  --accent: #your-accent-color;
  /* Add more custom properties */
}

/* Component overrides */
.theme-your-theme-name .card {
  /* Theme-specific card styles */
}
```

#### Integration with Components

Components can use theme-specific classes:
```tsx
<div className="theme-dark-elegant">
  {/* This content will use dark-elegant theme styles */}
</div>
```

## Benefits

### 1. **No More Conflicts**
- Individual theme CSS files don't conflict with dynamic accent colors
- Each theme can have its own complete styling system

### 2. **Easy Theme Addition**
- Add new themes by creating CSS files and adding definitions
- No need to modify core CSS or JavaScript

### 3. **Performance**
- Themes are loaded only when needed
- Cached themes don't reload

### 4. **Flexibility**
- Themes can override any CSS properties
- Accent colors work consistently across all themes

### 5. **Maintainability**
- Clear separation between theme logic and styling
- Easy to debug and modify individual themes

## Future Enhancements

### 1. **Theme Categories**
- Group themes by purpose (work, gaming, accessibility)
- Filter themes by category

### 2. **Custom Theme Creation**
- Allow users to create and save custom themes
- Theme builder interface

### 3. **Theme Sharing**
- Export/import themes
- Community theme marketplace

### 4. **Advanced Customization**
- Per-component theme overrides
- Theme mixing and blending

## Troubleshooting

### Common Issues

1. **Theme not loading**
   - Check CSS file path in public/themes/
   - Verify theme definition in registry
   - Check browser console for errors

2. **Styles not applying**
   - Ensure theme class is added to document.documentElement
   - Check CSS specificity and overrides
   - Verify CSS variables are properly defined

3. **Accent color conflicts**
   - Theme CSS should use `--primary` variable
   - Avoid hardcoded color values
   - Use CSS custom properties for all colors

### Debug Tools

- **ThemeValidator component**: Validates theme compliance
- **Browser DevTools**: Inspect CSS variables and classes
- **Console logging**: ThemeRegistry logs loading and application events

## Conclusion

The new dynamic theme system provides a robust, flexible, and maintainable way to manage themes across the AI Kanban application. It eliminates conflicts between different styling approaches while maintaining the ability to customize accent colors and apply comprehensive theme changes.
