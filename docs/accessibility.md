# Accessibility guide

WCAG 2.2 AA is Demetria's design target, not a current conformance claim. The
renderer uses native form controls, associated labels and descriptions,
fieldset/legend grouping, a labeled progress region, `aria-current`, inline
alerts, `aria-invalid`, and focus movement to the first invalid control.

Consumers remain responsible for visible focus styles, sufficient color
contrast, page titles/headings, surrounding instructions, and testing the final
application with assistive technology. Unit tests cover keyboard submission,
navigation, error association, and error focus in jsdom. Future work will add
Playwright browser coverage and axe-core checks without replacing manual
accessibility review.
