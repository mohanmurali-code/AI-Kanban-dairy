import type { ThemeMode, FontFamily, LineSpacing, BoardDensity, CardSize } from '../store/theme'
import { usePreferencesStore } from '../store/theme'
import React from 'react'

/**
 * Themes page.
 *
 * Simple theme selection controls. Actual theming logic to be added.
 */
function Themes() {
  const {
    theme,
    accentColor,
    fontFamily,
    fontSize,
    lineSpacing,
    sidebar,
    boardDensity,
    cardSize,
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Themes</h2>

      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Theme Mode</div>
        <div className="flex gap-3">
          {[ 'light', 'dark', 'system', 'high-contrast' ].map((mode) => (
            <button
              key={mode}
              className={`ui-btn ${theme === mode ? 'bg-primary text-white' : ''}`}
              onClick={() => setTheme(mode as ThemeMode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Accent Color</div>
        <div className="grid grid-cols-5 gap-2">
          {[ '#7c3aed', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899' ].map((color) => (
            <button
              key={color}
              className="w-full h-10 rounded-md border-2 border-transparent focus:border-blue-500"
              style={{ backgroundColor: color }}
              onClick={() => setAccentColor(color)}
              title={color}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            className="ui-input"
            placeholder="Custom HEX color (e.g., #RRGGBB)"
            value={customAccentColorInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAccentColorInput(e.target.value)}
            onBlur={applyCustomAccentColor}
          />
          <button className="ui-btn" onClick={applyCustomAccentColor}>Apply</button>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Font Settings</div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs opacity-70 mb-1">Font Family</label>
            <select
              className="ui-input"
              value={fontFamily}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFontFamily(e.target.value as FontFamily)}
            >
              <option value="system-ui">System UI</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
          <div>
            <label className="block text-xs opacity-70 mb-1">Font Size</label>
            <div className="flex gap-2">
              {[ 'S', 'M', 'L', 'XL' ].map((size) => (
                <button
                  key={size}
                  className={`ui-btn ${fontSize === size ? 'bg-primary text-white' : ''}`}
                  onClick={() => setFontSize(size as 'S' | 'M' | 'L' | 'XL')}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs opacity-70 mb-1">Line Spacing</label>
            <div className="flex gap-2">
              {[ 'normal', 'comfortable', 'relaxed' ].map((spacing) => (
                <button
                  key={spacing}
                  className={`ui-btn ${lineSpacing === spacing ? 'bg-primary text-white' : ''}`}
                  onClick={() => setLineSpacing(spacing as LineSpacing)}
                >
                  {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Layout Settings</div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs opacity-70 mb-1">Sidebar Position</label>
            <div className="flex gap-2">
              {[ 'left', 'right' ].map((position) => (
                <button
                  key={position}
                  className={`ui-btn ${sidebar === position ? 'bg-primary text-white' : ''}`}
                  onClick={() => setSidebarPosition(position as 'left' | 'right')}
                >
                  {position.charAt(0).toUpperCase() + position.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs opacity-70 mb-1">Board Density</label>
            <div className="flex gap-2">
              {[ 'compact', 'cozy', 'comfortable' ].map((density) => (
                <button
                  key={density}
                  className={`ui-btn ${boardDensity === density ? 'bg-primary text-white' : ''}`}
                  onClick={() => setBoardDensity(density as BoardDensity)}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs opacity-70 mb-1">Card Size</label>
            <div className="flex gap-2">
              {[ 'S', 'M', 'L' ].map((size) => (
                <button
                  key={size}
                  className={`ui-btn ${cardSize === size ? 'bg-primary text-white' : ''}`}
                  onClick={() => setCardSize(size as CardSize)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Reset Preferences</div>
        <button
          className="ui-btn bg-red-500 text-white"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default Themes


