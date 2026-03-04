import { Transform } from 'class-transformer';

/**
 * Trim whitespace from input string
 */
export const Trim = () => Transform(({ value }) => typeof value === 'string' ? value.trim() : value);

/**
 * Convert string to lowercase
 */
export const ToLowerCase = () => Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value);

/**
 * Convert string to uppercase
 */
export const ToUpperCase = () => Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value);

/**
 * Convert value to Number
 */
export const ToNumber = () => Transform(({ value }) => value === undefined || value === null ? value : Number(value));

/**
 * Convert value to Date
 */
export const ToDate = () => Transform(({ value }) => value ? new Date(value) : value);

/**
 * Convert value to Boolean (handles 'true', 'false', 1, 0, etc.)
 */
export const ToBoolean = () => Transform(({ value }) => {
    if (value === 'true' || value === 1 || value === true) return true;
    if (value === 'false' || value === 0 || value === false) return false;
    return value;
});
