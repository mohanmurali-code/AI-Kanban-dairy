/**
 * Theme Validator Component
 * 
 * A development tool for validating themes against the enhanced theming standards.
 * This component provides real-time feedback on theme compliance, accessibility,
 * and best practices.
 */

import React, { useState, useEffect } from 'react'
import { 
  validateThemeColors, 
  calculateContrastRatio, 
  generateColorVariants,
  exportTheme 
} from '../utils/themeUtils'
import { useThemeStyles } from '../utils/themeUtils'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  contrastRatios: Record<string, number>
  suggestions: string[]
}

export function ThemeValidator() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const themeStyles = useThemeStyles()

  useEffect(() => {
    validateCurrentTheme()
  }, [themeStyles])

  const validateCurrentTheme = () => {
    // Get current theme colors from CSS variables
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    const colors = {
      bg: `#${getComputedValue('--bg')}`,
      surface: `#${getComputedValue('--surface')}`,
      'surface-2': `#${getComputedValue('--surface-2')}`,
      fg: `#${getComputedValue('--fg')}`,
      'fg-muted': `#${getComputedValue('--fg-muted')}`,
      'fg-subtle': `#${getComputedValue('--fg-subtle')}`,
      primary: `#${getComputedValue('--primary')}`,
      border: `#${getComputedValue('--border')}`,
      'border-subtle': `#${getComputedValue('--border-subtle')}`,
      success: `#${getComputedValue('--success')}`,
      warning: `#${getComputedValue('--warning')}`,
      error: `#${getComputedValue('--error')}`,
      info: `#${getComputedValue('--info')}`
    }

    function getComputedValue(varName: string): string {
      const value = computedStyle.getPropertyValue(varName).trim()
      // Convert RGB values to hex
      if (value.includes('rgb')) {
        const rgb = value.match(/\d+/g)
        if (rgb && rgb.length === 3) {
          const [r, g, b] = rgb.map(Number)
          return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
        }
      }
      return '000000' // fallback
    }

    // Validate colors
    const validation = validateThemeColors(colors)
    
    // Calculate contrast ratios
    const contrastRatios = {
      'Text on Background': calculateContrastRatio(colors.fg, colors.bg),
      'Text on Surface': calculateContrastRatio(colors.fg, colors.surface),
      'Text on Surface-2': calculateContrastRatio(colors.fg, colors['surface-2']),
      'Muted Text on Background': calculateContrastRatio(colors['fg-muted'], colors.bg),
      'Primary on Background': calculateContrastRatio(colors.primary, colors.bg)
    }

    // Generate suggestions
    const suggestions: string[] = []
    
    if (contrastRatios['Text on Background'] < 7.0) {
      suggestions.push('Consider improving text-to-background contrast for better readability')
    }
    
    if (contrastRatios['Primary on Background'] < 4.5) {
      suggestions.push('Primary color may not have sufficient contrast with background')
    }

    // Check for color harmony
    const primaryVariants = generateColorVariants(colors.primary)
    if (primaryVariants) {
      suggestions.push('Consider using generated color variants for hover/focus states')
    }

    setValidationResult({
      ...validation,
      contrastRatios,
      suggestions
    })
  }

  const copyThemeExport = () => {
    const themeExport = exportTheme('Current Theme')
    navigator.clipboard.writeText(themeExport)
  }

  if (!validationResult) {
    return (
      <div className="p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-[rgb(var(--border))] rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-[rgb(var(--border))] rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${validationResult.isValid ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--error))]'}`}></div>
          <h3 className="font-semibold text-[rgb(var(--fg))]">Theme Validator</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={validateCurrentTheme}
            className="px-3 py-1 text-sm bg-[rgb(var(--primary))] text-white rounded hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--surface-2))] transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--fg))]">
              {validationResult.errors.length}
            </div>
            <div className="text-sm text-[rgb(var(--fg-muted))]">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--warning))]">
              {validationResult.warnings.length}
            </div>
            <div className="text-sm text-[rgb(var(--fg-muted))]">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--success))]">
              {Object.keys(validationResult.contrastRatios).length}
            </div>
            <div className="text-sm text-[rgb(var(--fg-muted))]">Contrast Tests</div>
          </div>
        </div>

        {/* Status */}
        <div className={`p-3 rounded-lg mb-4 ${
          validationResult.isValid 
            ? 'bg-[rgb(var(--success))] bg-opacity-10 border border-[rgb(var(--success))]' 
            : 'bg-[rgb(var(--error))] bg-opacity-10 border border-[rgb(var(--error))]'
        }`}>
          <div className="font-medium text-[rgb(var(--fg))]">
            {validationResult.isValid ? '✅ Theme is valid' : '❌ Theme has issues'}
          </div>
          <div className="text-sm text-[rgb(var(--fg-muted))] mt-1">
            {validationResult.isValid 
              ? 'Your theme meets the basic requirements' 
              : 'Please fix the errors below'
            }
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {isExpanded && (
        <div className="border-t border-[rgb(var(--border))]">
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="p-4 border-b border-[rgb(var(--border))]">
              <h4 className="font-medium text-[rgb(var(--error))] mb-2">Errors</h4>
              <ul className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-[rgb(var(--fg))] flex items-start gap-2">
                    <span className="text-[rgb(var(--error))] mt-1">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="p-4 border-b border-[rgb(var(--border))]">
              <h4 className="font-medium text-[rgb(var(--warning))] mb-2">Warnings</h4>
              <ul className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-[rgb(var(--fg))] flex items-start gap-2">
                    <span className="text-[rgb(var(--warning))] mt-1">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contrast Ratios */}
          <div className="p-4 border-b border-[rgb(var(--border))]">
            <h4 className="font-medium text-[rgb(var(--fg))] mb-2">Contrast Ratios</h4>
            <div className="space-y-2">
              {Object.entries(validationResult.contrastRatios).map(([name, ratio]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(var(--fg-muted))]">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      ratio >= 7.0 ? 'text-[rgb(var(--success))]' :
                      ratio >= 4.5 ? 'text-[rgb(var(--warning))]' :
                      'text-[rgb(var(--error))]'
                    }`}>
                      {ratio.toFixed(2)}:1
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      ratio >= 7.0 ? 'bg-[rgb(var(--success))]' :
                      ratio >= 4.5 ? 'bg-[rgb(var(--warning))]' :
                      'bg-[rgb(var(--error))]'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="p-4 border-b border-[rgb(var(--border))]">
              <h4 className="font-medium text-[rgb(var(--info))] mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-[rgb(var(--fg))] flex items-start gap-2">
                    <span className="text-[rgb(var(--info))] mt-1">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Theme Export */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-[rgb(var(--fg))]">Theme Export</h4>
              <button
                onClick={copyThemeExport}
                className="px-3 py-1 text-sm bg-[rgb(var(--primary))] text-white rounded hover:opacity-90 transition-opacity"
              >
                Copy CSS
              </button>
            </div>
            <div className="text-xs text-[rgb(var(--fg-muted))]">
              Click "Copy CSS" to get the current theme as CSS variables
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
