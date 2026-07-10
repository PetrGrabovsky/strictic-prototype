import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names; unlike plain clsx, resolves Tailwind conflicts
 * (e.g. px-2 vs px-4 on the same element) by keeping the last one.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
