import { beforeEach, describe, expect, it } from 'vitest';
import { FormEngine } from '../src/core/form-engine.js';
import { schema } from './fixtures.js';

describe('FormEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('initializes values, step state, and memory-only persistence', () => {
    const engine = new FormEngine({ schema });
    expect(engine.getState()).toMatchObject({
      currentStepId: 'personal',
      currentStepIndex: 0,
      isFirstStep: true,
      isLastStep: false,
      completed: false,
      persistenceStatus: 'memory'
    });
    expect(engine.getValues()).toEqual({
      fullName: '',
      email: '',
      age: '',
      notes: '',
      newsletter: false,
      contactMethod: ''
    });
  });

  it('updates values without leaking mutable state', () => {
    const engine = new FormEngine({ schema });
    engine.setValue('fullName', 'Ada Lovelace');
    const values = engine.getValues();
    expect(values.fullName).toBe('Ada Lovelace');
    expect(Object.isFrozen(values)).toBe(true);
    expect(() => engine.setValue('unknown', 'value')).toThrow(
      'Unknown field "unknown".'
    );
  });

  it('blocks invalid forward transitions but permits backward navigation', () => {
    const engine = new FormEngine({ schema });
    expect(engine.next()).toBe('blocked');
    expect(engine.getState().currentStepId).toBe('personal');
    expect(engine.getState().errors.fullName).toBe('Full name is required.');

    engine.setValue('fullName', 'Ada');
    engine.setValue('email', 'not-an-email');
    engine.setValue('age', 'invalid');
    expect(engine.next()).toBe('blocked');
    expect(engine.getState().errors).toMatchObject({
      email: 'Email must be a valid email address.',
      age: 'Age must be a valid number.'
    });

    engine.setValue('email', 'ada@example.test');
    engine.setValue('age', 36);
    expect(engine.next()).toBe('advanced');
    expect(engine.previous()).toBe('moved-back');
    expect(engine.previous()).toBe('boundary');
  });

  it('retains values, validates the last step, and completes once valid', () => {
    const engine = new FormEngine({ schema });
    engine.setValue('fullName', 'Ada');
    engine.setValue('email', 'ada@example.test');
    expect(engine.next()).toBe('advanced');
    expect(engine.next()).toBe('blocked');
    expect(engine.getState().errors).toEqual({
      newsletter: 'Receive updates must be checked.',
      contactMethod: 'Preferred contact method is required.'
    });
    engine.setValue('newsletter', true);
    engine.setValue('contactMethod', 'email');
    expect(engine.next()).toBe('completed');
    expect(engine.getState().completed).toBe(true);
    expect(engine.getValues().fullName).toBe('Ada');
  });

  it('honors an explicit page step and rejects an unknown one', () => {
    const engine = new FormEngine({ schema, stepId: 'preferences' });
    expect(engine.getState().currentStepId).toBe('preferences');
    expect(() => new FormEngine({ schema, stepId: 'missing' })).toThrow(
      'Configured stepId "missing" does not exist.'
    );
  });
});
