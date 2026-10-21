import {
  createInitialValues,
  findField,
  schemaFingerprint,
  SchemaValidationError,
  validateSchema
} from './schema.js';
import type {
  FieldValue,
  FormSchema,
  FormState,
  FormStep,
  FormValues,
  NavigationResult,
  PersistenceOptions,
  PersistenceStatus
} from './types.js';
import { validateStep } from './validation.js';
import {
  createPersistenceAdapter,
  SNAPSHOT_VERSION,
  type PersistenceAdapter
} from '../persistence/storage.js';

export interface FormEngineOptions {
  readonly schema: FormSchema;
  readonly persistence?: PersistenceOptions;
  readonly stepId?: string;
}

function cloneSchema(schema: FormSchema): FormSchema {
  return JSON.parse(JSON.stringify(schema)) as FormSchema;
}

function immutableCopy<T extends object>(value: T): Readonly<T> {
  return Object.freeze({ ...value });
}

export class FormEngine {
  readonly schema: FormSchema;
  private readonly persistence: PersistenceAdapter;
  private readonly fingerprint: string;
  private values: FormValues;
  private errors: Record<string, string> = {};
  private currentStepIndex = 0;
  private completed = false;
  private persistenceStatus: PersistenceStatus;

  constructor(options: FormEngineOptions) {
    validateSchema(options.schema);
    this.schema = cloneSchema(options.schema);
    this.fingerprint = schemaFingerprint(this.schema);
    this.persistence = createPersistenceAdapter(options.persistence);
    this.values = createInitialValues(this.schema);

    const restored = this.persistence.load(this.schema.id, this.fingerprint);
    this.persistenceStatus = restored.status;
    if (restored.snapshot !== undefined) {
      const restoredStepIndex = this.schema.steps.findIndex(
        (step) => step.id === restored.snapshot?.currentStepId
      );
      if (restoredStepIndex === -1) {
        this.persistenceStatus = 'incompatible';
      } else if (this.canRestoreValues(restored.snapshot.values)) {
        this.currentStepIndex = restoredStepIndex;
        for (const name of Object.keys(this.values)) {
          const restoredValue = restored.snapshot.values[name];
          if (restoredValue !== undefined) this.values[name] = restoredValue;
        }
      } else {
        this.persistenceStatus = 'invalid';
      }
    }

    if (options.stepId !== undefined) {
      const requestedIndex = this.schema.steps.findIndex(
        (step) => step.id === options.stepId
      );
      if (requestedIndex === -1) {
        throw new SchemaValidationError(
          `Configured stepId "${options.stepId}" does not exist.`
        );
      }
      this.currentStepIndex = requestedIndex;
    }
  }

  getCurrentStep(): FormStep {
    const step = this.schema.steps[this.currentStepIndex];
    if (step === undefined) throw new Error('Form has no current step.');
    return step;
  }

  getValues(): Readonly<FormValues> {
    return immutableCopy(this.values);
  }

  getState(): FormState {
    const currentStep = this.getCurrentStep();
    return Object.freeze({
      schemaId: this.schema.id,
      currentStepId: currentStep.id,
      currentStepIndex: this.currentStepIndex,
      stepCount: this.schema.steps.length,
      values: immutableCopy(this.values),
      errors: immutableCopy(this.errors),
      isFirstStep: this.currentStepIndex === 0,
      isLastStep: this.currentStepIndex === this.schema.steps.length - 1,
      completed: this.completed,
      persistenceStatus: this.persistenceStatus
    });
  }

  setValue(name: string, value: FieldValue): void {
    const field = findField(this.schema, name);
    if (field === undefined) throw new Error(`Unknown field "${name}".`);

    this.values = { ...this.values, [name]: value };
    if (this.errors[name] !== undefined) {
      const remainingErrors = { ...this.errors };
      delete remainingErrors[name];
      this.errors = remainingErrors;
    }
    this.completed = false;
    this.save();
  }

  next(): NavigationResult {
    this.errors = validateStep(this.getCurrentStep(), this.values);
    if (Object.keys(this.errors).length > 0) return 'blocked';

    if (this.currentStepIndex === this.schema.steps.length - 1) {
      this.completed = true;
      this.save();
      return 'completed';
    }

    this.currentStepIndex += 1;
    this.completed = false;
    this.save();
    return 'advanced';
  }

  previous(): NavigationResult {
    if (this.currentStepIndex === 0) return 'boundary';
    this.currentStepIndex -= 1;
    this.errors = {};
    this.completed = false;
    this.save();
    return 'moved-back';
  }

  private save(): void {
    this.persistenceStatus = this.persistence.save({
      version: SNAPSHOT_VERSION,
      schemaId: this.schema.id,
      schemaFingerprint: this.fingerprint,
      currentStepId: this.getCurrentStep().id,
      values: { ...this.values }
    });
  }

  private canRestoreValues(values: Readonly<FormValues>): boolean {
    for (const [name, value] of Object.entries(values)) {
      const field = findField(this.schema, name);
      if (field === undefined) continue;
      if (field.type === 'checkbox' && typeof value !== 'boolean') return false;
      if (field.type === 'number') {
        if (
          value !== '' &&
          (typeof value !== 'number' || !Number.isFinite(value))
        ) {
          return false;
        }
      } else if (field.type !== 'checkbox' && typeof value !== 'string') {
        return false;
      }
    }
    return true;
  }
}
