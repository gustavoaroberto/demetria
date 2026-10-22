import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createForm } from '../src/index.js';
import { schema } from './fixtures.js';

function getInput(name: string): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (input === null) throw new Error(`Missing input ${name}`);
  return input;
}

function enterText(name: string, value: string): void {
  const input = getInput(name);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('native DOM renderer', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    const target = document.createElement('div');
    target.id = 'form';
    document.body.append(target);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('creates semantic native fields, labels, progress, and styling hooks', () => {
    const form = createForm({ schema, target: '#form' });
    form.mount();

    expect(document.querySelector('form')).not.toBeNull();
    expect(document.querySelector('fieldset')).not.toBeNull();
    expect(document.querySelector('legend')?.textContent).toBe(
      'Personal information'
    );
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Form progress'
    );
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe(
      'Personal information'
    );

    const fullName = getInput('fullName');
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${fullName.id}"]`
    );
    expect(label?.textContent).toBe('Full name (required)');
    expect(fullName.required).toBe(true);
    expect(fullName.getAttribute('aria-describedby')).toContain('description');
    expect(
      document.querySelector('[data-demetria-form="registration"]')
    ).not.toBeNull();
  });

  it('updates string and number values from input events', () => {
    const form = createForm({ schema, target: '#form' });
    form.mount();
    enterText('fullName', 'Katherine Johnson');
    enterText('email', 'katherine@example.test');
    const age = getInput('age');
    age.value = '42';
    age.dispatchEvent(new Event('input', { bubbles: true }));

    expect(form.getValues()).toMatchObject({
      fullName: 'Katherine Johnson',
      email: 'katherine@example.test',
      age: 42
    });
  });

  it('announces validation errors and focuses the first invalid field', () => {
    const form = createForm({ schema, target: '#form' });
    form.mount();
    const htmlForm = document.querySelector<HTMLFormElement>('form');
    htmlForm?.requestSubmit();

    const invalid = getInput('fullName');
    expect(invalid.getAttribute('aria-invalid')).toBe('true');
    expect(invalid.getAttribute('aria-describedby')).toContain('error');
    expect(document.activeElement).toBe(invalid);
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      'Please correct'
    );
  });

  it('uses native keyboard-operable navigation controls', () => {
    const form = createForm({ schema, target: '#form' });
    form.mount();
    enterText('fullName', 'Dorothy Vaughan');
    enterText('email', 'dorothy@example.test');

    const next = document.querySelector<HTMLButtonElement>(
      'button[data-demetria-action="next"]'
    );
    const htmlForm = document.querySelector<HTMLFormElement>('form');
    expect(next?.type).toBe('submit');
    next?.focus();
    expect(document.activeElement).toBe(next);
    next?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    htmlForm?.requestSubmit(next ?? undefined);

    expect(form.getState().currentStepId).toBe('preferences');
    expect(document.activeElement?.textContent).toBe('Preferences');
    const previous = document.querySelector<HTMLButtonElement>(
      'button[data-demetria-action="previous"]'
    );
    expect(previous?.type).toBe('button');
    previous?.click();
    expect(form.getState().currentStepId).toBe('personal');
    expect(document.activeElement?.textContent).toBe('Personal information');
  });

  it('removes delegated listeners and generated markup on destroy', () => {
    const form = createForm({ schema, target: '#form' });
    form.mount();
    const input = getInput('fullName');
    form.destroy();
    input.value = 'Detached update';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(document.querySelector('.demetria')).toBeNull();
    expect(form.getValues().fullName).toBe('');
  });

  it('invokes completion with a detached value snapshot', () => {
    const onComplete = vi.fn();
    const form = createForm({ schema, target: '#form', onComplete });
    form.setValue('fullName', 'Mary Jackson');
    form.setValue('email', 'mary@example.test');
    expect(form.next()).toBe('advanced');
    form.setValue('newsletter', true);
    form.setValue('contactMethod', 'email');
    expect(form.next()).toBe('completed');
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Mary Jackson', newsletter: true })
    );
  });

  it('preserves focus on the submit button after completion', () => {
    const onComplete = vi.fn();
    const form = createForm({ schema, target: '#form', onComplete });
    form.mount();
    form.setValue('fullName', 'Annie Easley');
    form.setValue('email', 'annie@example.test');
    form.next();
    form.setValue('newsletter', true);
    form.setValue('contactMethod', 'email');

    const complete = document.querySelector<HTMLButtonElement>(
      'button[data-demetria-action="complete"]'
    );
    complete?.focus();
    document.querySelector<HTMLFormElement>('form')?.requestSubmit(complete);

    expect(onComplete).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(complete);
  });
});
