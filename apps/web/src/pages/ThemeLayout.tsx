import React, { useState } from 'react';
import { usePreferencesStore } from '../store/theme';
import { ThemeSelector } from '../components/ThemeSelector';

// Theme options are now managed by the ThemeSelector component

const defaultLayouts = [
  { name: 'Grid', value: 'grid' },
  { name: 'List', value: 'list' },
  { name: 'Split View', value: 'split' },
  { name: 'Sidebar', value: 'sidebar' },
];

const defaultCSS = `/* Custom CSS here */\n.card { border-radius: 8px; }`;

export default function ThemeLayout() {
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [customCSS, setCustomCSS] = useState(defaultCSS);
  const {
    appearance,
    layout,
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
  } = usePreferencesStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Theme & Layout Settings</h2>
      
      {/* New Theme Selector */}
      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Theme Selection</div>
        <ThemeSelector />
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
            onChange={(e) => setCustomAccentColorInput(e.target.value)}
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
              value={appearance.fontFamily}
              onChange={(e) => setFontFamily(e.target.value as typeof appearance.fontFamily)}
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
                  className={`ui-btn ${appearance.fontSize === size ? 'bg-primary text-white' : ''}`}
                  onClick={() => setFontSize(size as typeof appearance.fontSize)}
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
                  className={`ui-btn ${appearance.lineSpacing === spacing ? 'bg-primary text-white' : ''}`}
                  onClick={() => setLineSpacing(spacing as typeof appearance.lineSpacing)}
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
                  className={`ui-btn ${layout.sidebar === position ? 'bg-primary text-white' : ''}`}
                  onClick={() => setSidebarPosition(position as typeof layout.sidebar)}
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
                  className={`ui-btn ${layout.boardDensity === density ? 'bg-primary text-white' : ''}`}
                  onClick={() => setBoardDensity(density as typeof layout.boardDensity)}
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
                  className={`ui-btn ${layout.cardSize === size ? 'bg-primary text-white' : ''}`}
                  onClick={() => setCardSize(size as typeof layout.cardSize)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Layout Type</div>
        <div className="flex gap-4">
          {defaultLayouts.map(layout => (
            <button
              key={layout.value}
              onClick={() => setSelectedLayout(layout.value)}
              className={`theme-btn-secondary ${selectedLayout === layout.value ? 'theme-btn-primary' : ''}`}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80 mb-2">Custom CSS Editor</div>
        <textarea
          value={customCSS}
          onChange={e => setCustomCSS(e.target.value)}
          rows={8}
          className="w-full font-mono text-sm rounded-md border theme-input-border theme-input-bg theme-input-text p-2"
        />
        <h3 className="mt-4 text-base font-semibold">Live Preview</h3>
        <div className="theme-preview-border theme-preview-bg p-4 mt-2 rounded-md">
          <style>{customCSS}</style>
          <div className={`preview-layout ${selectedLayout} flex gap-4 flex-wrap`}>
            <div className="theme-card-bg theme-card-border theme-card-shadow rounded-md p-4 min-w-[160px]">Sample Card</div>
            <div className="theme-card-bg theme-card-border theme-card-shadow rounded-md p-4 min-w-[160px]">Another Card</div>
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
  );
}
