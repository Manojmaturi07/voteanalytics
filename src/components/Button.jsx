import PropTypes from 'prop-types';

/**
 * Button Component
 * 
 * A reusable button component with multiple variants and sizes.
 * Supports loading states and accessibility features.
 * 
 * @component
 * @param {React.ReactNode} children - Button content
 * @param {Function} onClick - Click handler function
 * @param {string} variant - Button variant: 'primary', 'secondary', 'danger', 'success', 'outline'
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 * @param {string} className - Additional CSS classes
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation';

  const variants = {
    primary: 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-indigo-500 active:bg-indigo-800 dark:active:bg-indigo-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-400 dark:active:bg-gray-500',
    danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 active:bg-red-800 dark:active:bg-red-700',
    success: 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 focus:ring-green-500 active:bg-green-800 dark:active:bg-green-700',
    outline: 'border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:ring-indigo-500 active:bg-indigo-100 dark:active:bg-indigo-900/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-4 py-2 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;


