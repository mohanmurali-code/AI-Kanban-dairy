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

# Theme System Documentation

This document describes the theme management system for the AI-Kanban-dairy application, including theme names, CSS file details, implementation approach, and best practices for switching between multiple themes.

---

## Theme Names & CSS Files

| Theme Name           | CSS File                      | Description                                 |
|---------------------|-------------------------------|---------------------------------------------|
| Dark Dashboard      | src/dark-dashboard.css         | Modern dark dashboard, purple accent        |
| Light (example)     | src/light-theme.css            | Clean light theme, blue accent (future)     |
| High Contrast (ex.) | src/high-contrast-theme.css    | Accessibility-focused, strong contrast      |

---

## Theme CSS Structure

- Each theme is defined using CSS variables scoped under a unique class (e.g., `.theme-dark-dashboard`).
- Only one theme class is applied to the app root at a time, enabling instant theme switching.

Example:

```css
.theme-dark-dashboard {
  --bg-main: #181a20;
  --accent: #7c3aed;
  /* ...other variables... */
}
```

---

## How to Add a New Theme

1. Create a new CSS file in `src/` (e.g., `src/light-theme.css`).
2. Scope all variables and styles under a unique class (e.g., `.theme-light`).
3. Import the CSS file in your main entry point.
4. Add the theme name and file to the table above.

---

## How to Switch Themes (Best Practice)

- In your root component, set the className of the main wrapper to the selected theme class (e.g., `theme-dark-dashboard`).
- Store the selected theme in React context or global state (e.g., Redux, Zustand, or React Context API).
- Persist the theme in localStorage so it is restored on reload.
- Provide a dropdown or buttons in your settings/themes page for users to select a theme.
- On selection, update the theme state and apply the corresponding class.

Example (React):

```tsx
import React, { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={theme === 'dark-dashboard' ? 'theme-dark-dashboard' : ''}>
      {/* ...app code... */}
      <button onClick={() => setTheme('dark-dashboard')}>Dark Dashboard</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}
```

---

## Best Practices

- Scope all theme styles to their class to avoid conflicts.
- Use only CSS variables for colors, spacing, and fonts for easy overrides.
- Document each theme in this folder for maintainability.
- Use a single theme wrapper at the app root for instant switching.
- Add new themes by following the structure above and update this documentation.

---

## File Locations

- Theme CSS: `apps/web/src/`
- Theme docs: `requirements/themes/`

---

## Maintainers

- Update this file when adding or modifying themes.



CSS Variables + Scoped Classes:

Define each theme’s colors and styles using CSS variables, scoped under a unique class (e.g., .theme-dark-dashboard, .theme-light, .theme-high-contrast).
Only one theme class is applied to your app’s root at a time.
Single Theme Wrapper:

In your root component (e.g., App.tsx), wrap everything in a <div> whose className is set to the current theme.
Example: <div className={themeClass}>...</div>
Central Theme State:

Store the selected theme in React context or global state (e.g., Redux, Zustand).
Persist the theme in localStorage so it’s restored on reload.
Theme Switcher UI:

Provide a dropdown or buttons in your settings/themes page for users to select a theme.
On selection, update the theme state and apply the corresponding class.
No Style Conflicts:

By scoping all theme styles to their class, you avoid style conflicts and ensure only the active theme’s variables are used.
Dynamic Import (Optional):

For large apps, you can dynamically import theme CSS files only when needed.
This approach is scalable, maintainable, and works well with React, Vue, or any SPA. It also allows you to add new themes easily and guarantees that switching themes won’t break your layout or components.