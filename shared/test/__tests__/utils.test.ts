import {
  isType,
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isPromise,
  isError,
  isPlainObject,
  isEnumValue,
  isNonEmptyString,
  isNonEmptyArray,
  isNonEmptyObject,
  isUrlString,
  isEmailString,
  isUuidString,
  isDateString,
  isNumericString,
  isIntegerString,
  isPositiveIntegerString,
  isNegativeIntegerString,
  isNonNegativeIntegerString,
  isNonPositiveIntegerString,
  isPositiveNumberString,
  isNegativeNumberString,
  isNonNegativeNumberString,
  isNonPositiveNumberString,
  isHexColorString,
  isRgbColorString,
  isRgbaColorString,
  isHslColorString,
  isHslaColorString,
  isColorString,
} from '../../src/types/utils';

describe('Type Guards', () => {
  describe('isType', () => {
    type Action = { type: 'ADD'; payload: number } | { type: 'REMOVE'; id: string };
    
    it('should narrow the type correctly', () => {
      const action: Action = { type: 'ADD', payload: 1 };
      
      if (isType(action, 'ADD')) {
        expect(action.payload).toBe(1);
        // @ts-expect-error - id should not exist on this type
        expect(action.id).toBeUndefined();
      } else {
        fail('Type guard failed');
      }
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should correctly identify strings', () => {
      expect(isString('test')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(String('test'))).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should correctly identify numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(Number('123'))).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should correctly identify booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(Boolean(1))).toBe(true);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should correctly identify objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject('object')).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should correctly identify arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(Array.from('test'))).toBe(true);
      expect(isArray({ length: 0 })).toBe(false);
      expect(isArray('array')).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should correctly identify functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(class {})).toBe(true);
      expect(isFunction({})).toBe(false);
      expect(isFunction('function')).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe('isDate', () => {
    it('should correctly identify valid dates', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2023-01-01'))).toBe(true);
      expect(isDate(new Date('invalid'))).toBe(false); // Invalid date
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(1672531200000)).toBe(false);
      expect(isDate({})).toBe(false);
    });
  });

  describe('isPromise', () => {
    it('should correctly identify promises', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true);
      expect(isPromise({})).toBe(false);
      expect(isPromise(() => {})).toBe(false);
    });
  });

  describe('isError', () => {
    it('should correctly identify errors', () => {
      expect(isError(new Error())).toBe(true);
      expect(isError({ message: 'Error', name: 'Error', stack: '' })).toBe(true);
      expect(isError({})).toBe(false);
      expect(isError('error')).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should correctly identify plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
    });
  });

  describe('isEnumValue', () => {
    enum TestEnum {
      A = 'A',
      B = 'B',
    }

    it('should check if a value is a valid enum value', () => {
      expect(isEnumValue(TestEnum, 'A')).toBe(true);
      expect(isEnumValue(TestEnum, 'B')).toBe(true);
      expect(isEnumValue(TestEnum, 'C')).toBe(false);
      expect(isEnumValue(TestEnum, '')).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should check for non-empty strings', () => {
      expect(isNonEmptyString('test')).toBe(true);
      expect(isNonEmptyString(' ')).toBe(false); // Whitespace is not considered non-empty
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(null as any)).toBe(false);
    });
  });

  describe('isNonEmptyArray', () => {
    it('should check for non-empty arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray(null as any)).toBe(false);
    });
  });

  describe('isNonEmptyObject', () => {
    it('should check for non-empty objects', () => {
      expect(isNonEmptyObject({ a: 1 })).toBe(true);
      expect(isNonEmptyObject({ a: 1, b: 2 })).toBe(true);
      expect(isNonEmptyObject({})).toBe(false);
      expect(isNonEmptyObject(null as any)).toBe(false);
    });
  });

  describe('String validation', () => {
    it('should validate URLs', () => {
      expect(isUrlString('https://example.com')).toBe(true);
      expect(isUrlString('http://localhost:3000')).toBe(true);
      expect(isUrlString('not-a-url')).toBe(false);
      expect(isUrlString('')).toBe(false);
    });

    it('should validate emails', () => {
      expect(isEmailString('test@example.com')).toBe(true);
      expect(isEmailString('user.name+tag@example.co.uk')).toBe(true);
      expect(isEmailString('not-an-email')).toBe(false);
      expect(isEmailString('@missing-local.com')).toBe(false);
    });

    it('should validate UUIDs', () => {
      expect(isUuidString('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isUuidString('00000000-0000-0000-0000-000000000000')).toBe(true);
      expect(isUuidString('not-a-uuid')).toBe(false);
      expect(isUuidString('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
      expect(isUuidString('123e4567-e89b-12d3-a456-42661417400g')).toBe(false); // Invalid character 'g'
    });

    it('should validate date strings', () => {
      expect(isDateString('2023-01-01')).toBe(true);
      expect(isDateString('2023-01-01T12:00:00Z')).toBe(true);
      expect(isDateString('not-a-date')).toBe(false);
      expect(isDateString('2023-13-01')).toBe(false);
    });

    it('should validate numeric strings', () => {
      expect(isNumericString('123')).toBe(true);
      expect(isNumericString('-123.45')).toBe(true);
      expect(isNumericString('123a')).toBe(false);
      expect(isNumericString('')).toBe(false);
    });

    it('should validate integer strings', () => {
      expect(isIntegerString('123')).toBe(true);
      expect(isIntegerString('-123')).toBe(true);
      expect(isIntegerString('123.45')).toBe(false);
      expect(isIntegerString('123a')).toBe(false);
    });

    it('should validate color strings', () => {
      // Hex
      expect(isHexColorString('#fff')).toBe(true);
      expect(isHexColorString('#ffffff')).toBe(true);
      expect(isHexColorString('#fffff')).toBe(false);
      
      // RGB
      expect(isRgbColorString('rgb(255, 255, 255)')).toBe(true);
      expect(isRgbColorString('rgb(0,0,0)')).toBe(true);
      expect(isRgbColorString('rgb(255, 0, 0)')).toBe(true);
      expect(isRgbColorString('rgb(256, 0, 0)')).toBe(false); // Invalid red value
      
      // RGBA
      expect(isRgbaColorString('rgba(255, 255, 255, 0.5)')).toBe(true);
      expect(isRgbaColorString('rgba(0,0,0,1)')).toBe(true);
      expect(isRgbaColorString('rgba(256, 0, 0, 1.1)')).toBe(false);
      
      // HSL
      expect(isHslColorString('hsl(0, 100%, 50%)')).toBe(true);
      expect(isHslColorString('hsl(360,50%,50%)')).toBe(true);
      expect(isHslColorString('hsl(361, 0%, 0%)')).toBe(false);
      
      // HSLA
      expect(isHslaColorString('hsla(0, 100%, 50%, 0.5)')).toBe(true);
      expect(isHslaColorString('hsla(360,50%,50%,1)')).toBe(true);
      expect(isHslaColorString('hsla(361, 0%, 0%, 1.1)')).toBe(false);
      
      // Any color
      expect(isColorString('#fff')).toBe(true);
      expect(isColorString('rgb(255, 255, 255)')).toBe(true);
      expect(isColorString('rgba(255, 255, 255, 0.5)')).toBe(true);
      expect(isColorString('hsl(0, 100%, 50%)')).toBe(true);
      expect(isColorString('hsla(0, 100%, 50%, 0.5)')).toBe(true);
      expect(isColorString('not-a-color')).toBe(false);
    });
  });
});
