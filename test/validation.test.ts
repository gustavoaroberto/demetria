import { describe, expect, it } from 'vitest';
import type { FormField } from '../src/core/types.js';
import { validateFieldValue } from '../src/core/validation.js';

function field(overrides: Partial<FormField> = {}): FormField {
  return {
    name: 'value',
    type: 'text',
    label: 'Value',
    ...overrides
  } as FormField;
}

describe('field validation', () => {
  it('treats an omitted required flag and required false as optional', () => {
    expect(validateFieldValue(field(), '')).toBeUndefined();
    expect(validateFieldValue(field({ required: false }), '')).toBeUndefined();
  });

  it('rejects empty required fields but currently accepts whitespace text', () => {
    expect(validateFieldValue(field({ required: true }), '')).toBe(
      'Value is required.'
    );
    expect(
      validateFieldValue(field({ required: true }), '   ')
    ).toBeUndefined();
  });

  it('validates a non-empty optional email', () => {
    const email = field({ type: 'email' });
    expect(validateFieldValue(email, '')).toBeUndefined();
    expect(validateFieldValue(email, 'not-an-email')).toBe(
      'Value must be a valid email address.'
    );
    expect(validateFieldValue(email, 'reader@example.com')).toBeUndefined();
    expect(validateFieldValue(email, '')).toBeUndefined();
  });

  it('accepts an empty optional number and rejects non-finite or string values', () => {
    const number = field({ type: 'number' });
    expect(validateFieldValue(number, '')).toBeUndefined();
    expect(validateFieldValue(number, 42)).toBeUndefined();
    expect(validateFieldValue(number, Number.NaN)).toBe(
      'Value must be a valid number.'
    );
    expect(validateFieldValue(number, '42')).toBe(
      'Value must be a valid number.'
    );
  });

  it('requires select values to match a declared option when non-empty', () => {
    const select = field({
      type: 'select',
      options: [{ label: 'One', value: 'one' }]
    });
    expect(validateFieldValue(select, '')).toBeUndefined();
    expect(validateFieldValue(select, 'one')).toBeUndefined();
    expect(validateFieldValue(select, 'unknown')).toBe(
      'Value has an invalid selection.'
    );
  });

  it('allows false for optional checkboxes and requires true when required', () => {
    const optional = field({ type: 'checkbox' });
    const required = field({ type: 'checkbox', required: true });
    expect(validateFieldValue(optional, false)).toBeUndefined();
    expect(validateFieldValue(optional, 'true')).toBe(
      'Value has an invalid value.'
    );
    expect(validateFieldValue(required, false)).toBe('Value must be checked.');
    expect(validateFieldValue(required, true)).toBeUndefined();
  });
});
