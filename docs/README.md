# Documentation roadmap

The `docs` directory is the planned GitHub Pages source. It intentionally uses
plain Markdown and no documentation framework during the 0.1.0 milestone.

Current sections:

- [API reference](./api.md)
- [Schema guide](./schema.md)
- [Accessibility guide](./accessibility.md)
- [Persistence guide](./persistence.md)
- [Maintainer release guide](./RELEASING.md)
- Executable examples in [`../examples`](../examples)

Future work should add generated declaration links, browser compatibility test
results, Playwright interaction tests, axe-core checks, and a small Pages
navigation layer. Select a generator only when the documentation volume makes
plain Markdown difficult to maintain. TypeScript 7 should be reconsidered when
stable typescript-eslint declares compatibility.
