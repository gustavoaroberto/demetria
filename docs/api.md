# API reference

The package exports `createForm(options)`, `SchemaValidationError`, and public
TypeScript types. `createForm` returns:

- `mount()` and `destroy()` for renderer lifecycle.
- `getValues()` and `getState()` for immutable snapshots.
- `setValue(name, value)` for controlled integration.
- `next()` and `previous()` for explicit navigation.

Navigation returns `advanced`, `moved-back`, `blocked`, `completed`, or
`boundary`. See the generated `dist/index.d.ts` after a build for the exact
type declarations. Internal engine and renderer classes are not public API.
