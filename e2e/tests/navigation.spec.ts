import { test, expect } from '../fixtures/index'
import { SidebarPage } from '../pages/sidebar.page'

/**
 * As a user, I can navigate the app using the sidebar.
 */
test.describe('Navigation', () => {
  test('root path redirects to /chats', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/chats/)
  })

  test('app sidebar is visible on all protected pages', async ({ page }) => {
    await page.goto('/chats')
    const sidebar = new SidebarPage(page)
    await expect(sidebar.chatsLink).toBeVisible()
    await expect(sidebar.contactsLink).toBeVisible()
    await expect(sidebar.archiveLink).toBeVisible()
    await expect(sidebar.settingsLink).toBeVisible()
  })

  test('sidebar links navigate to the correct pages', async ({ page }) => {
    await page.goto('/chats')
    const sidebar = new SidebarPage(page)

    await sidebar.goToContacts()
    await expect(page).toHaveURL(/\/contacts/)

    await sidebar.goToArchive()
    await expect(page).toHaveURL(/\/archive/)

    await sidebar.goToSettings()
    await expect(page).toHaveURL(/\/settings/)

    await sidebar.goToChats()
    await expect(page).toHaveURL(/\/chats/)
  })

  test('sign-in page renders the login form', async ({ page }) => {
    await page.goto('/sign-in')
    // CardTitle renders as a <div>, not a heading element
    await expect(page.getByText('Sign in', { exact: true }).first()).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('sign-in page has a link to sign-up', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
  })
})
