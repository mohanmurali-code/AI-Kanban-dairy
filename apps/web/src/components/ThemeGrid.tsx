/**
 * Theme Grid Component
 * 
 * Displays all available themes in a grid layout with previews
 * and allows users to select and apply themes.
 */

import React from 'react'
import { usePreferencesStore } from '../store/theme'
import { themeRegistry, type ThemeDefinition } from '../utils/themeRegistry'

export function ThemeGrid() {
  const { appearance, setTheme, themeStatus } = usePreferencesStore()
  const [selectedTheme, setSelectedTheme] = React.useState<string | null>(null)

  const themes = themeRegistry.getAvailableThemes()
  const currentTheme = themeRegistry.getCurrentTheme()

  const handleThemeSelect = async (theme: ThemeDefinition) => {
    try {
      setSelectedTheme(theme.id)
      await setTheme(theme.id)
      setSelectedTheme(null)
    } catch (error) {
      console.error('Failed to apply theme:', error)
      setSelectedTheme(null)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'light': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'dark': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'accessibility': return 'bg-green-100 text-green-800 border-green-200'
      case 'special': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'light': return '☀️'
      case 'dark': return '🌙'
      case 'accessibility': return '♿'
      case 'special': return '✨'
      default: return '🎨'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[rgb(var(--fg))] mb-4">Available Themes</h3>
        <p className="text-sm text-[rgb(var(--fg-muted))] mb-6">
          Choose from our collection of carefully crafted themes. Each theme includes unique styling,
          color schemes, and visual elements.
        </p>
      </div>

      {/* Theme Categories */}
      <div className="space-y-6">
        {['light', 'dark', 'accessibility', 'special'].map(category => {
          const categoryThemes = themes.filter(t => t.category === category)
          if (categoryThemes.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <h4 className="text-md font-medium text-[rgb(var(--fg))] capitalize">
                  {category} Themes
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isSelected={currentTheme === theme.id}
                    isApplying={selectedTheme === theme.id}
                    onSelect={handleThemeSelect}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading State */}
      {themeStatus === 'loading' && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[rgb(var(--fg-muted))]">Applying theme...</span>
        </div>
      )}
    </div>
  )
}

interface ThemeCardProps {
  theme: ThemeDefinition
  isSelected: boolean
  isApplying: boolean
  onSelect: (theme: ThemeDefinition) => void
}

function ThemeCard({ theme, isSelected, isApplying, onSelect }: ThemeCardProps) {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] bg-opacity-10'
          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--surface-2))]'
      } ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !isApplying && onSelect(theme)}
    >
      {/* Theme Preview */}
      <div className="mb-3">
        <div
          className="w-full h-20 rounded-md border border-[rgb(var(--border))] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.preview.bgMain} 0%, ${theme.preview.bgMain}dd 100%)`
          }}
        >
          {/* Preview Elements */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
          <div className="absolute top-2 right-2 w-8 h-2 rounded" style={{ backgroundColor: theme.preview.textMain, opacity: 0.3 }} />
          <div className="absolute bottom-2 left-2 w-6 h-2 rounded" style={{ backgroundColor: theme.preview.accent, opacity: 0.7 }} />
          <div className="absolute bottom-2 right-2 w-4 h-2 rounded" style={{ backgroundColor: theme.preview.textMain, opacity: 0.2 }} />
        </div>
      </div>

      {/* Theme Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h5 className="font-medium text-[rgb(var(--fg))] text-sm">{theme.name}</h5>
          {isSelected && (
            <span className="text-[rgb(var(--primary))] text-xs">✓ Active</span>
          )}
        </div>
        
        <p className="text-xs text-[rgb(var(--fg-muted))] leading-relaxed">
          {theme.description}
        </p>

        {/* Accent Color Preview */}
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-[rgb(var(--border))]"
            style={{ backgroundColor: theme.accentColor }}
          />
          <span className="text-xs text-[rgb(var(--fg-subtle))] font-mono">
            {theme.accentColor}
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isApplying && (
        <div className="absolute inset-0 bg-[rgb(var(--surface))] bg-opacity-80 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
