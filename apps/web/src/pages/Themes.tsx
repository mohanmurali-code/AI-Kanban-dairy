import type { ThemeMode, FontFamily, LineSpacing, BoardDensity, CardSize } from '../store/theme'
import { usePreferencesStore } from '../store/theme'
import React, { useState, useEffect } from 'react'
import { ThemeSelector } from '../components/ThemeSelector'
import { ThemeGrid } from '../components/ThemeGrid'
import { ThemeValidator } from '../components/ThemeValidator'

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
            {/* Theme Grid */}
            <ThemeGrid />
            
            <div className="border-t border-[rgb(var(--border))] pt-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--fg))] mb-4">Basic Theme Options</h2>
              <ThemeSelector />
            </div>

            {/* Font Settings */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Font Settings</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">
                      Font Family
                    </label>
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
                    <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">
                      Font Size
                    </label>
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
                    <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-1">
                      Line Spacing
                    </label>
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

            {/* Custom CSS Editor */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[rgb(var(--fg))]">Custom CSS Editor</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-2">
                    CSS Code
                  </label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))] font-mono text-sm focus:border-[rgb(var(--primary))] focus:outline-none"
                    placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: red;&#10;}"
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--fg-muted))] mb-2">
                    Live Preview
                  </label>
                  <div className="h-32 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--surface))] p-3">
                    <div className="text-sm text-[rgb(var(--fg-muted))]">
                      {customCSS.trim() ? (
                        <div className="space-y-2">
                          <div className="font-medium text-[rgb(var(--fg))]">Custom CSS Applied</div>
                          <div className="text-xs font-mono bg-[rgb(var(--surface-2))] p-2 rounded">
                            {customCSS}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[rgb(var(--fg-subtle))] pt-8">
                          Add CSS to see live preview
                        </div>
                      )}
                    </div>
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


