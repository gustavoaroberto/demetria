import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const documentationPages = [
  '',
  'getting-started/',
  'schema/',
  'validation/',
  'persistence/',
  'accessibility/',
  'examples/',
  'contributing/'
];

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(
    results.violations,
    results.violations
      .map(
        (violation) =>
          `${violation.impact ?? 'unknown'}: ${violation.id} — ${violation.help}\n${violation.nodes
            .map(
              (node) =>
                `  ${node.target.join(' ')}: ${node.failureSummary ?? ''}`
            )
            .join('\n')}`
      )
      .join('\n')
  ).toEqual([]);
}

for (const path of documentationPages) {
  test(`documentation page ${path || 'home'} has no detectable WCAG A/AA violations`, async ({
    page
  }) => {
    await page.goto(path);
    await expectNoAxeViolations(page);
  });
}

test('documentation navigation is keyboard-accessible at desktop and mobile sizes', async ({
  page
}) => {
  await page.goto('');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' })
  ).toBeFocused();
  const outlineStyle = await page
    .getByRole('link', { name: 'Skip to content' })
    .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe('none');
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' })
  ).not.toBeFocused();

  await page.setViewportSize({ width: 320, height: 720 });
  await page.reload();
  const menu = page.locator('.mobile-menu summary');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mobile-menu')).toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(page.locator('.mobile-menu')).not.toHaveAttribute('open', '');
  await expectNoAxeViolations(page);
});

test('reduced-motion and forced-color preferences preserve usable focus', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('examples/single-page/');
  const next = page.getByRole('button', { name: 'Next' });
  await next.focus();
  const styles = await next.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      animationDuration: computed.animationDuration,
      outlineStyle: computed.outlineStyle
    };
  });
  expect(Number.parseFloat(styles.animationDuration)).toBeLessThanOrEqual(
    0.00001
  );
  expect(styles.outlineStyle).not.toBe('none');
  await expectNoAxeViolations(page);
});

test('documentation and examples reflow without page-level horizontal scrolling', async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const path of [
    ...documentationPages,
    'examples/single-page/',
    'examples/multi-page/page-one.html',
    'examples/multi-page/page-two.html'
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(
      overflow,
      `${path || 'home'} overflows at 320 CSS pixels`
    ).toBeLessThanOrEqual(1);
  }
});

test('single-page form remains accessible through errors, steps, and completion', async ({
  page
}) => {
  await page.goto('examples/single-page/');
  await expectNoAxeViolations(page);

  await page.getByRole('button', { name: 'Next' }).click();
  const fullName = page.getByLabel(/Full name Required/);
  await expect(fullName).toBeFocused();
  await expect(fullName).toHaveAttribute('aria-invalid', 'true');
  await expectNoAxeViolations(page);

  await fullName.fill('Ada Lovelace');
  const email = page.getByLabel(/Email Optional/);
  await email.fill('not-an-email');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute('aria-describedby', /error/);

  await email.clear();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.getByText('Learning preferences', { exact: true }).last()
  ).toBeFocused();
  await expectNoAxeViolations(page);

  await page.getByLabel(/Learning track Required/).selectOption('typescript');
  const complete = page.getByRole('button', { name: 'Complete' });
  await complete.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#result')).toContainText('Ada Lovelace');
  await expect(complete).toBeFocused();
  const presentationToggle = page.locator('#presentation-toggle');
  await presentationToggle.focus();
  await page.keyboard.press('Space');
  await expect(presentationToggle).toHaveAttribute('aria-pressed', 'true');
  await expectNoAxeViolations(page);
});

test('multi-page form preserves semantics, focus, navigation, and restored state', async ({
  page
}) => {
  await page.goto('examples/multi-page/page-one.html');
  await expectNoAxeViolations(page);

  await page.getByRole('button', { name: 'Next' }).click();
  const displayName = page.getByLabel(/Display name Required/);
  await expect(displayName).toBeFocused();
  await displayName.fill('Grace Hopper');
  await Promise.all([
    page.waitForURL(/page-two\.html$/),
    page.getByRole('button', { name: 'Next' }).click()
  ]);

  await expect(page).toHaveTitle(/course/i);
  expect(
    await page.evaluate(() => document.activeElement === document.body)
  ).toBe(true);
  await expectNoAxeViolations(page);

  await page.goBack();
  await expect(page.getByLabel(/Display name Required/)).toHaveValue(
    'Grace Hopper'
  );
  await page.goForward();
  await page.getByRole('button', { name: 'Complete' }).click();
  await expect(page.getByLabel(/Course Required/)).toBeFocused();
  await page.getByLabel(/Course Required/).selectOption('accessibility');
  await page.getByRole('button', { name: 'Complete' }).click();
  await expect(page.locator('#result')).toContainText('Grace Hopper');
  await expectNoAxeViolations(page);
});
