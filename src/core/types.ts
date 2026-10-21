export type FieldValue = string | number | boolean;

export type FormValues = Record<string, FieldValue>;

interface BaseField {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
}

export interface TextField extends BaseField {
  readonly type: 'text' | 'email' | 'textarea';
  readonly defaultValue?: string;
}

export interface NumberField extends BaseField {
  readonly type: 'number';
  readonly defaultValue?: number;
}

export interface CheckboxField extends BaseField {
  readonly type: 'checkbox';
  readonly defaultValue?: boolean;
}

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

export interface SelectField extends BaseField {
  readonly type: 'select';
  readonly options: readonly SelectOption[];
  readonly defaultValue?: string;
}

export type FormField = TextField | NumberField | CheckboxField | SelectField;

export interface FormStep {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fields: readonly FormField[];
}

export interface FormSchema {
  readonly id: string;
  readonly steps: readonly FormStep[];
}

export type PersistenceType = 'sessionStorage' | 'localStorage';

export interface PersistenceOptions {
  readonly type: PersistenceType;
  readonly key: string;
}

export type PersistenceStatus =
  | 'memory'
  | 'empty'
  | 'saved'
  | 'restored'
  | 'invalid'
  | 'incompatible'
  | 'unavailable';

export type NavigationResult =
  'advanced' | 'moved-back' | 'blocked' | 'completed' | 'boundary';

export interface FormState {
  readonly schemaId: string;
  readonly currentStepId: string;
  readonly currentStepIndex: number;
  readonly stepCount: number;
  readonly values: Readonly<FormValues>;
  readonly errors: Readonly<Record<string, string>>;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
  readonly completed: boolean;
  readonly persistenceStatus: PersistenceStatus;
}

export interface CreateFormOptions {
  readonly schema: FormSchema;
  readonly target: string | HTMLElement;
  readonly persistence?: PersistenceOptions;
  readonly stepId?: string;
  readonly onComplete?: (values: Readonly<FormValues>) => void;
  readonly onStepChange?: (state: FormState) => void;
}

export interface DemetriaForm {
  mount(): void;
  destroy(): void;
  getValues(): Readonly<FormValues>;
  getState(): FormState;
  setValue(name: string, value: FieldValue): void;
  next(): NavigationResult;
  previous(): NavigationResult;
}
