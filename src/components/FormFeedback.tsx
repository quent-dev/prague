interface FormFeedbackProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose?: () => void
}

export const FormFeedback = ({ type, message, onClose }: FormFeedbackProps) => {
  const bgColor = {
    success: 'bg-green-900/20 border-accent-success/30 text-accent-success',
    error: 'bg-red-900/20 border-accent-error/30 text-accent-error',
    info: 'bg-blue-900/20 border-accent-primary/30 text-accent-primary',
  }[type]

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }[type]

  return (
    <div 
      className={`p-3 rounded-lg border ${bgColor} flex items-start sm:items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start sm:items-center space-x-2 flex-1 min-w-0">
        <span className="flex-shrink-0 mt-0.5 sm:mt-0" role="img" aria-hidden="true">{icon}</span>
        <span className="text-sm font-medium break-words">{message}</span>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="text-dark-text-muted hover:text-dark-text-secondary ml-3 flex-shrink-0 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-dark-border focus:ring-offset-1 rounded p-1"
          aria-label="Close notification"
          type="button"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}