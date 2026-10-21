import type { FormField, FormSchema, FormStep, FormValues } from './types.js';

const SUPPORTED_FIELD_TYPES = new Set([
  'text',
  'email',
  'number',
  'select',
  'checkbox',
  'textarea'
]);
const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

export class SchemaValidationError extends Error {
  override readonly name = 'SchemaValidationError';
}

function assertNonEmptyString(
  value: unknown,
  path: string
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SchemaValidationError(`${path} must be a non-empty string.`);
  }
}

function assertIdentifier(value: string, path: string): void {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new SchemaValidationError(
      `${path} must start with a letter and contain only letters, numbers, underscores, or hyphens.`
    );
  }
}

function validateField(field: FormField, path: string): void {
  if (typeof field !== 'object' || field === null) {
    throw new SchemaValidationError(`${path} must be an object.`);
  }

  assertNonEmptyString(field.name, `${path}.name`);
  assertIdentifier(field.name, `${path}.name`);
  assertNonEmptyString(field.label, `${path}.label`);

  if (field.required !== undefined && typeof field.required !== 'boolean') {
    throw new SchemaValidationError(`${path}.required must be a boolean.`);
  }
  if (
    field.description !== undefined &&
    typeof field.description !== 'string'
  ) {
    throw new SchemaValidationError(`${path}.description must be a string.`);
  }

  if (!SUPPORTED_FIELD_TYPES.has(field.type)) {
    throw new SchemaValidationError(`${path}.type is not supported.`);
  }

  if (field.type === 'select') {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      throw new SchemaValidationError(
        `${path}.options must contain at least one option.`
      );
    }

    const optionValues = new Set<string>();
    field.options.forEach((option, optionIndex) => {
      const optionPath = `${path}.options[${optionIndex}]`;
      if (typeof option !== 'object' || option === null) {
        throw new SchemaValidationError(`${optionPath} must be an object.`);
      }
      assertNonEmptyString(option.label, `${optionPath}.label`);
      assertNonEmptyString(option.value, `${optionPath}.value`);
      if (optionValues.has(option.value)) {
        throw new SchemaValidationError(
          `${path}.options contains duplicate value "${option.value}".`
        );
      }
      optionValues.add(option.value);
    });

    if (
      field.defaultValue !== undefined &&
      !optionValues.has(field.defaultValue)
    ) {
      throw new SchemaValidationError(
        `${path}.defaultValue must match a select option.`
      );
    }
  } else if (
    (field.type === 'text' ||
      field.type === 'email' ||
      field.type === 'textarea') &&
    field.defaultValue !== undefined &&
    typeof field.defaultValue !== 'string'
  ) {
    throw new SchemaValidationError(`${path}.defaultValue must be a string.`);
  } else if (
    field.type === 'number' &&
    field.defaultValue !== undefined &&
    (typeof field.defaultValue !== 'number' ||
      !Number.isFinite(field.defaultValue))
  ) {
    throw new SchemaValidationError(
      `${path}.defaultValue must be a finite number.`
    );
  } else if (
    field.type === 'checkbox' &&
    field.defaultValue !== undefined &&
    typeof field.defaultValue !== 'boolean'
  ) {
    throw new SchemaValidationError(`${path}.defaultValue must be a boolean.`);
  }
}

export function validateSchema(schema: FormSchema): void {
  if (typeof schema !== 'object' || schema === null) {
    throw new SchemaValidationError('schema must be an object.');
  }

  assertNonEmptyString(schema.id, 'schema.id');
  assertIdentifier(schema.id, 'schema.id');
  if (!Array.isArray(schema.steps) || schema.steps.length === 0) {
    throw new SchemaValidationError(
      'schema.steps must contain at least one step.'
    );
  }

  const stepIds = new Set<string>();
  const fieldNames = new Set<string>();

  schema.steps.forEach((step: FormStep, stepIndex: number) => {
    const stepPath = `schema.steps[${stepIndex}]`;
    if (typeof step !== 'object' || step === null) {
      throw new SchemaValidationError(`${stepPath} must be an object.`);
    }
    assertNonEmptyString(step.id, `${stepPath}.id`);
    assertIdentifier(step.id, `${stepPath}.id`);
    assertNonEmptyString(step.title, `${stepPath}.title`);

    if (stepIds.has(step.id)) {
      throw new SchemaValidationError(`Duplicate step id "${step.id}".`);
    }
    stepIds.add(step.id);

    if (!Array.isArray(step.fields) || step.fields.length === 0) {
      throw new SchemaValidationError(
        `${stepPath}.fields must contain at least one field.`
      );
    }

    step.fields.forEach((field: FormField, fieldIndex: number) => {
      validateField(field, `${stepPath}.fields[${fieldIndex}]`);
      if (fieldNames.has(field.name)) {
        throw new SchemaValidationError(
          `Duplicate field name "${field.name}".`
        );
      }
      fieldNames.add(field.name);
    });
  });
}

export function createInitialValues(schema: FormSchema): FormValues {
  const values: FormValues = {};
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      } else {
        values[field.name] = field.type === 'checkbox' ? false : '';
      }
    }
  }
  return values;
}

export function findField(
  schema: FormSchema,
  name: string
): FormField | undefined {
  for (const step of schema.steps) {
    const field = step.fields.find((candidate) => candidate.name === name);
    if (field !== undefined) return field;
  }
  return undefined;
}

export function schemaFingerprint(schema: FormSchema): string {
  return JSON.stringify({
    id: schema.id,
    steps: schema.steps.map((step) => ({
      id: step.id,
      fields: step.fields.map((field) => ({
        name: field.name,
        type: field.type,
        options:
          field.type === 'select'
            ? field.options.map((option) => option.value)
            : undefined
      }))
    }))
  });
}
