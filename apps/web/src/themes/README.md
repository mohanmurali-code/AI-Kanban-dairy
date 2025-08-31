# Glossy Transparent Theme

A modern, glassmorphism-inspired CSS theme with glossy effects, transparency, and beautiful animations. This theme is inspired by the "glossy transparent" aesthetic and provides a contemporary design system for web applications.

## Features

- ✨ **Glassmorphism Effects**: Beautiful frosted glass appearance with backdrop blur
- 🎨 **Modern Design**: Clean, contemporary aesthetics with smooth transitions
- 📱 **Fully Responsive**: Works perfectly on all device sizes
- 🌈 **CSS Custom Properties**: Easy to customize colors and spacing
- 🎭 **Smooth Animations**: Hover effects, transitions, and keyframe animations
- 🎯 **Component Ready**: Pre-styled components for common UI elements
- 🌙 **Dark Mode Support**: Automatic dark mode detection and adjustments

## Quick Start

### 1. Include the CSS

```html
<link rel="stylesheet" href="glossy-transparent.css">
```

### 2. Add the Font (Optional but Recommended)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 3. Use the CSS Classes

```html
<!-- Glass Card -->
<div class="glass-card">
    <h3>Your Content</h3>
    <p>Beautiful glassmorphism effect</p>
</div>

<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>

<!-- Form Inputs -->
<input type="text" class="input" placeholder="Enter text">

<!-- Navigation -->
<nav class="nav">
    <a href="#" class="nav-item active">Home</a>
    <a href="#" class="nav-item">About</a>
</nav>
```

## Available Components

### Cards
- `.glass-card` - Main glassmorphism card component
- Hover effects with subtle animations

### Buttons
- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- Hover effects with shine animation

### Form Elements
- `.input` - Styled input fields
- Focus states with glowing borders
- Placeholder text styling

### Navigation
- `.nav` - Navigation container
- `.nav-item` - Navigation items
- `.nav-item.active` - Active state

### Tables
- `.table` - Styled table container
- Hover effects on rows
- Proper spacing and borders

### Alerts
- `.alert` - Base alert styles
- `.alert-success` - Success messages
- `.alert-warning` - Warning messages
- `.alert-error` - Error messages

### Modals
- `.modal` - Modal backdrop
- `.modal-content` - Modal content container

## CSS Custom Properties

The theme uses CSS custom properties for easy customization:

```css
:root {
  /* Colors */
  --primary-bg: rgba(255, 255, 255, 0.1);
  --accent-primary: #64b5f6;
  
  /* Spacing */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Border Radius */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Transitions */
  --transition-normal: 0.3s ease;
}
```

## Utility Classes

### Spacing
- `.mt-1` to `.mt-5` - Margin top
- `.mb-1` to `.mb-5` - Margin bottom
- `.p-1` to `.p-5` - Padding

### Text Alignment
- `.text-center` - Center align text
- `.text-left` - Left align text
- `.text-right` - Right align text

### Border Radius
- `.rounded` - Medium border radius
- `.rounded-lg` - Large border radius
- `.rounded-xl` - Extra large border radius
- `.rounded-full` - Full rounded (circular)

### Shadows
- `.shadow` - Light shadow
- `.shadow-lg` - Large shadow
- `.shadow-xl` - Extra large shadow

## Animation Classes

- `.fade-in` - Fade in animation
- `.slide-in` - Slide in from left
- `.pulse` - Continuous pulse animation

## Browser Support

- ✅ Modern browsers (Chrome 76+, Firefox 70+, Safari 13.1+)
- ✅ Backdrop filter support for glassmorphism effects
- ⚠️ Fallbacks for older browsers (reduced transparency effects)

## Customization

### Changing Colors

```css
:root {
  --accent-primary: #your-color;
  --accent-secondary: #your-color;
  --primary-bg: rgba(your-rgba-values);
}
```

### Modifying Spacing

```css
:root {
  --spacing-md: 1.5rem; /* Increase medium spacing */
  --spacing-lg: 2rem;   /* Increase large spacing */
}
```

### Adjusting Blur Effects

```css
.glass-card {
  backdrop-filter: blur(30px); /* Increase blur */
}
```

## Examples

Check out `theme-demo.html` for a complete demonstration of all theme components and features.

## License

This theme is part of your project and follows the same licensing terms.

## Contributing

Feel free to modify and extend this theme to match your specific design requirements. The modular CSS structure makes it easy to add new components or modify existing ones.
