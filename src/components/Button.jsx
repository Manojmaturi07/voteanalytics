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
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100',
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

export default Button;


