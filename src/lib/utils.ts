import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge classNames conditionally.
 * Wrapper around clsx for consistent usage across projects.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

