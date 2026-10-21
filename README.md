# Demetria

**Schema-driven forms for any JavaScript application.**

Demetria is a small, framework-agnostic TypeScript library that renders and
manages multi-step native HTML forms from JSON-compatible schemas. It has zero
runtime dependencies and works with vanilla JavaScript, TypeScript, modern
frameworks, and traditional server-rendered applications.

The project was inspired by a server-rendered Java application where a long
form crossed multiple HTML pages and needed predictable validation and state
continuity. Demetria keeps that coordination in the browser without requiring a
frontend framework or client-side router.

Version 0.1.0 is the first functional release. Previously published 0.0.x
versions do not provide this API and should not be used.

## Features

- JSON-compatible schemas with six native field types.
- Accessible single-page step navigation and built-in validation.
- Optional, versioned `sessionStorage` or `localStorage` persistence.
- Explicit step selection for separate HTML-page flows.
- Immutable state/value snapshots and TypeScript declarations.
- Modern ESM output with zero runtime dependencies.

## Supported environments

Demetria produces modern ESM and uses native DOM and Web Storage APIs. Use it
through a standard ESM-aware bundler or serve the built module and application
from the same HTTP origin. The development and CI version is Node.js 24.

No compatibility claim is made for older browsers. Accessibility follows
WCAG 2.2 AA as a design target, but this release has not received a formal
accessibility audit and does not claim conformance.

## Installation

Install the published package:

```sh
npm install demetria
```

Confirm that npm resolves version 0.1.0 or newer. Older 0.0.x artifacts are not
functional releases.

## Quick start

```html
<div id="demetria-form"></div>
<script type="module" src="./app.js"></script>
```

```js
import { createForm } from 'demetria';

const schema = {
  id: 'registration',
  steps: [
    {
      id: 'personal',
      title: 'Personal information',
      fields: [
        { name: 'fullName', type: 'text', label: 'Full name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          name: 'newsletter',
          type: 'checkbox',
          label: 'Receive updates'
        },
        {
          name: 'contactMethod',
          type: 'select',
          label: 'Preferred contact method',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' }
          ]
        }
      ]
    }
  ]
};

const form = createForm({
  schema,
  target: '#demetria-form',
  onComplete(values) {
    console.log(values);
  }
});

form.mount();
```

`createForm` returns `mount`, `destroy`, `getValues`, `getState`, `setValue`,
`next`, and `previous`. The generated Next, Previous, and Complete controls use
the same navigation operations.

## Schema and values

Schemas contain a non-empty `id` and one or more steps. Step IDs and field names
must be unique. Identifiers start with a letter and contain only letters,
numbers, underscores, or hyphens. A field name identifies its value throughout
the entire form.
Schemas must contain data only: callbacks belong in `createForm` options, never
inside the schema.

| Type       | Default | Stored value           | Built-in validation             |
| ---------- | ------- | ---------------------- | ------------------------------- |
| `text`     | `""`    | string                 | required/non-empty              |
| `email`    | `""`    | string                 | required and basic email format |
| `number`   | `""`    | number or empty string | finite number                   |
| `select`   | `""`    | selected option string | required and known option       |
| `checkbox` | `false` | boolean                | required means checked          |
| `textarea` | `""`    | string                 | required/non-empty              |

`defaultValue` must match the field's stored value type. Select fields require a
non-empty `options` array of `{ label, value }` objects. Invalid schemas throw a
`SchemaValidationError` during `createForm`.

Forward navigation validates the active step and remains on it when invalid.
Backward navigation is never validation-blocked. Errors are rendered beside
their fields, announced using live/alert semantics, and the first invalid
control receives focus.

Custom and asynchronous validation, conditional fields, nested value paths,
and custom field plugins are not implemented in 0.1.0.

## Persistence and separate pages

State exists only in memory unless storage is explicitly enabled:

```js
const form = createForm({
  schema,
  target: '#demetria-form',
  persistence: {
    type: 'sessionStorage',
    key: 'registration-flow'
  },
  stepId: 'preferences'
});
```

Supported persistence types are `sessionStorage` and `localStorage`. Snapshots
contain a format version, schema identity/fingerprint, current step, and field
values. Malformed or incompatible snapshots are ignored and reported through
`getState().persistenceStatus`; they are not silently restored.

`stepId` explicitly selects which schema step a page renders while retaining
restored values. It is intended for separate server-rendered-style documents,
not routing. The multi-page example uses ordinary page navigation and the same
schema and persistence key on both pages.

Web Storage is scoped to a browser origin. `sessionStorage` lifetime and tab
behavior vary by browser. Neither storage type works across origins, and this
library does not make data survive server-side sessions or redirects.

Do not store passwords, financial details, health information, or other
sensitive personal data in Web Storage. Demetria deliberately does not persist
anything by default.

## HTML, accessibility, and styling

The renderer creates native `form`, `fieldset`, `legend`, `label`, input,
select, textarea, and button elements without using schema content as HTML.
Controls remain keyboard-operable through native browser behavior. Step progress
is exposed through a labeled navigation region and `aria-current="step"`.
Required fields include a visible “(required)” label suffix. Failed validation
focuses the first invalid field; successful step changes focus the new step
heading.

Demetria ships no CSS. Stable hooks include:

- `.demetria`, `.demetria__form`, `.demetria__step`, `.demetria__field`
- `.demetria__label`, `.demetria__control`, `.demetria__field-error`
- `.demetria__controls`, `.demetria__button--previous`,
  `.demetria__button--next`
- `data-demetria-form`, `data-demetria-step`, `data-demetria-field`, and
  `data-demetria-action`

## Examples

Build the library, serve the repository root over HTTP, then open:

- [Single-page example](https://github.com/gustavoaroberto/demetria/tree/main/examples/single-page)
- [Multi-page example](https://github.com/gustavoaroberto/demetria/tree/main/examples/multi-page)

For example:

```sh
npm run build
python3 -m http.server 8000
```

The demos use fictional, non-sensitive information. A direct `file://` URL is
not a supported ESM serving setup.

## Local development

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm pack --dry-run
npm run release:check
```

The runtime has no dependencies. Development uses TypeScript, Vitest, jsdom,
ESLint with Flat Config, typescript-eslint, and Prettier. TypeScript 6.0.3 is
currently pinned because stable typescript-eslint does not yet declare support
for TypeScript 7; upgrading is tracked in the documentation roadmap.

See the
[contribution guide](https://github.com/gustavoaroberto/demetria/blob/main/CONTRIBUTING.md),
[documentation roadmap](https://github.com/gustavoaroberto/demetria/blob/main/docs/README.md),
and
[maintainer release guide](https://github.com/gustavoaroberto/demetria/blob/main/docs/RELEASING.md).

## License

The repository is prepared for MIT licensing. The owner must explicitly confirm
that choice before this version is published.
