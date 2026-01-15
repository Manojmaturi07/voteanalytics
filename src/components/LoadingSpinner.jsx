/**
 * LoadingSpinner - Reusable loading indicator component
 * Shows a spinning animation with optional text during async operations
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  ariaLabel = 'Loading content'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const spinner = (
    <div 
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 border-r-purple-600 rounded-full animate-spin"></div>
      </div>
      {text && (
        <p className="text-gray-600 font-medium text-sm sm:text-base">
          {text}
        </p>
      )}
      <span className="sr-only">Loading, please wait...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
