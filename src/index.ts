import { FormEngine } from './core/form-engine.js';
import type {
  CreateFormOptions,
  DemetriaForm,
  FieldValue,
  NavigationResult
} from './core/types.js';
import { DomRenderer } from './renderer/dom-renderer.js';

export { SchemaValidationError } from './core/schema.js';
export type {
  CheckboxField,
  CreateFormOptions,
  DemetriaForm,
  FieldValue,
  FormField,
  FormSchema,
  FormState,
  FormStep,
  FormValues,
  NavigationResult,
  NumberField,
  PersistenceOptions,
  PersistenceStatus,
  SelectField,
  SelectOption,
  TextField
} from './core/types.js';

export function createForm(options: CreateFormOptions): DemetriaForm {
  const engineOptions = {
    schema: options.schema,
    ...(options.persistence === undefined
      ? {}
      : { persistence: options.persistence }),
    ...(options.stepId === undefined ? {} : { stepId: options.stepId })
  };
  const engine = new FormEngine(engineOptions);

  const renderer = new DomRenderer(engine, options.target, {
    setValue: (name, value) => engine.setValue(name, value),
    next: performNext,
    previous: performPrevious
  });

  const notifyTransition = (result: NavigationResult): void => {
    if (result !== 'completed') renderer.render();
    if (result === 'completed') options.onComplete?.(engine.getValues());
    if (result === 'advanced' || result === 'moved-back') {
      renderer.focusStepHeading();
      options.onStepChange?.(engine.getState());
    }
  };

  function performNext(): NavigationResult {
    const result = engine.next();
    notifyTransition(result);
    return result;
  }

  function performPrevious(): NavigationResult {
    const result = engine.previous();
    notifyTransition(result);
    return result;
  }

  const form: DemetriaForm = {
    mount(): void {
      renderer.mount();
    },
    destroy(): void {
      renderer.destroy();
    },
    getValues() {
      return engine.getValues();
    },
    getState() {
      return engine.getState();
    },
    setValue(name: string, value: FieldValue): void {
      engine.setValue(name, value);
      renderer.render();
    },
    next: performNext,
    previous: performPrevious
  };
  return form;
}
