# Documentation sources and roadmap

The publishable static site is maintained in [`../website`](../website), with
runnable applications in [`../examples`](../examples). `npm run docs:build`
combines those sources with the compiled library in the ignored `site-dist`
directory. No documentation framework or generator is used.

Current sections:

- [API reference](./api.md)
- [Schema guide](./schema.md)
- [Accessibility guide](./accessibility.md)
- [Persistence guide](./persistence.md)
- [Maintainer release guide](./RELEASING.md)
- [GitHub Pages setup](./GITHUB_PAGES.md)
- [Static website source](../website)
- [Executable examples](../examples)

Future work should add generated API declaration pages, richer schema recipes,
persistence migration guidance, browser compatibility results, Playwright
interaction tests, and axe-core checks. Select a generator only when the
documentation volume makes plain HTML and Markdown difficult to maintain.
TypeScript 7 should be reconsidered when stable typescript-eslint declares
compatibility.
