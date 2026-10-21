# Demetria contributor instructions

## Architecture

- `src/core` owns JSON-compatible schema validation, values, validation, and
  deterministic step transitions. It must not use DOM globals.
- `src/renderer` owns native HTML creation, DOM events, focus, and cleanup. Do
  not use `innerHTML` for schema content.
- `src/persistence` owns versioned Web Storage snapshots. Storage is opt-in.
- `src/index.ts` is the public package boundary. Do not export internal classes
  or add public API without tests and README updates.

## Engineering rules

- Keep zero runtime dependencies. Justify every new development dependency.
- Keep schemas JSON-serializable; never evaluate schema strings or add callbacks
  to schema types.
- Preserve strict TypeScript, modern ESM, and framework independence.
- Use semantic native controls, associated labels/descriptions, announced
  errors, predictable focus, and keyboard-operable navigation. Treat WCAG 2.2
  AA as a target, not an unverified compliance claim.
- Never enable persistence by default or recommend Web Storage for sensitive
  data. Reject or visibly report malformed/incompatible snapshots.
- Add behavior-focused tests for schema, core transitions, rendering,
  persistence, accessibility, and public integration changes.
- Keep examples and README code synchronized with the exported API.

## Required checks

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and
`npm pack --dry-run`. Verify a clean external ESM import for package changes.
Before a release, run `npm run release:check` and follow `docs/RELEASING.md`.
