const Card = ({ children, className = '', role = 'region', ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;


