import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div
      className={cn(
        'spinner border-2 border-current border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
