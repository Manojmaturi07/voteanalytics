/**
 * EmptyState - User-friendly component for empty data states
 * Displays an icon, message, and optional action button
 */
const EmptyState = ({ 
  icon = '📋',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actionText = null,
  onAction = null,
  ariaLabel = 'Empty state'
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 sm:py-16"
      role="status"
      aria-label={ariaLabel}
    >
      <div className="text-5xl sm:text-6xl mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-600 max-w-sm text-center mb-6 text-sm sm:text-base">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={actionText}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
