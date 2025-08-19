/**
 * Theme-Aware Card Component
 * 
 * A reference implementation demonstrating the enhanced theming standards.
 * This component shows how to create theme-aware components with proper
 * TypeScript interfaces, accessibility support, and consistent styling.
 */

import React from 'react'
import { useThemeStyles, createComponentVariants } from '../utils/themeUtils'

// Component variants using the utility function
const cardVariants = createComponentVariants({
  default: 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] shadow-sm',
  elevated: 'bg-[rgb(var(--surface-2))] border-[rgb(var(--border-subtle))] shadow-lg',
  subtle: 'bg-transparent border-[rgb(var(--border-subtle))]',
  interactive: 'bg-[rgb(var(--surface))] border-[rgb(var(--border))] shadow-sm hover:bg-[rgb(var(--surface-2))] hover:shadow-md cursor-pointer transition-all duration-200'
})

const cardSizes = createComponentVariants({
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-6 text-lg'
})

// TypeScript interface following the standards
export interface ThemeAwareCardProps {
  /** Custom CSS classes to apply */
  className?: string
  /** Visual variant of the card */
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive'
  /** Size variant of the card */
  size?: 'sm' | 'md' | 'lg'
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Card content */
  children: React.ReactNode
  /** Optional click handler for interactive cards */
  onClick?: () => void
  /** Optional badge content */
  badge?: string
  /** Badge color variant */
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** Whether the card is loading */
  loading?: boolean
  /** Whether the card is disabled */
  disabled?: boolean
}

/**
 * Theme-aware card component that adapts to the current theme
 * and provides consistent styling across all theme variations.
 */
export function ThemeAwareCard({
  className = '',
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  children,
  onClick,
  badge,
  badgeVariant = 'default',
  loading = false,
  disabled = false
}: ThemeAwareCardProps) {
  const themeStyles = useThemeStyles()
  
  // Base classes with theme-aware styling
  const baseClasses = 'rounded-lg border transition-colors'
  const variantClasses = cardVariants(variant, className)
  const sizeClasses = cardSizes(size)
  
  // Badge styling
  const badgeClasses = {
    default: 'bg-[rgb(var(--primary))] text-white',
    success: 'bg-[rgb(var(--success))] text-white',
    warning: 'bg-[rgb(var(--warning))] text-black',
    error: 'bg-[rgb(var(--error))] text-white',
    info: 'bg-[rgb(var(--info))] text-white'
  }
  
  // Interactive states
  const isInteractive = variant === 'interactive' && onClick && !disabled && !loading
  const interactiveClasses = isInteractive ? 'cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2' : ''
  
  // Disabled state
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  // Loading state
  const loadingClasses = loading ? 'animate-pulse' : ''
  
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${interactiveClasses}
        ${disabledClasses}
        ${loadingClasses}
      `.trim()}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}
    >
      {/* Header section */}
      {(title || subtitle || badge) && (
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`font-semibold ${themeStyles.text.primary} truncate`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm ${themeStyles.text.secondary} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0
              ${badgeClasses[badgeVariant]}
            `}>
              {badge}
            </span>
          )}
        </div>
      )}
      
      {/* Content section */}
      <div className={themeStyles.text.primary}>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-[rgb(var(--border))] rounded animate-pulse"></div>
            <div className="h-4 bg-[rgb(var(--border))] rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// Export a simpler version for basic use cases
export function SimpleCard({ 
  children, 
  className = '',
  ...props 
}: Omit<ThemeAwareCardProps, 'title' | 'subtitle' | 'badge' | 'badgeVariant'>) {
  return (
    <ThemeAwareCard className={className} {...props}>
      {children}
    </ThemeAwareCard>
  )
}

// Export a title card for content with headers
export function TitleCard({ 
  title, 
  subtitle, 
  children, 
  className = '',
  ...props 
}: Omit<ThemeAwareCardProps, 'badge' | 'badgeVariant'>) {
  return (
    <ThemeAwareCard 
      title={title} 
      subtitle={subtitle} 
      className={className} 
      {...props}
    >
      {children}
    </ThemeAwareCard>
  )
}

// Export a badge card for content with status indicators
export function BadgeCard({ 
  badge, 
  badgeVariant, 
  children, 
  className = '',
  ...props 
}: Omit<ThemeAwareCardProps, 'title' | 'subtitle'>) {
  return (
    <ThemeAwareCard 
      badge={badge} 
      badgeVariant={badgeVariant} 
      className={className} 
      {...props}
    >
      {children}
    </ThemeAwareCard>
  )
}
