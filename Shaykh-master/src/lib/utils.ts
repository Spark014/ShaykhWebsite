import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a string is a valid HTTP or HTTPS URL.
 * Allows empty, null, or undefined strings as they might be optional fields.
 * @param string The string to validate.
 * @returns True if the string is a valid HTTP/HTTPS URL or if it's empty/null/undefined, false otherwise.
 */
export function isValidHttpUrl(string: string | null | undefined): boolean {
  if (!string || string.trim() === "") return true; // Allow empty or null URLs (they are optional)
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
