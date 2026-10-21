# Persistence guide

Demetria keeps values in instance memory by default. `sessionStorage` and
`localStorage` are enabled only through an explicit persistence option and
store a versioned schema-bound snapshot. Invalid or incompatible snapshots are
ignored and surfaced through `persistenceStatus`.

Web Storage is origin-scoped and readable by scripts on that origin. Do not use
it for secrets or sensitive personal data. `stepId` can select the step rendered
by a separate HTML page while the same persistence key restores earlier values.
Demetria does not implement routing, server sessions, encryption, or cross-origin
continuity.
