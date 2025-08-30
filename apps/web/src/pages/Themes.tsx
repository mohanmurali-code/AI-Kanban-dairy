import type { ThemeMode, FontFamily, LineSpacing, BoardDensity, CardSize } from '../store/theme'
import { usePreferencesStore } from '../store/theme'
import React, { useState, useEffect } from 'react'
import { ThemeValidator } from '../components/ThemeValidator'
import { themeRegistry, type ThemeDefinition } from '../utils/themeRegistry'

/**
 * Consolidated Themes & Layout page.
 *
 * This page combines theme selection, layout customization, and theme validation
 * into a single, organized interface with tabbed navigation.
 */
function Themes() {
  const {
    appearance,
    layout,
    setTheme,
    setAccentColor,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setSidebarPosition,
    setBoardDensity,
    setCardSize,
    resetToDefaults,
    customAccentColorInput,
    setCustomAccentColorInput,
    applyCustomAccentColor,
  } = usePreferencesStore()

  const [activeTab, setActiveTab] = useState<'themes' | 'layout' | 'validation'>('themes')
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list' | 'split' | 'sidebar'>('grid')
  const [customCSS, setCustomCSS] = useState('')

  // New: simple theme picker's local state
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    const available = themeRegistry.getAvailableThemes().map(t => t.id)
    const current = String(appearance.theme || '')
    return available.includes(current) ? current : (available[0] || 'light-classic')
  })

  // Apply custom CSS to document
  useEffect(() => {
    if (customCSS.trim()) {
      // Remove existing custom CSS
      const existingStyle = document.getElementById('custom-theme-css')
      if (existingStyle) {
        existingStyle.remove()
      }

      // Add new custom CSS
      const style = document.createElement('style')
      style.id = 'custom-theme-css'
      style.textContent = customCSS
      document.head.appendChild(style)
    }
  }, [customCSS])

  const handleLayoutChange = (layout: 'grid' | 'list' | 'split' | 'sidebar') => {
    setSelectedLayout(layout)
    // Here you could apply the layout to the actual application
    console.log(`Layout changed to: ${layout}`)
  }

  const tabs = [
    { id: 'themes', label: 'Themes', icon: '🎨' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'validation', label: 'Validation', icon: '✅' }
  ]

  const selectedTheme = themeRegistry.getTheme(selectedThemeId)

  return (
    <div className="space-y-6">
      <div className="border-b border-[rgb(var(--border))]">
        <h1 className="text-3xl font-bold text-[rgb(var(--fg))] mb-2">Themes & Layout</h1>
        <p className="text-[rgb(var(--fg-muted))] mb-4">
          Customize your application's appearance and layout preferences
        </p>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[rgb(var(--primary))] text-white'
                  : 'text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-2))]'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Simple Theme Picker */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Pick a Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">Theme</label>
                  <select
                    className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))] focus:border-[rgb(var(--primary))] focus:outline-none"
                    value={selectedThemeId}
                    onChange={(e) => setSelectedThemeId(e.target.value)}
                  >
                    {themeRegistry.getAvailableThemes().map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {selectedTheme && (
                    <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">{selectedTheme.description}</p>
                  )}
                </div>
                <div className="flex gap-2 md:justify-end">
                  <button
                    onClick={async () => {
                      // Preview loads the CSS and applies it temporarily
                      try {
                        await themeRegistry.loadTheme(selectedThemeId)
                      } catch (e) {
                        console.error('Preview failed', e)
                      }
                    }}
                    className="px-4 py-2 border border-[rgb(var(--border))] rounded-md text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-2))] transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={async () => {
                      await setTheme(selectedThemeId)
                    }}
                    className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-md hover:opacity-90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Compact live preview */}
              {selectedTheme && (
                <div className="mt-4 border border-[rgb(var(--border))] rounded-md overflow-hidden">
                  <div className="p-4 bg-[rgb(var(--surface-2))] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: selectedTheme.preview.accent }} />
                      <div>
                        <div className="font-medium text-[rgb(var(--fg))]">{selectedTheme.name}</div>
                        <div className="text-xs text-[rgb(var(--fg-muted))]">Accent {selectedTheme.preview.accent}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--fg-muted))]">
                      <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: selectedTheme.preview.bgMain }} /> BG</span>
                      <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: selectedTheme.preview.textMain }} /> Text</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">Accent Color</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="#7c3aed"
                  value={customAccentColorInput}
                  onChange={(e) => setCustomAccentColorInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))] focus:border-[rgb(var(--primary))] focus:outline-none"
                />
                <button
                  onClick={applyCustomAccentColor}
                  className="px-3 py-2 border border-[rgb(var(--border))] rounded-md text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-2))]"
                >
                  Apply Accent
                </button>
                {selectedTheme && (
                  <button
                    onClick={() => setAccentColor(selectedTheme.accentColor)}
                    className="px-3 py-2 border border-[rgb(var(--border))] rounded-md text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-2))]"
                  >
                    Use Theme Default
                  </button>
                )}
              </div>

              {/* Preset Palette */}
              <div className="mt-2">
                <div className="text-sm text-[rgb(var(--fg-muted))] mb-2">Presets</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#3b82f6', // blue
                    '#6366f1', // indigo
                    '#10b981', // emerald
                    '#f59e0b', // amber
                    '#ef4444', // red
                    '#a855f7', // purple
                    '#06b6d4', // cyan
                    '#22c55e', // green
                    '#eab308', // yellow
                  ].map((hex) => (
                    <button
                      key={hex}
                      title={hex}
                      onClick={() => setAccentColor(hex)}
                      className={`w-7 h-7 rounded-full border ${appearance.accentColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-[rgb(var(--primary))]' : ''}`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Font Settings (kept minimal) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">Font Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">Font Family</label>
                  <select
                    className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))] focus:border-[rgb(var(--primary))] focus:outline-none"
                    value={appearance.fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  >
                    <option value="system-ui">System UI</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">Font Size</label>
                  <div className="flex gap-2">
                    {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          appearance.fontSize === size
                            ? 'bg-[rgb(var(--primary))] text-white'
                            : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--border))]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">Line Spacing</label>
                  <div className="flex gap-2">
                    {(['tight', 'normal', 'relaxed'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => setLineSpacing(spacing as LineSpacing)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          appearance.lineSpacing === spacing
                            ? 'bg-[rgb(var(--primary))] text-white'
                            : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--border))]'
                        }`}
                      >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Layout Settings */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Layout Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-2">
                    Sidebar Position
                  </label>
                  <div className="flex gap-2">
                    {(['left', 'right'] as const).map((position) => (
                      <button
                        key={position}
                        onClick={() => setSidebarPosition(position)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          layout.sidebar === position
                            ? 'bg-[rgb(var(--primary))] text-white'
                            : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--border))]'
                        }`}
                      >
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-2">
                    Board Density
                  </label>
                  <div className="flex gap-2">
                    {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => setBoardDensity(density as BoardDensity)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          layout.boardDensity === density
                            ? 'bg-[rgb(var(--primary))] text-white'
                            : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--border))]'
                        }`}
                      >
                        {density.charAt(0).toUpperCase() + density.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-2">
                    Card Size
                  </label>
                  <div className="flex gap-2">
                    {(['S', 'M', 'L'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setCardSize(size)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          layout.cardSize === size
                            ? 'bg-[rgb(var(--primary))] text-white'
                            : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--border))]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Type Selection */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Layout Type</h2>
                <div className="space-y-3">
                  {[
                    { id: 'grid', name: 'Grid Layout', description: 'Cards arranged in a responsive grid' },
                    { id: 'list', name: 'List Layout', description: 'Cards stacked vertically in a list' },
                    { id: 'split', name: 'Split View', description: 'Two-column layout for comparison' },
                    { id: 'sidebar', name: 'Sidebar Layout', description: 'Main content with side navigation' }
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => handleLayoutChange(layout.id as any)}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${
                        selectedLayout === layout.id
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] bg-opacity-10'
                          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--surface-2))]'
                      }`}
                    >
                      <div className="font-medium text-[rgb(var(--fg))]">{layout.name}</div>
                      <div className="text-sm text-[rgb(var(--fg-muted))]">{layout.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Layout Preview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Layout Preview</h2>
              <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden">
                <div className={`preview-layout ${selectedLayout} bg-[rgb(var(--surface-2))]`}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-md flex items-center justify-center text-[rgb(var(--fg-muted))] text-sm"
                    >
                      Card {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--fg))] mb-4">Theme Validation</h2>
              <p className="text-[rgb(var(--fg-muted))] mb-6">
                Validate your current theme for accessibility, contrast, and best practices
              </p>
              <ThemeValidator />
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="border-t border-[rgb(var(--border))] pt-6">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 border border-[rgb(var(--border))] rounded-md text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-2))] transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default Themes


