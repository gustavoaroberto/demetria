import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createForm } from '../src/index.js';
import { schema } from './fixtures.js';

describe('form integration', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    sessionStorage.clear();
  });

  it('completes a two-step form through the public API', () => {
    const onComplete = vi.fn();
    const form = createForm({ schema, target: document.body, onComplete });
    form.mount();
    form.setValue('fullName', 'Margaret Hamilton');
    form.setValue('email', 'margaret@example.test');
    expect(form.next()).toBe('advanced');
    form.setValue('newsletter', true);
    form.setValue('contactMethod', 'email');
    expect(form.next()).toBe('completed');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(form.getState().completed).toBe(true);
  });

  it('restores a separate-page flow and permits an explicit page step', () => {
    const persistence = {
      type: 'sessionStorage',
      key: 'multi-page-integration'
    } as const;
    const firstPage = createForm({
      schema,
      target: document.body,
      stepId: 'personal',
      persistence
    });
    firstPage.setValue('fullName', 'Annie Easley');
    firstPage.setValue('email', 'annie@example.test');
    expect(firstPage.next()).toBe('advanced');
    firstPage.destroy();

    const secondPage = createForm({
      schema,
      target: document.body,
      stepId: 'preferences',
      persistence
    });
    expect(secondPage.getValues().fullName).toBe('Annie Easley');
    expect(secondPage.getState().currentStepId).toBe('preferences');
    secondPage.setValue('newsletter', true);
    secondPage.setValue('contactMethod', 'phone');
    expect(secondPage.next()).toBe('completed');
  });
});
