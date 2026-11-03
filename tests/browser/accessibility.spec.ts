import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('order board and dialogs meet WCAG AA checks', async ({ page }) => {
  await page.goto('/?round=morning')
  await expect(page.getByText('Live board', { exact: true })).toBeVisible()
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'Invite the team' }).click()
  const dialog = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    dialog.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
})
