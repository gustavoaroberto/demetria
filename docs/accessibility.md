# Accessibility guide

WCAG 2.2 AA is Demetria's design target, not a current conformance claim. The
renderer uses native form controls, associated labels and descriptions,
fieldset/legend grouping, a labeled progress region, `aria-current`, inline
alerts, `aria-invalid`, and focus movement to the first invalid control.

Consumers remain responsible for visible focus styles, sufficient color
contrast, page titles/headings, surrounding instructions, and testing the final
application with assistive technology. Unit and Playwright tests cover keyboard
submission, navigation, error association, error focus, reflow, and axe-core
rules without replacing manual accessibility review.

The dated [v0.1.0 accessibility audit](./accessibility-audit.md) records the
automated browser results, confirmed fixes, and remaining manual screen-reader
checks. It is an engineering audit, not a conformance statement.
