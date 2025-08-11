export type ColumnKey = 'draft' | 'refined' | 'in_progress' | 'blocked' | 'completed'

export interface TaskItem {
  id: string
  title: string
  description?: string
  status: ColumnKey
  priority?: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ColumnConfig {
  key: ColumnKey
  name: string
  color: string
  wipLimit: number
}


