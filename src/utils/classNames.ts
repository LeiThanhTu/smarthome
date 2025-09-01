/**
 * A utility function to conditionally join CSS class names together.
 * Filters out falsy values to avoid undefined or null class names.
 * 
 * @example
 * classNames('btn', 'btn-primary', isActive && 'active', className);
 * 
 * @param {...(string | undefined | null | boolean)} classes - Class names to join
 * @returns {string} - Combined class names
 */
export function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * A type-safe version of classNames that accepts template literals.
 * Useful for more complex class name logic.
 */
export function cn(
  strings: TemplateStringsArray,
  ...values: (string | number | boolean | null | undefined)[]
): string {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (value != null && value !== false) {
        result += String(value);
      }
    }
  }
  
  // Split and re-join to handle any whitespace
  return result.split(/\s+/).filter(Boolean).join(' ');
}

// Example usage with template literals:
// cn`text-${isActive ? 'indigo' : 'gray'}-600 hover:bg-${isActive ? 'indigo' : 'gray'}-100`
