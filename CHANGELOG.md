# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Introduced Demetria's olive-and-harvest identity across the README,
  documentation website, examples, logo, and favicon.

## [0.1.1] - 2026-10-21

### Added

- Browser accessibility regression coverage with Playwright and axe-core.

### Fixed

- Preserve submit-button focus after successful form completion.
- Remove redundant live-region configuration from the validation alert.
- Correct documentation accessible names, narrow-screen reflow, control
  boundaries, and native-presentation contrast.

## [0.1.0] - 2026-10-21

### Added

- JSON-compatible multi-step form schemas with text, email, number, select,
  checkbox, and textarea fields.
- Framework-independent native DOM rendering and lifecycle management.
- Required, email, number, select, and checkbox validation.
- Accessible labels, descriptions, validation feedback, focus management, and
  keyboard-operable navigation controls.
- Optional versioned `sessionStorage` and `localStorage` persistence.
- Explicit step selection for flows split across separate HTML documents.
- Modern ESM output, TypeScript declarations, examples, tests, and Node 24 CI.

### Changed

- Replaced the placeholder `sum` export and the non-functional documented API
  with the first supported Demetria form API.
- Standardized repository and package licensing metadata on MIT, pending final
  owner confirmation before publication.

### Notes

- Previously published 0.0.x versions did not contain a supported functional
  form implementation and should not be used. Version 0.1.0 is the first
  functional public release.

[Unreleased]: https://github.com/gustavoaroberto/demetria/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/gustavoaroberto/demetria/releases/tag/v0.1.1
[0.1.0]: https://github.com/gustavoaroberto/demetria/releases/tag/v0.1.0
