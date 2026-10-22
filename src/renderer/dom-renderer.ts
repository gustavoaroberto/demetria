import type { FormEngine } from '../core/form-engine.js';
import type { FormField, NavigationResult } from '../core/types.js';

interface RendererActions {
  readonly setValue: (name: string, value: string | number | boolean) => void;
  readonly next: () => NavigationResult;
  readonly previous: () => NavigationResult;
}

let rendererInstance = 0;

function appendTextElement(
  document: Document,
  parent: Element,
  tagName: string,
  text: string,
  className: string
): HTMLElement {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

export class DomRenderer {
  private readonly instanceId = ++rendererInstance;
  private root: HTMLDivElement | undefined;

  constructor(
    private readonly engine: FormEngine,
    private readonly target: string | HTMLElement,
    private readonly actions: RendererActions
  ) {}

  mount(): void {
    if (this.root !== undefined) return;
    const target = this.resolveTarget();
    const root = target.ownerDocument.createElement('div');
    root.className = 'demetria';
    root.dataset.demetriaForm = this.engine.schema.id;
    root.addEventListener('input', this.handleInput);
    root.addEventListener('submit', this.handleSubmit);
    root.addEventListener('click', this.handleClick);
    target.append(root);
    this.root = root;
    this.render();
  }

  render(): void {
    if (this.root === undefined) return;
    const document = this.root.ownerDocument;
    const state = this.engine.getState();
    const step = this.engine.getCurrentStep();
    const form = document.createElement('form');
    form.className = 'demetria__form';
    form.dataset.demetriaStep = step.id;
    form.noValidate = true;

    form.append(this.createStepNavigation(document));

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'demetria__step';
    const legend = appendTextElement(
      document,
      fieldset,
      'legend',
      step.title,
      'demetria__step-title'
    );
    legend.id = this.elementId(`step-${step.id}`);
    legend.tabIndex = -1;
    form.setAttribute('aria-labelledby', legend.id);

    if (step.description !== undefined) {
      appendTextElement(
        document,
        fieldset,
        'p',
        step.description,
        'demetria__step-description'
      );
    }

    if (Object.keys(state.errors).length > 0) {
      const summary = appendTextElement(
        document,
        fieldset,
        'p',
        'Please correct the highlighted fields before continuing.',
        'demetria__error-summary'
      );
      summary.setAttribute('role', 'alert');
    }

    for (const field of step.fields) {
      fieldset.append(this.createField(document, field));
    }

    fieldset.append(this.createControls(document));
    form.append(fieldset);
    this.root.replaceChildren(form);
  }

  focusFirstError(): void {
    this.root?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }

  focusStepHeading(): void {
    this.root?.querySelector<HTMLElement>('.demetria__step-title')?.focus();
  }

  destroy(): void {
    if (this.root === undefined) return;
    this.root.removeEventListener('input', this.handleInput);
    this.root.removeEventListener('submit', this.handleSubmit);
    this.root.removeEventListener('click', this.handleClick);
    this.root.remove();
    this.root = undefined;
  }

  private resolveTarget(): HTMLElement {
    if (typeof this.target !== 'string') return this.target;
    if (typeof document === 'undefined') {
      throw new Error('A DOM document is required to mount Demetria.');
    }
    const target = document.querySelector<HTMLElement>(this.target);
    if (target === null) {
      throw new Error(`Demetria target "${this.target}" was not found.`);
    }
    return target;
  }

  private createStepNavigation(document: Document): HTMLElement {
    const navigation = document.createElement('nav');
    navigation.className = 'demetria__steps';
    navigation.setAttribute('aria-label', 'Form progress');
    const list = document.createElement('ol');

    this.engine.schema.steps.forEach((step, index) => {
      const item = document.createElement('li');
      item.className = 'demetria__step-indicator';
      item.dataset.demetriaStepIndicator = step.id;
      item.textContent = step.title;
      if (index === this.engine.getState().currentStepIndex) {
        item.setAttribute('aria-current', 'step');
      }
      list.append(item);
    });

    navigation.append(list);
    return navigation;
  }

  private createField(document: Document, field: FormField): HTMLElement {
    const state = this.engine.getState();
    const wrapper = document.createElement('div');
    wrapper.className = 'demetria__field';
    wrapper.dataset.demetriaField = field.name;
    const inputId = this.elementId(`field-${field.name}`);
    const descriptionId = this.elementId(`description-${field.name}`);
    const errorId = this.elementId(`error-${field.name}`);
    const input = this.createControl(document, field, inputId);
    const label = document.createElement('label');
    label.className = 'demetria__label';
    label.htmlFor = inputId;
    label.textContent =
      field.required === true ? `${field.label} (required)` : field.label;

    if (field.type === 'checkbox') {
      wrapper.append(input, label);
    } else {
      wrapper.append(label, input);
    }

    const describedBy: string[] = [];
    if (field.description !== undefined) {
      const description = appendTextElement(
        document,
        wrapper,
        'p',
        field.description,
        'demetria__field-description'
      );
      description.id = descriptionId;
      describedBy.push(descriptionId);
    }

    const error = state.errors[field.name];
    if (error !== undefined) {
      input.setAttribute('aria-invalid', 'true');
      const errorElement = appendTextElement(
        document,
        wrapper,
        'p',
        error,
        'demetria__field-error'
      );
      errorElement.id = errorId;
      describedBy.push(errorId);
    }
    if (describedBy.length > 0) {
      input.setAttribute('aria-describedby', describedBy.join(' '));
    }

    return wrapper;
  }

  private createControl(
    document: Document,
    field: FormField,
    id: string
  ): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    const value = this.engine.getValues()[field.name];
    let control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    if (field.type === 'select') {
      const select = document.createElement('select');
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = 'Select an option';
      select.append(emptyOption);
      for (const option of field.options) {
        const element = document.createElement('option');
        element.value = option.value;
        element.textContent = option.label;
        select.append(element);
      }
      select.value = typeof value === 'string' ? value : '';
      control = select;
    } else if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.value = typeof value === 'string' ? value : '';
      control = textarea;
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      if (field.type === 'checkbox') {
        input.checked = value === true;
      } else {
        input.value = value === '' ? '' : String(value);
      }
      control = input;
    }

    control.id = id;
    control.name = field.name;
    control.className = 'demetria__control';
    control.dataset.demetriaInput = field.name;
    if (field.required === true) control.required = true;
    return control;
  }

  private createControls(document: Document): HTMLElement {
    const state = this.engine.getState();
    const controls = document.createElement('div');
    controls.className = 'demetria__controls';

    if (!state.isFirstStep) {
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.className = 'demetria__button demetria__button--previous';
      previous.dataset.demetriaAction = 'previous';
      previous.textContent = 'Previous';
      controls.append(previous);
    }

    const next = document.createElement('button');
    next.type = 'submit';
    next.className = 'demetria__button demetria__button--next';
    next.dataset.demetriaAction = state.isLastStep ? 'complete' : 'next';
    next.textContent = state.isLastStep ? 'Complete' : 'Next';
    controls.append(next);
    return controls;
  }

  private readonly handleInput = (event: Event): void => {
    const element = event.target;
    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLSelectElement) &&
      !(element instanceof HTMLTextAreaElement)
    ) {
      return;
    }
    const name = element.dataset.demetriaInput;
    if (name === undefined) return;

    let value: string | number | boolean = element.value;
    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      value = element.checked;
    } else if (
      element instanceof HTMLInputElement &&
      element.type === 'number'
    ) {
      value = element.value === '' ? '' : element.valueAsNumber;
    }
    this.actions.setValue(name, value);
  };

  private readonly handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    const result = this.actions.next();
    if (result === 'blocked') this.focusFirstError();
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const element = event.target;
    if (!(element instanceof Element)) return;
    const button = element.closest<HTMLButtonElement>(
      'button[data-demetria-action="previous"]'
    );
    if (button !== null) this.actions.previous();
  };

  private elementId(suffix: string): string {
    const safeSuffix = suffix.replace(/[^a-zA-Z0-9_-]/g, '-');
    return `demetria-${this.instanceId}-${safeSuffix}`;
  }
}
