/**
 * Enhanced Theme Utilities
 * 
 * Helper functions for implementing consistent theming across the application.
 * This file provides utilities for color management, theme validation, and
 * accessibility compliance with performance optimizations.
 */

import { usePreferencesStore } from '../store/theme'

// Performance optimization: Cache for color calculations
const colorCache = new Map<string, any>()

// Color contrast calculation utilities with caching
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const cacheKey = `${color1}-${color2}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color)
    if (!rgb) return 0
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  const ratio = (brightest + 0.05) / (darkest + 0.05)
  colorCache.set(cacheKey, ratio)
  return ratio
}

// Convert hex color to RGB array with validation
export const hexToRgb = (hex: string): number[] | null => {
  if (!hex || typeof hex !== 'string') return null
  
  const cacheKey = `hexToRgb-${hex}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  // Normalize hex color
  let normalized = hex.trim()
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`
  }

  // Handle shorthand hex colors (#abc -> #aabbcc)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  normalized = normalized.replace(shorthandRegex, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!result) {
    colorCache.set(cacheKey, null)
    return null
  }

  const rgb = [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ]
  
  colorCache.set(cacheKey, rgb)
  return rgb
}

// Convert RGB array to hex color with validation
export const rgbToHex = (r: number, g: number, b: number): string => {
  const cacheKey = `rgbToHex-${r}-${g}-${b}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  // Validate RGB values
  const validR = Math.max(0, Math.min(255, Math.round(r)))
  const validG = Math.max(0, Math.min(255, Math.round(g)))
  const validB = Math.max(0, Math.min(255, Math.round(b)))

  const hex = '#' + [validR, validG, validB].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
  
  colorCache.set(cacheKey, hex)
  return hex
}

// Enhanced contrast validation with multiple levels
export const validateContrast = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' | 'AALarge' | 'AAALarge' = 'AA'
): { isValid: boolean; ratio: number; required: number } => {
  const ratio = calculateContrastRatio(foreground, background)
  
  let required: number
  switch (level) {
    case 'AAA':
      required = 7.0
      break
    case 'AALarge':
      required = 3.0
      break
    case 'AAALarge':
      required = 4.5
      break
    default: // AA
      required = 4.5
      break
  }
  
  return {
    isValid: ratio >= required,
    ratio,
    required
  }
}

// Generate accessible color variants with improved algorithms
export const generateColorVariants = (baseColor: string, options: {
  lightness?: number
  saturation?: number
  alpha?: number
} = {}) => {
  const { lightness = 0.1, saturation = 0.1, alpha = 0.8 } = options
  
  const rgb = hexToRgb(baseColor)
  if (!rgb) return null
  
  const [r, g, b] = rgb
  
  // Convert to HSL for better color manipulation
  const hsl = rgbToHsl(r, g, b)
  if (!hsl) return null
  
  const [h, s, l] = hsl
  
  return {
    light: hslToHex(h, Math.max(0, s - saturation), Math.min(100, l + lightness * 100)),
    dark: hslToHex(h, Math.max(0, s - saturation), Math.max(0, l - lightness * 100)),
    muted: hslToHex(h, Math.max(0, s - saturation * 2), l),
    alpha: `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

// RGB to HSL conversion
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] | null => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

// HSL to Hex conversion
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

// Enhanced theme-aware class name generator with performance optimization
export const createThemeClasses = (
  baseClasses: string,
  variant: 'default' | 'elevated' | 'subtle' | 'interactive' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const cacheKey = `themeClasses-${baseClasses}-${variant}-${size}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)
  }

  const variantClasses = {
    default: 'bg-[rgb(var(--surface))] border-[rgb(var(--border))]',
    elevated: 'bg-[rgb(var(--surface-2))] border-[rgb(var(--border-subtle))] shadow-lg',
    subtle: 'bg-transparent border-[rgb(var(--border-subtle))]',
    interactive: 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] hover:bg-[rgb(var(--surface-2))] cursor-pointer transition-colors'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }
  
  const result = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
  colorCache.set(cacheKey, result)
  return result
}

// Enhanced hook for theme-aware styling with memoization
export const useThemeStyles = () => {
  const { appearance } = usePreferencesStore()
  
  // Memoize the styles object to prevent unnecessary re-renders
  const styles = React.useMemo(() => ({
    // Background colors
    bg: {
      main: 'bg-[rgb(var(--bg))]',
      surface: 'bg-[rgb(var(--surface))]',
      elevated: 'bg-[rgb(var(--surface-2))]',
      transparent: 'bg-transparent',
      hover: 'hover:bg-[rgb(var(--surface-hover))]',
      active: 'active:bg-[rgb(var(--surface-active))]'
    },
    
    // Text colors
    text: {
      primary: 'text-[rgb(var(--fg))]',
      secondary: 'text-[rgb(var(--fg-muted))]',
      tertiary: 'text-[rgb(var(--fg-subtle))]',
      accent: 'text-[rgb(var(--primary))]',
      inverse: 'text-[rgb(var(--bg))]'
    },
    
    // Border colors
    border: {
      default: 'border-[rgb(var(--border))]',
      subtle: 'border-[rgb(var(--border-subtle))]',
      accent: 'border-[rgb(var(--primary))]',
      focus: 'focus:border-[rgb(var(--primary))]'
    },
    
    // Interactive states
    interactive: {
      hover: 'hover:bg-[rgb(var(--surface-hover))]',
      focus: 'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2',
      active: 'active:bg-[rgb(var(--surface-active))]',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed'
    },
    
    // Status colors
    status: {
      success: 'text-[rgb(var(--success))]',
      warning: 'text-[rgb(var(--warning))]',
      error: 'text-[rgb(var(--error))]',
      info: 'text-[rgb(var(--info))]'
    },
    
    // Current theme info
    theme: appearance.theme,
    accentColor: appearance.accentColor,
    highContrast: appearance.highContrast,
    fontFamily: appearance.fontFamily,
    fontSize: appearance.fontSize
  }), [appearance.theme, appearance.accentColor, appearance.highContrast, appearance.fontFamily, appearance.fontSize])
  
  return styles
}

// Component variant generator with TypeScript support
export const createComponentVariants = <T extends Record<string, string>>(
  variants: T
) => {
  return (variant: keyof T, className?: string): string => {
    const cacheKey = `componentVariant-${String(variant)}-${className || ''}`
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }
    
    const result = `${variants[variant]} ${className || ''}`.trim()
    colorCache.set(cacheKey, result)
    return result
  }
}

// Enhanced theme validation with comprehensive checks
export const validateThemeColors = (colors: Record<string, string>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  accessibility: {
    aaCompliant: boolean
    aaaCompliant: boolean
    contrastIssues: string[]
  }
} => {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  const contrastIssues: string[] = []

  // Check for required colors
  const requiredColors = ['bg', 'surface', 'fg', 'primary', 'border']
  for (const color of requiredColors) {
    if (!colors[color]) {
      errors.push(`Missing required color: ${color}`)
    }
  }

  // Validate color format and accessibility
  for (const [name, color] of Object.entries(colors)) {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      warnings.push(`Color ${name} may not be in valid hex format: ${color}`)
    }

    // Check contrast ratios for text colors
    if (name.includes('fg') && colors.bg) {
      const contrast = calculateContrastRatio(color, colors.bg)
      if (contrast < 4.5) {
        contrastIssues.push(`${name} on background: ${contrast.toFixed(2)}:1 (needs 4.5:1)`)
      } else if (contrast < 7.0) {
        warnings.push(`Consider improving contrast for ${name}: ${contrast.toFixed(2)}:1 (recommended 7.0:1)`)
      }
    }
  }

  // Check primary color accessibility
  if (colors.primary && colors.bg) {
    const primaryContrast = calculateContrastRatio(colors.primary, colors.bg)
    if (primaryContrast < 3.0) {
      contrastIssues.push(`Primary color on background: ${primaryContrast.toFixed(2)}:1 (needs 3.0:1)`)
    }
  }

  // Generate suggestions
  if (contrastIssues.length === 0 && warnings.length === 0) {
    suggestions.push('Theme meets accessibility standards')
  }

  if (Object.keys(colors).length < 10) {
    suggestions.push('Consider adding more color variants for better design flexibility')
  }

  const aaCompliant = contrastIssues.length === 0
  const aaaCompliant = aaCompliant && warnings.filter(w => w.includes('contrast')).length === 0

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    accessibility: {
      aaCompliant,
      aaaCompliant,
      contrastIssues
    }
  }
}

// Enhanced CSS variable generator with validation
export const generateCSSVariables = (colors: Record<string, string>): string => {
  const variables: string[] = []
  
  for (const [name, value] of Object.entries(colors)) {
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      variables.push(`  --${name}: ${value};`)
    } else {
      console.warn(`Invalid hex color for ${name}: ${value}`)
    }
  }
  
  return variables.join('\n')
}

// Enhanced theme transition utilities with performance optimization
export const applyThemeTransition = (duration: number = 200): void => {
  const root = document.documentElement
  
  // Use requestAnimationFrame for smooth transitions
  requestAnimationFrame(() => {
    root.style.setProperty('--theme-transition-duration', `${duration}ms`)
    root.classList.add('theme-transitioning')
    
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, duration)
  })
}

// Enhanced accessibility utilities
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#000000'
  
  const [r, g, b] = rgb
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Enhanced theme export utilities with metadata
export const exportTheme = (themeName: string, includeMetadata: boolean = true): string => {
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  
  const variables = [
    '--bg', '--surface', '--surface-2', '--fg', '--fg-muted', '--fg-subtle',
    '--primary', '--border', '--border-subtle', '--success', '--warning', '--error', '--info'
  ]
  
  const themeData = variables.map(varName => {
    const value = computedStyle.getPropertyValue(varName).trim()
    return `  ${varName}: ${value};`
  }).join('\n')
  
  let exportString = `/* ${themeName} Theme */\n`
  
  if (includeMetadata) {
    const validation = validateThemeColors({})
    exportString += `/* Generated on: ${new Date().toISOString()}\n`
    exportString += ` * Accessibility: ${validation.accessibility.aaCompliant ? 'AA Compliant' : 'Needs Review'}\n`
    exportString += ` */\n`
  }
  
  exportString += `:root {\n${themeData}\n}`
  
  return exportString
}

// Performance optimization: Clear cache periodically
export const clearThemeCache = (): void => {
  colorCache.clear()
}

// Auto-clear cache every 5 minutes to prevent memory leaks
setInterval(clearThemeCache, 5 * 60 * 1000)

// Type definitions for enhanced theme utilities
export interface ThemeColors {
  bg: string
  surface: string
  'surface-2': string
  fg: string
  'fg-muted': string
  'fg-subtle': string
  primary: string
  border: string
  'border-subtle': string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  accessibility: {
    aaCompliant: boolean
    aaaCompliant: boolean
    contrastIssues: string[]
  }
}

export interface ThemeStyles {
  bg: Record<string, string>
  text: Record<string, string>
  border: Record<string, string>
  interactive: Record<string, string>
  status: Record<string, string>
  theme: string
  accentColor: string
  highContrast: boolean
  fontFamily: string
  fontSize: string
}

// Import React for useMemo
import React from 'react'

