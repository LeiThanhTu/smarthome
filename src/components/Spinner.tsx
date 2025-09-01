import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-4',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`animate-spin rounded-full border-solid border-blue-500 border-r-transparent ${sizeClasses[size]}`}
        style={{ animation: 'spin 1s linear infinite' }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
