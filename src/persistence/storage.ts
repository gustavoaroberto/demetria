import type {
  FormValues,
  PersistenceOptions,
  PersistenceStatus
} from '../core/types.js';

export const SNAPSHOT_VERSION = 1;

export interface FormSnapshot {
  readonly version: typeof SNAPSHOT_VERSION;
  readonly schemaId: string;
  readonly schemaFingerprint: string;
  readonly currentStepId: string;
  readonly values: FormValues;
}

export interface RestoreResult {
  readonly status: PersistenceStatus;
  readonly snapshot?: FormSnapshot;
}

export interface PersistenceAdapter {
  load(schemaId: string, fingerprint: string): RestoreResult;
  save(snapshot: FormSnapshot): PersistenceStatus;
}

class MemoryAdapter implements PersistenceAdapter {
  load(): RestoreResult {
    return { status: 'memory' };
  }

  save(): PersistenceStatus {
    return 'memory';
  }
}

class BrowserStorageAdapter implements PersistenceAdapter {
  constructor(
    private readonly storage: Storage | undefined,
    private readonly key: string
  ) {}

  load(schemaId: string, fingerprint: string): RestoreResult {
    if (this.storage === undefined) return { status: 'unavailable' };

    let serialized: string | null;
    try {
      serialized = this.storage.getItem(this.key);
    } catch {
      return { status: 'unavailable' };
    }
    if (serialized === null) return { status: 'empty' };

    let value: unknown;
    try {
      value = JSON.parse(serialized) as unknown;
    } catch {
      return { status: 'invalid' };
    }

    if (!isSnapshot(value)) return { status: 'invalid' };
    if (
      value.version !== SNAPSHOT_VERSION ||
      value.schemaId !== schemaId ||
      value.schemaFingerprint !== fingerprint
    ) {
      return { status: 'incompatible' };
    }
    return { status: 'restored', snapshot: value };
  }

  save(snapshot: FormSnapshot): PersistenceStatus {
    if (this.storage === undefined) return 'unavailable';
    try {
      this.storage.setItem(this.key, JSON.stringify(snapshot));
      return 'saved';
    } catch {
      return 'unavailable';
    }
  }
}

function isSnapshot(value: unknown): value is FormSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<FormSnapshot>;
  return (
    candidate.version === SNAPSHOT_VERSION &&
    typeof candidate.schemaId === 'string' &&
    typeof candidate.schemaFingerprint === 'string' &&
    typeof candidate.currentStepId === 'string' &&
    typeof candidate.values === 'object' &&
    candidate.values !== null &&
    !Array.isArray(candidate.values) &&
    Object.values(candidate.values).every(
      (entry) =>
        typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean'
    )
  );
}

function getBrowserStorage(
  type: PersistenceOptions['type']
): Storage | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    return type === 'localStorage'
      ? window.localStorage
      : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function createPersistenceAdapter(
  options?: PersistenceOptions
): PersistenceAdapter {
  if (options === undefined) return new MemoryAdapter();
  if (options.key.trim() === '') {
    throw new Error('persistence.key must be a non-empty string.');
  }
  return new BrowserStorageAdapter(
    getBrowserStorage(options.type),
    options.key
  );
}
