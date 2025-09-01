import { InputHTMLAttributes, forwardRef } from 'react';
import { classNames } from '../utils/classNames';

type InputVariant = 'default' | 'error' | 'success' | 'warning';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const inputSizes: Record<InputSize, string> = {
  sm: 'py-1.5 px-3 text-sm rounded',
  md: 'py-2 px-4 text-base rounded-md',
  lg: 'py-3 px-5 text-lg rounded-lg',
};

const inputVariants: Record<InputVariant, string> = {
  default: 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isError = variant === 'error' || !!error;
    const effectiveVariant = isError ? 'error' : variant;

    return (
      <div className={classNames('space-y-1', fullWidth ? 'w-full' : '', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={classNames(
              'block text-sm font-medium',
              isError ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{leftIcon}</span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={classNames(
              'block w-full border shadow-sm focus:outline-none',
              inputSizes[size],
              inputVariants[effectiveVariant],
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {description && !isError && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}

        {isError && (
          <p className="mt-1 text-sm text-red-600">{error || 'This field is required'}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component that shares similar props with Input
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  description?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      description,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const isError = variant === 'error' || !!error;
    const effectiveVariant = isError ? 'error' : variant;

    return (
      <div className={classNames('space-y-1', fullWidth ? 'w-full' : '', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={classNames(
              'block text-sm font-medium',
              isError ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          <textarea
            id={inputId}
            ref={ref}
            className={classNames(
              'block w-full border shadow-sm focus:outline-none',
              inputSizes[size],
              inputVariants[effectiveVariant],
              props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
              'resize-vertical min-h-[100px]',
              className
            )}
            {...props}
          />
        </div>

        {description && !isError && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}

        {isError && (
          <p className="mt-1 text-sm text-red-600">{error || 'This field is required'}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
