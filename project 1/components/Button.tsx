import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'info';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500';
      break;
    case 'danger':
      variantClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
    case 'info':
      variantClasses = 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500';
      break;
    default:
      variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;