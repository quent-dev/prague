interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  className?: string
}

export const Loading = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = ''
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const container = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8'

  return (
    <div className={`${container} ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} spinner mx-auto mb-4`} />
        {message && (
          <p className="text-gray-600 text-sm animate-pulse" role="status" aria-live="polite">
            {message}
          </p>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

// Skeleton loading component for content
interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton = ({ className = '', lines = 1 }: SkeletonProps) => {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Loading content">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={`h-4 bg-gray-200 rounded ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Card skeleton for loading cards
export const CardSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}