import React, { useState } from 'react';

const defaultLayouts = [
  { name: 'Grid', value: 'grid' },
  { name: 'List', value: 'list' },
  { name: 'Split View', value: 'split' },
  { name: 'Sidebar', value: 'sidebar' },
];

const defaultCSS = `/* Custom CSS here */\n.card { border-radius: 8px; }`;

export default function Layouts() {
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [customCSS, setCustomCSS] = useState(defaultCSS);

  return (
    <div style={{ padding: 24 }}>
      <h1>Layout Management</h1>
      <section>
        <h2>Select Layout</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          {defaultLayouts.map(layout => (
            <button
              key={layout.value}
              onClick={() => setSelectedLayout(layout.value)}
              style={{
                padding: '8px 16px',
                background: selectedLayout === layout.value ? '#0078d4' : '#eee',
                color: selectedLayout === layout.value ? '#fff' : '#333',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </section>
      <section style={{ marginTop: 32 }}>
        <h2>Custom CSS Editor</h2>
        <textarea
          value={customCSS}
          onChange={e => setCustomCSS(e.target.value)}
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, borderRadius: 4, border: '1px solid #ccc', padding: 8 }}
        />
        <h3 style={{ marginTop: 16 }}>Live Preview</h3>
        <div style={{ border: '1px solid #eee', padding: 16, marginTop: 8 }}>
          <style>{customCSS}</style>
          <div className={`preview-layout ${selectedLayout}`}>
            <div className="card">Sample Card</div>
            <div className="card">Another Card</div>
          </div>
        </div>
      </section>
    </div>
  );
}
