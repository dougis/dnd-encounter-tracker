/**
 * Type helper to make it easier to work with discriminated unions.
 * @example
 * type Action = { type: 'ADD'; payload: number } | { type: 'REMOVE'; id: string };
 * const action: Action = { type: 'ADD', payload: 1 };
 * if (isType(action, 'ADD')) {
 *   // action is now { type: 'ADD'; payload: number }
 *   console.log(action.payload);
 * }
 */
export function isType<T extends { type: string }, K extends T['type']>(
  value: T,
  type: K
): value is Extract<T, { type: K }> {
  return value.type === type;
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an object (and not null/array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a function
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

/**
 * Type guard to check if a value is a Date object
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a Promise
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return (
    isObject(value) &&
    'then' in value &&
    isFunction((value as any).then) &&
    'catch' in value &&
    isFunction((value as any).catch)
  );
}

/**
 * Type guard to check if a value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error || (isObject(value) && 'message' in value);
}

/**
 * Type guard to check if a value is a plain object (not a class instance, array, etc.)
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Type guard to check if a value is a valid enum value
 */
export function isEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as any);
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if a value is a non-empty object
 */
export function isNonEmptyObject(
  value: unknown
): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Type guard to check if a value is a valid URL string
 */
export function isUrlString(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value is a valid email string
 */
export function isEmailString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Type guard to check if a value is a valid UUID string
 * Supports both version 1-5 UUIDs and the nil UUID (all zeros)
 */
export function isUuidString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  ) || /^[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12}$/i.test(value);
}

/**
 * Type guard to check if a value is a valid date string (ISO 8601)
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  return !isNaN(Date.parse(value));
}

/**
 * Type guard to check if a value is a valid numeric string
 */
export function isNumericString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-?\d+(\.\d+)?$/.test(value);
}

/**
 * Type guard to check if a value is a valid integer string
 */
export function isIntegerString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-?\d+$/.test(value);
}

/**
 * Type guard to check if a value is a valid positive integer string
 */
export function isPositiveIntegerString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^\d+$/.test(value);
}

/**
 * Type guard to check if a value is a valid negative integer string
 */
export function isNegativeIntegerString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-\d+$/.test(value);
}

/**
 * Type guard to check if a value is a valid non-negative integer string
 */
export function isNonNegativeIntegerString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^\d+$/.test(value);
}

/**
 * Type guard to check if a value is a valid non-positive integer string
 */
export function isNonPositiveIntegerString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-\d+$/.test(value);
}

/**
 * Type guard to check if a value is a valid positive number string
 */
export function isPositiveNumberString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^\d+(\.\d+)?$/.test(value);
}

/**
 * Type guard to check if a value is a valid negative number string
 */
export function isNegativeNumberString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-\d+(\.\d+)?$/.test(value);
}

/**
 * Type guard to check if a value is a valid non-negative number string
 */
export function isNonNegativeNumberString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^\d+(\.\d+)?$/.test(value);
}

/**
 * Type guard to check if a value is a valid non-positive number string
 */
export function isNonPositiveNumberString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^-\d+(\.\d+)?$/.test(value);
}

/**
 * Type guard to check if a value is a valid hex color string
 */
export function isHexColorString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

/**
 * Type guard to check if a value is a valid RGB color string
 * Validates that RGB values are between 0-255
 */
export function isRgbColorString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // First check the basic format
  const rgbMatch = value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!rgbMatch) return false;
  
  // Then validate each component is between 0-255
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);
  
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

/**
 * Type guard to check if a value is a valid RGBA color string
 * Validates that RGB values are between 0-255 and alpha is between 0-1
 */
export function isRgbaColorString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // First check the basic format
  const rgbaMatch = value.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\d?\d(?:\.\d+)?|0?\.\d+)\s*\)$/i);
  if (!rgbaMatch) return false;
  
  // Validate RGB components (0-255)
  const r = parseInt(rgbaMatch[1], 10);
  const g = parseInt(rgbaMatch[2], 10);
  const b = parseInt(rgbaMatch[3], 10);
  
  // Validate alpha (0-1)
  const alpha = parseFloat(rgbaMatch[4]);
  
  return r >= 0 && r <= 255 && 
         g >= 0 && g <= 255 && 
         b >= 0 && b <= 255 && 
         alpha >= 0 && alpha <= 1;
}

/**
 * Type guard to check if a value is a valid HSL color string
 * Validates that hue is 0-360 and saturation/lightness are 0-100%
 */
export function isHslColorString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // First check the basic format
  const hslMatch = value.match(/^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i);
  if (!hslMatch) return false;
  
  // Validate hue (0-360), saturation (0-100), and lightness (0-100)
  const h = parseInt(hslMatch[1], 10);
  const s = parseInt(hslMatch[2], 10);
  const l = parseInt(hslMatch[3], 10);
  
  return h >= 0 && h <= 360 && 
         s >= 0 && s <= 100 && 
         l >= 0 && l <= 100;
}

/**
 * Type guard to check if a value is a valid HSLA color string
 * Validates that hue is 0-360, saturation/lightness are 0-100%, and alpha is 0-1
 */
export function isHslaColorString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // First check the basic format
  const hslaMatch = value.match(/^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*([01]?\d?\d(?:\.\d+)?|0?\.\d+)\s*\)$/i);
  if (!hslaMatch) return false;
  
  // Validate hue (0-360), saturation (0-100), and lightness (0-100)
  const h = parseInt(hslaMatch[1], 10);
  const s = parseInt(hslaMatch[2], 10);
  const l = parseInt(hslaMatch[3], 10);
  
  // Validate alpha (0-1)
  const alpha = parseFloat(hslaMatch[4]);
  
  return h >= 0 && h <= 360 && 
         s >= 0 && s <= 100 && 
         l >= 0 && l <= 100 &&
         alpha >= 0 && alpha <= 1;
}

/**
 * Type guard to check if a value is a valid color string (hex, rgb, rgba, hsl, hsla)
 */
export function isColorString(value: unknown): value is string {
  return (
    isHexColorString(value) ||
    isRgbColorString(value) ||
    isRgbaColorString(value) ||
    isHslColorString(value) ||
    isHslaColorString(value)
  );
}
