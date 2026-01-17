import PropTypes from 'prop-types';

/**
 * LoadingSkeleton Component
 * 
 * Displays skeleton loading placeholders for better perceived performance.
 * Uses CSS animations to create a shimmer effect that feels more responsive
 * than traditional spinners.
 * 
 * @component
 * @param {string} variant - Type of skeleton: 'card', 'line', 'circle', 'poll-list'
 * @param {number} count - Number of skeleton items to display
 * @param {string} ariaLabel - ARIA label for accessibility
 * @example
 * <LoadingSkeleton variant="poll-list" count={3} />
 * <LoadingSkeleton variant="card" />
 */
const LoadingSkeleton = ({ 
  variant = 'card', 
  count = 1,
  ariaLabel = 'Loading content'
}) => {
  const SkeletonLine = () => (
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2 animate-pulse"></div>
  );

  const SkeletonCircle = () => (
    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
  );

  const SkeletonPollCard = () => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 animate-pulse"
      role="status"
      aria-label={ariaLabel}
    >
      {/* Status badge skeleton */}
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Title skeleton */}
      <div className="mb-3 space-y-2">
        <SkeletonLine />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
      </div>

      {/* Tags skeleton */}
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      {/* Stats skeleton */}
      <div className="space-y-2 mb-4">
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine />
      </div>

      {/* Button skeleton */}
      <div className="border-t pt-4 mt-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      </div>
    </div>
  );

  const SkeletonPollList = () => (
    <div className="space-y-4" role="status" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          {/* Avatar/icon skeleton */}
          <SkeletonCircle />
          
          {/* Content skeleton */}
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const SkeletonLine_ = () => (
    <div className="space-y-2" role="status" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLine key={i} />
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return Array.from({ length: count }).map((_, i) => (
          <SkeletonPollCard key={i} />
        ));
      case 'poll-list':
        return <SkeletonPollList />;
      case 'line':
        return <SkeletonLine_ />;
      case 'circle':
        return <SkeletonCircle />;
      default:
        return <SkeletonPollCard />;
    }
  };

  if (variant === 'card') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {renderSkeleton()}
      </div>
    );
  }

  if (variant === 'poll-list') {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4" role="status" aria-label={ariaLabel}>
      {renderSkeleton()}
    </div>
  );
};

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(['card', 'line', 'circle', 'poll-list']),
  count: PropTypes.number,
  ariaLabel: PropTypes.string,
};

export default LoadingSkeleton;
