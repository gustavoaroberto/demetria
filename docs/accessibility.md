# Accessibility guide

WCAG 2.2 AA is Demetria's design target, not a current conformance claim. The
renderer uses native form controls, associated labels and descriptions,
fieldset/legend grouping, a labeled progress region, `aria-current`, inline
alerts, `aria-invalid`, and focus movement to the first invalid control.

Consumers remain responsible for visible focus styles, sufficient color
contrast, page titles/headings, surrounding instructions, and testing the final
application with assistive technology. Future work will add browser-level
keyboard tests and axe-core checks without replacing manual accessibility
review.
