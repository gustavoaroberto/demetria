# Accessibility audit — Demetria v0.1.0

Audit date: 2026-10-21  
Target: WCAG 2.2 Level AA  
Status: targeted audit completed; **no WCAG conformance claim**

## Scope and method

The audit covered the TypeScript form engine, native DOM renderer, validation
and persistence behavior, unit tests, static documentation, and both runnable
examples. Automated browser checks used Chrome, Playwright 1.64.1, and
`@axe-core/playwright` 4.14.0. Unit tests use Vitest and jsdom.

Pages tested:

- Home, Getting Started, Schema, Validation, Persistence, Accessibility,
  Examples, and Contributing.
- Single-page onboarding example.
- Both documents in the multi-page course application.

Form states tested:

- Initial render.
- Empty required-field errors.
- Invalid non-empty optional email.
- Error correction by clearing the optional email.
- Successful forward and backward navigation.
- Final step and successful completion.
- Real cross-document navigation, browser Back/Forward, and restored values.
- Styled and native-presentation modes.

The automated suite also exercises Tab, Shift+Tab, Enter, and Space; the mobile
`details` navigation; focus visibility; reduced-motion and forced-color media
preferences; and page reflow at 320 CSS pixels. Unit tests cover number, select,
checkbox, empty optional, required, and invalid typed-value behavior.

## Verified failures and fixes

No P0 issue was found. The following failures were reproduced before being
fixed.

| ID      | Priority | Failure and reproduction                                                                                                                                     | Relevant criterion            | Resolution                                                                                                                      |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A11Y-01 | P1       | On every documentation page, run axe or inspect the brand link. Visible text was “Demetria” while `aria-label="Demetria home"` replaced its accessible name. | 2.5.3 Label in Name           | Removed the overriding label; the visible brand text is now the accessible name.                                                |
| A11Y-02 | P1       | At 320 CSS px, Getting Started produced page-level horizontal scrolling. Code regions could also scroll without keyboard focus.                              | 1.4.10 Reflow; 2.1.1 Keyboard | Grid tracks now use `minmax(0, 1fr)`, narrow code wraps, and genuinely scrollable tables are labeled, focusable regions.        |
| A11Y-03 | P1       | Focus Complete and press Enter. Completion rebuilt the same form, removed the focused node, and left focus on the document body.                             | 2.4.3 Focus Order             | Completion no longer performs an unnecessary renderer rebuild, preserving focus on the Complete button while `onComplete` runs. |
| A11Y-04 | P1       | Complete the single-page form, switch to native presentation, and run axe. Required/Optional text remained lavender on a white Canvas background at 1.8:1.   | 1.4.3 Contrast (Minimum)      | Native mode now uses `CanvasText` for the indicators.                                                                           |
| A11Y-05 | P1       | Compare transparent control boundaries with their darkest adjacent surfaces. Some borders were below 3:1.                                                    | 1.4.11 Non-text Contrast      | Strengthened documentation and example control-border tokens to exceed 3:1 against their relevant dark surfaces.                |
| A11Y-06 | P2       | Inspect the validation summary. `role="alert"` was combined with an explicit `aria-live="assertive"`, duplicating the role's implicit live-region property.  | 4.1.3 Status Messages         | Removed the redundant `aria-live`; the alert role remains.                                                                      |
| A11Y-07 | P1       | Emulate forced colors and inspect the example result. Its light authored text remained while the background became white, producing 1.11:1 contrast.         | 1.4.3 Contrast (Minimum)      | The result now uses the system `CanvasText` and `Canvas` colors in forced-colors mode.                                          |

Regression coverage was added for completion focus, labels and descriptions,
error focus, step focus, keyboard activation, native-mode contrast, reflow, and
multi-page restoration.

## Automated results after fixes

The final Playwright run contains 13 browser tests. Axe reported zero violations
for the selected WCAG 2.0/2.1/2.2 A and AA tags in every tested page and form
state.

Axe returned `color-contrast` as **incomplete**, rather than a violation, for
text over CSS gradients. This requires human evaluation. Representative solid
token pairs were calculated separately:

| Pair                                        |   Ratio |
| ------------------------------------------- | ------: |
| Documentation primary text / ink background | 15.88:1 |
| Documentation muted text / ink background   |  9.33:1 |
| Documentation accent / ink background       |  8.15:1 |
| Dark accent text / lavender accent          |  8.28:1 |
| Example primary text / ink background       | 16.65:1 |
| Example muted text / ink background         | 10.31:1 |
| Example control text / control background   | 15.73:1 |
| Native-mode error text / white Canvas       |  8.10:1 |

An initial axe `aria-prohibited-attr` incomplete result was investigated. It
identified labels on generic `div` elements. The decorative terminal label was
removed; scrollable table wrappers now use a named `region`. The warning no
longer remains.

Automated results do not prove WCAG conformance. In particular, axe cannot
validate whether wording is understandable or whether a real screen reader
announces the flow at the right level of detail.

### Public deployment status

The public URL was checked separately on 2026-10-21. Its Home, Getting Started,
Schema, Validation, Persistence, and Accessibility pages still reproduce
A11Y-01 (`label-content-name-mismatch`) because the fixes in this working tree
have not been deployed. The deployed single-page and multi-page initial states
reported no axe violations. After owner review, the documentation must be
deployed through the existing Pages workflow and the public URL must be retested
before this issue is considered closed in production.

## Keyboard, forms, validation, and focus

- Native controls and buttons produce a logical source-order tab sequence.
- Enter submits Next/Complete; Space operates the presentation toggle and
  mobile disclosure. No keyboard trap was found.
- Labels use `for`/`id`; IDs are unique per renderer instance.
- Required controls receive the native `required` property and visible text.
  Optional indicators in examples are textual and do not rely on color.
- Field descriptions and errors are included in `aria-describedby`.
- Invalid controls receive `aria-invalid="true"`; the first invalid control is
  focused after submission.
- Successful in-page navigation focuses the new step legend, which has
  `tabindex="-1"` and provides step context.
- Completion preserves the focused submit button. Example result regions use
  `aria-live="polite"` for the application-owned completion message.
- Real page navigation resets focus to the new document body. This preserves
  access to its page title, heading, and instructions rather than skipping
  directly into the form.
- Disabled-button behavior is not applicable: v0.1.0 does not render disabled
  navigation buttons.

## Library versus host responsibility

The library supplies semantic form structure, label/error relationships,
required state, native keyboard behavior, validation focus, and step-heading
focus. It intentionally ships no CSS. The host remains responsible for focus
appearance, contrast, reflow, page landmarks and titles, completion feedback,
and the accessibility of surrounding content.

## Manual checks not performed

The environment did not provide NVDA on Windows or VoiceOver on macOS. No claim
of manual screen-reader testing is made. Before any conformance statement or a
larger release, manually verify:

1. NVDA with Firefox and Chrome on Windows.
2. VoiceOver with Safari on macOS and iOS.
3. Error-summary and focused-field announcement order, checking for duplicate
   speech.
4. Native browser zoom at 200% and 400%; the automated 320 CSS px reflow test is
   a strong proxy but not a substitute.
5. Windows High Contrast and other user color overrides on physical systems;
   automated forced-colors emulation passes but is not a hardware/OS test.
6. Touch target comfort on representative mobile hardware.
7. Firefox and Safari Back/Forward focus and storage-restoration behavior.

English-only built-in messages and the absence of customizable validation
messages remain product limitations. The current required-text rule also treats
whitespace-only strings as non-empty; this is documented behavior, not an
accessibility regression introduced by this audit.

## Release recommendation

The completion-focus fix changes shipped renderer behavior without changing the
public API or schema contract. Release it as a **v0.1.1 patch** after owner
review, manual assistive-technology smoke testing where available, and the full
release checklist. Documentation and example fixes alone would not require an
npm release, but the renderer fix does. Do not describe v0.1.1 as WCAG 2.2 AA
conformant.
