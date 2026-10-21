import { describe, expect, it } from 'vitest';
import { SchemaValidationError } from '../src/index.js';
import { validateSchema } from '../src/core/schema.js';
import type { FormSchema } from '../src/core/types.js';
import { schema } from './fixtures.js';

function invalidSchema(value: unknown): FormSchema {
  return value as FormSchema;
}

describe('schema validation', () => {
  it('accepts a valid JSON-compatible schema', () => {
    expect(() => validateSchema(schema)).not.toThrow();
    expect(() => JSON.stringify(schema)).not.toThrow();
  });

  it('rejects a schema without steps', () => {
    expect(() =>
      validateSchema(invalidSchema({ id: 'empty', steps: [] }))
    ).toThrow(SchemaValidationError);
  });

  it('rejects duplicate step ids', () => {
    const duplicate = {
      id: 'duplicate',
      steps: [schema.steps[0], { ...schema.steps[1], id: 'personal' }]
    };
    expect(() => validateSchema(invalidSchema(duplicate))).toThrow(
      'Duplicate step id "personal".'
    );
  });

  it('rejects duplicate field names across steps', () => {
    const duplicate = {
      id: 'duplicate-fields',
      steps: [
        schema.steps[0],
        {
          ...schema.steps[1],
          fields: [{ name: 'fullName', label: 'Again', type: 'text' }]
        }
      ]
    };
    expect(() => validateSchema(invalidSchema(duplicate))).toThrow(
      'Duplicate field name "fullName".'
    );
  });

  it('rejects unsupported field types', () => {
    const unsupported = {
      id: 'unsupported',
      steps: [
        {
          id: 'one',
          title: 'One',
          fields: [{ name: 'date', label: 'Date', type: 'date' }]
        }
      ]
    };
    expect(() => validateSchema(invalidSchema(unsupported))).toThrow(
      'schema.steps[0].fields[0].type is not supported.'
    );
  });

  it('rejects unsafe identifiers', () => {
    const unsafe = {
      id: 'unsafe',
      steps: [
        {
          id: 'one',
          title: 'One',
          fields: [{ name: '__proto__', label: 'Unsafe', type: 'text' }]
        }
      ]
    };
    expect(() => validateSchema(invalidSchema(unsafe))).toThrow(
      'must start with a letter'
    );
  });

  it('rejects empty, duplicate, and invalid select options', () => {
    const selectSchema = (options: unknown, defaultValue?: string) => ({
      id: 'select',
      steps: [
        {
          id: 'one',
          title: 'One',
          fields: [
            {
              name: 'choice',
              label: 'Choice',
              type: 'select',
              options,
              ...(defaultValue === undefined ? {} : { defaultValue })
            }
          ]
        }
      ]
    });

    expect(() => validateSchema(invalidSchema(selectSchema([])))).toThrow(
      'must contain at least one option'
    );
    expect(() =>
      validateSchema(
        invalidSchema(
          selectSchema([
            { label: 'One', value: 'same' },
            { label: 'Two', value: 'same' }
          ])
        )
      )
    ).toThrow('duplicate value "same"');
    expect(() =>
      validateSchema(
        invalidSchema(selectSchema([{ label: 'One', value: 'one' }], 'missing'))
      )
    ).toThrow('defaultValue must match');
  });
});
