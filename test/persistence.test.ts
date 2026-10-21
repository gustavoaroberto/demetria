import { beforeEach, describe, expect, it } from 'vitest';
import { FormEngine } from '../src/core/form-engine.js';
import { schema } from './fixtures.js';

describe('storage persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('does not write browser storage by default', () => {
    const engine = new FormEngine({ schema });
    engine.setValue('fullName', 'Grace');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('restores values and the current step after reinitialization', () => {
    const options = {
      schema,
      persistence: { type: 'sessionStorage', key: 'registration-test' }
    } as const;
    const first = new FormEngine(options);
    first.setValue('fullName', 'Grace Hopper');
    first.setValue('email', 'grace@example.test');
    expect(first.next()).toBe('advanced');

    const restored = new FormEngine(options);
    expect(restored.getState()).toMatchObject({
      currentStepId: 'preferences',
      persistenceStatus: 'restored'
    });
    expect(restored.getValues().fullName).toBe('Grace Hopper');
  });

  it('reports malformed JSON without applying it', () => {
    localStorage.setItem('bad', '{not json');
    const engine = new FormEngine({
      schema,
      persistence: { type: 'localStorage', key: 'bad' }
    });
    expect(engine.getState().persistenceStatus).toBe('invalid');
    expect(engine.getValues().fullName).toBe('');
  });

  it('reports incompatible snapshots without applying them', () => {
    localStorage.setItem(
      'old',
      JSON.stringify({
        version: 1,
        schemaId: 'another-form',
        schemaFingerprint: 'old',
        currentStepId: 'personal',
        values: { fullName: 'Should not restore' }
      })
    );
    const engine = new FormEngine({
      schema,
      persistence: { type: 'localStorage', key: 'old' }
    });
    expect(engine.getState().persistenceStatus).toBe('incompatible');
    expect(engine.getValues().fullName).toBe('');
  });

  it('isolates snapshots by storage key', () => {
    const first = new FormEngine({
      schema,
      persistence: { type: 'localStorage', key: 'first' }
    });
    first.setValue('fullName', 'Stored');

    const second = new FormEngine({
      schema,
      persistence: { type: 'localStorage', key: 'second' }
    });
    expect(second.getState().persistenceStatus).toBe('empty');
    expect(second.getValues().fullName).toBe('');
  });
});
