import { test, expect } from '@playwright/test'

for (const round of ['morning', 'afternoon']) {
  test(`${round}: shared board, edit, totals, search and cancellation`, async ({
    page,
    context,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const name = `Test ${round} ${Date.now()}`
    await page.goto(`/?round=${round}`)
    await expect(page.getByText('Live board', { exact: true })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Milk tea' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Green tea' })).toHaveCount(0)
    await page.getByLabel('Your name').fill(name)
    await page.getByRole('radio', { name: 'Plain tea' }).check()
    await page.getByRole('radio', { name: 'No sugar' }).check()
    await page.getByLabel('A little note').fill('Extra strong please')
    await page.getByRole('button', { name: 'Count me in' }).click()
    await expect(
      page.getByRole('heading', { name: 'You’re on the list!' }),
    ).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: name })).toContainText(
      'Plain tea',
    )
    // A second independent identity gets the shared order, without edit permissions.
    const teammate = await context.browser()!.newContext()
    const second = await teammate.newPage()
    await second.goto(`/?round=${round}`)
    await expect(
      second.getByRole('row').filter({ hasText: name }),
    ).toBeVisible()
    await expect(
      second.getByRole('button', { name: 'Edit your order' }),
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Edit my order' }).click()
    await page.getByRole('radio', { name: 'Milk coffee' }).check()
    await page.getByRole('radio', { name: 'Less sugar' }).check()
    await page.getByRole('button', { name: 'Save my changes' }).click()
    await expect(page.getByRole('row').filter({ hasText: name })).toContainText(
      'Milk coffee',
    )
    await expect(
      second.getByRole('row').filter({ hasText: name }),
    ).toContainText('Milk coffee', { timeout: 15000 })
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'You’re on the list!' }),
    ).toBeVisible()
    await page.getByLabel('Find a teammate').fill('no-such-teammate-xyz')
    await expect(page.getByText('No one by that name yet.')).toBeVisible()
    await page.getByRole('button', { name: 'Clear search' }).click()
    await page.getByRole('button', { name: 'Tea aunty view' }).click()
    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'It’s tea time, CBD.' }),
    ).toBeVisible()
    await expect(
      dialog.getByRole('listitem').filter({ hasText: name }),
    ).toBeVisible()
    await expect(dialog.getByText('Extra strong please')).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: 'Less sugar 1 tsp' }),
    ).toBeVisible()
    if (test.info().project.name === 'desktop') {
      await page.emulateMedia({ media: 'print' })
      await expect(
        dialog.getByRole('listitem').filter({ hasText: name }),
      ).toBeVisible()
      await page.emulateMedia({ media: 'screen' })
    }
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Invite the team' }).click()
    await expect(page.getByLabel('Your team’s tea link')).toHaveValue(
      new RegExp(`round=${round}`),
    )
    await page.getByRole('button', { name: 'Close dialog' }).click()
    await page.getByRole('button', { name: 'Cancel my order' }).click()
    await page.getByRole('button', { name: 'Yes, cancel order' }).click()
    await expect(
      page.getByRole('button', { name: 'Count me in' }),
    ).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
    await teammate.close()
    expect(errors).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false)
  })
}

test('connection failure is visible and retry recovers', async ({ page }) => {
  await page.route('**/api/orders**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Cannot reach the shared board.' }),
    }),
  )
  await page.goto('/?round=morning')
  await expect(page.getByRole('alert')).toContainText(
    'Cannot reach the shared board.',
  )
  await page.unroute('**/api/orders**')
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('Live board', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
