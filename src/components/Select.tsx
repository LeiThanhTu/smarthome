import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { classNames } from '../utils/classNames';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type SelectVariant = 'default' | 'error' | 'success' | 'warning';
type SelectSize = 'sm' | 'md' | 'lg';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  containerClassName?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
}

const selectSizes: Record<SelectSize, string> = {
  sm: 'py-1.5 pl-3 pr-8 text-sm rounded',
  md: 'py-2 pl-4 pr-10 text-base rounded-md',
  lg: 'py-3 pl-5 pr-12 text-lg rounded-lg',
};

const selectVariants: Record<SelectVariant, string> = {
  default: 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      description,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      className = '',
      containerClassName = '',
      options,
      placeholder = 'Select an option',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const isError = variant === 'error' || !!error;
    const effectiveVariant = isError ? 'error' : variant;
    const hasValue = props.value !== undefined && props.value !== '' && props.value !== null;

    return (
      <div className={classNames('space-y-1', fullWidth ? 'w-full' : '', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={classNames(
              'block text-sm font-medium',
              isError ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <select
            id={selectId}
            ref={ref}
            className={classNames(
              'appearance-none block w-full border bg-white shadow-sm focus:outline-none',
              selectSizes[size],
              selectVariants[effectiveVariant],
              leftIcon ? 'pl-10' : 'pl-3',
              !hasValue ? 'text-gray-400' : 'text-gray-900',
              props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
              className
            )}
            {...props}
          >
            <option value="" disabled={!props.required}>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className={classNames(
                'h-5 w-5',
                isError ? 'text-red-400' : 'text-gray-400'
              )}
              aria-hidden="true"
            />
          </div>
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

Select.displayName = 'Select';

// MultiSelect component that extends the base Select with multiple selection support
type MultiSelectProps = Omit<SelectProps, 'value' | 'onChange' | 'multiple'> & {
  value: string[];
  onChange: (value: string[]) => void;
};

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({
    value = [],
    onChange,
    options,
    placeholder = 'Select options',
    ...props
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onChange(selectedOptions);
    };

    return (
      <Select
        ref={ref}
        multiple
        value={value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
