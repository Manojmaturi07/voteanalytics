import PropTypes from 'prop-types';

/**
 * Card Component
 * 
 * A reusable card container component with consistent styling.
 * Supports dark mode and custom styling.
 * 
 * @component
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} role - ARIA role for accessibility
 * @example
 * <Card className="mb-4">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 */
const Card = ({ children, className = '', role = 'region', ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 sm:p-6 text-gray-900 dark:text-gray-100 ${className}`}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  role: PropTypes.string,
};

export default Card;


