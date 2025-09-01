import { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../utils/classNames';
// import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-transparent',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500 border-transparent',
  link: 'bg-transparent text-indigo-600 hover:text-indigo-800 hover:underline focus:ring-indigo-500 border-transparent p-0',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  as: Component = 'button',
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 border';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconSpacing = size === 'sm' ? 'space-x-1.5' : 'space-x-2';
  
  const buttonClasses = classNames(
    baseClasses,
    buttonVariants[variant],
    buttonSizes[size],
    widthClass,
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  );

  return (
    <Component
      className={buttonClasses}
      disabled={isDisabled}
      type={Component === 'button' ? type : undefined}
      {...props}
    >
      {isLoading && <Spinner size={size} className="-ml-1 mr-2" />}
      {!isLoading && leftIcon && <span className={children ? 'mr-2' : ''}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={children ? 'ml-2' : ''}>{rightIcon}</span>}
    </Component>
  );
}

// Spinner component for loading state
function Spinner({ size = 'md', className = '' }: { size?: ButtonSize; className?: string }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
