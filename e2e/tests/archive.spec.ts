import { test, expect } from '../fixtures/index'

/**
 * As a user, I can view and manage my archived chats.
 */
test.describe('Archive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/archive')
  })

  test('shows the Archive heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Archive', exact: true })).toBeVisible()
  })

  test('shows empty state when no chats have been archived', async ({ page }) => {
    await expect(page.getByText('No archived chats')).toBeVisible()
    await expect(page.getByText('Chats you archive will appear here')).toBeVisible()
  })

  test('shows 0 archived chats count', async ({ page }) => {
    await expect(page.getByText('0 archived chats')).toBeVisible()
  })
})
