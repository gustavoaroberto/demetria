# Demetria contributor instructions

Demetria is a small, framework-agnostic engine for schema-driven multi-step
forms. Preserve that narrow purpose; it is not a comprehensive form framework.

## Architecture

- `src/core` owns JSON-compatible schema validation, values, validation, and
  deterministic step transitions. It must not use DOM globals.
- `src/renderer` owns native HTML creation, DOM events, focus, and cleanup. Do
  not use `innerHTML` for schema content.
- `src/persistence` owns versioned Web Storage snapshots. Storage is opt-in.
- `src/index.ts` is the public package boundary. Do not export internal classes
  or add public API without tests and README updates.
- `website` is the static documentation source and owns the Demetria brand
  assets. `examples/shared` owns example presentation only; core rendering
  remains unstyled. `site-dist` is generated.

## Engineering rules

- Keep zero runtime dependencies. Justify every new development dependency.
- Keep schemas JSON-serializable; never evaluate schema strings or add callbacks
  to schema types.
- A field is required only when `required === true`. Missing and `false` are
  equivalent. Empty optional fields pass; non-empty optional values still use
  type validation. In the current API, whitespace-only strings are not empty.
- Preserve strict TypeScript, modern ESM, and framework independence.
- Use semantic native controls, associated labels/descriptions, announced
  errors, predictable focus, and keyboard-operable navigation. Treat WCAG 2.2
  AA as a target, not an unverified compliance claim.
- Never enable persistence by default or recommend Web Storage for sensitive
  data. Reject or visibly report malformed/incompatible snapshots.
- Add behavior-focused tests for schema, core transitions, rendering,
  persistence, accessibility, and public integration changes.
- Keep examples and README code synchronized with the exported API.
- Keep website links relative so the artifact works below `/demetria/`. Do not
  add a documentation framework or claim a deployment before it is verified.
- Do not publish, deploy, commit, push, or tag unless the owner explicitly asks.

## Required checks

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
`npm run docs:check`, `npm run test:a11y`, and `npm pack --dry-run`. The browser
suite uses an installed stable Chrome. Verify a clean external ESM import for
package changes.
Before a release, run `npm run release:check` and follow `docs/RELEASING.md`.
