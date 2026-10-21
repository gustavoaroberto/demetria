# Contributing

Demetria is intentionally small: a schema-driven form engine, native DOM
renderer, and opt-in persistence layer. Please keep changes inside that scope.

Use Node.js 24 and npm. Install with `npm ci`, make focused changes, add tests,
and run `npm run check`. For packaging changes, also run `npm pack --dry-run`
and test the packed artifact from a temporary consumer project.

Accessibility and security behavior are product requirements. Prefer semantic
browser APIs, never insert schema strings as HTML, and never persist values
without explicit configuration. Update the README whenever public behavior or
types change.

Use Conventional Commit messages, for example:
`feat: implement schema-driven multi-step forms`. Releases follow Semantic
Versioning 2.0.0 and use `vX.Y.Z` Git tags.
