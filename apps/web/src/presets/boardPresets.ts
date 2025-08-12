import type { ColumnKey, ColumnConfig } from '../types'

export interface BoardPreset {
  id: string
  name: string
  description: string
  columns: ColumnConfig[]
}

const baseColumns: Array<{ key: ColumnKey; name: string }> = [
  { key: 'draft', name: 'Draft' },
  { key: 'refined', name: 'Refined' },
  { key: 'in_progress', name: 'In Progress' },
  { key: 'blocked', name: 'Blocked' },
  { key: 'completed', name: 'Completed' },
]

export const MinimalPreset: BoardPreset = {
  id: 'preset_minimal',
  name: 'Minimal (Clean)',
  description: 'Airy layout, subtle borders, priority emphasis only.',
  columns: baseColumns.map((c) => ({
    key: c.key,
    name: c.name,
    color: '#e5e7eb', // gray-200
    wipLimit: 0,
  })),
}

export const DetailedPreset: BoardPreset = {
  id: 'preset_detailed',
  name: 'Detailed (Rich Cards)',
  description: 'Cards show title, priority, due date, and tags with stronger contrast.',
  columns: baseColumns.map((c) => ({
    key: c.key,
    name: c.name,
    color: '#dbeafe', // blue-100
    wipLimit: 0,
  })),
}

export const CompactPreset: BoardPreset = {
  id: 'preset_compact',
  name: 'Compact (Dense)',
  description: 'Tighter spacing and smaller cards for maximum information density.',
  columns: baseColumns.map((c) => ({
    key: c.key,
    name: c.name,
    color: '#f3f4f6', // gray-100
    wipLimit: 0,
  })),
}

export const HighContrastPreset: BoardPreset = {
  id: 'preset_high_contrast',
  name: 'High Contrast (Accessible)',
  description: 'Strong borders, high-contrast headers, and large focus outlines.',
  columns: baseColumns.map((c) => ({
    key: c.key,
    name: c.name,
    color: '#111827', // gray-900 for header accenting in UI
    wipLimit: 0,
  })),
}

export const BoardPresets: BoardPreset[] = [
  MinimalPreset,
  DetailedPreset,
  CompactPreset,
  HighContrastPreset,
]


