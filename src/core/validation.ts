import type { FormField, FormStep, FormValues } from './types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export function validateFieldValue(
  field: FormField,
  value: unknown
): string | undefined {
  if (field.type === 'checkbox') {
    if (field.required === true && value !== true) {
      return `${field.label} must be checked.`;
    }
    if (typeof value !== 'boolean')
      return `${field.label} has an invalid value.`;
    return undefined;
  }

  if (field.required === true && isEmpty(value)) {
    return `${field.label} is required.`;
  }
  if (isEmpty(value)) return undefined;

  if (
    (field.type === 'text' || field.type === 'textarea') &&
    typeof value !== 'string'
  ) {
    return `${field.label} has an invalid value.`;
  }

  if (field.type === 'email') {
    if (typeof value !== 'string' || !EMAIL_PATTERN.test(value)) {
      return `${field.label} must be a valid email address.`;
    }
  }

  if (field.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return `${field.label} must be a valid number.`;
    }
  }

  if (field.type === 'select') {
    if (
      typeof value !== 'string' ||
      !field.options.some((option) => option.value === value)
    ) {
      return `${field.label} has an invalid selection.`;
    }
  }

  return undefined;
}

export function validateStep(
  step: FormStep,
  values: Readonly<FormValues>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const error = validateFieldValue(field, values[field.name]);
    if (error !== undefined) errors[field.name] = error;
  }
  return errors;
}
