import React from 'react'

interface ThemedCardProps {
  title: string
  description: string
  badge?: string
  className?: string // Optional for theme overrides or extra styling
}

const ThemedCard: React.FC<ThemedCardProps> = ({ title, description, badge, className }) => {
  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        {badge && (
          <span className="badge">{badge}</span>
        )}
      </div>
      <p className="muted">{description}</p>
      <button className="button mt-4">Action</button>
    </div>
  )
}

export default ThemedCard
