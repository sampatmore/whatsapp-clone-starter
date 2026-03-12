import { test, expect } from '../fixtures/index'
import { ContactsPage } from '../pages/contacts.page'

/**
 * As a user, I can view and manage my contacts.
 */
test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts')
  })

  test('shows the Contacts heading', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await expect(contacts.heading).toBeVisible()
  })

  test('shows Contacts and Requests tabs', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await expect(contacts.contactsTab).toBeVisible()
    await expect(contacts.requestsTab).toBeVisible()
  })

  test('lists all contacts from seed data', async ({ page }) => {
    await expect(page.getByText('Alice Johnson')).toBeVisible()
    await expect(page.getByText('Bob Smith')).toBeVisible()
    await expect(page.getByText('Carol Davis')).toBeVisible()
  })

  test('search filters the contacts list', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.searchInput.fill('Alice')
    await expect(page.getByText('Alice Johnson')).toBeVisible()
    await expect(page.getByText('Bob Smith')).not.toBeVisible()
    await expect(page.getByText('Carol Davis')).not.toBeVisible()
  })

  test('clearing search restores all contacts', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.searchInput.fill('Alice')
    await contacts.searchInput.clear()
    await expect(page.getByText('Alice Johnson')).toBeVisible()
    await expect(page.getByText('Bob Smith')).toBeVisible()
  })

  test('search shows empty state when no match', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.searchInput.fill('zzznomatch')
    await expect(page.getByText('No contacts found')).toBeVisible()
  })

  test('Requests tab shows inbound and outbound pending requests', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.requestsTab.click()
    await expect(page.getByText('Diana Prince')).toBeVisible() // inbound
    await expect(page.getByText('Eve Martinez')).toBeVisible() // outbound
  })

  test('add contact dialog opens with correct title', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.openAddContactDialog()
    await expect(contacts.addContactDialog).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Contact' })).toBeVisible()
  })

  test('add contact dialog accepts email input', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.openAddContactDialog()
    await contacts.addContactInput.fill('newuser@example.com')
    await expect(contacts.addContactInput).toHaveValue('newuser@example.com')
  })

  test('send request button is disabled when input is empty', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.openAddContactDialog()
    await expect(contacts.sendRequestButton).toBeDisabled()
  })

  test('sending a contact request shows success confirmation', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.sendContactRequest('test@example.com')
    await expect(contacts.requestSentConfirmation).toBeVisible()
  })

  test('sent request appears in the Requests tab', async ({ page }) => {
    const contacts = new ContactsPage(page)
    await contacts.sendContactRequest('newperson@example.com')
    // Wait for the success message (mutation completed, in-memory store updated)
    await expect(contacts.requestSentConfirmation).toBeVisible()
    // Dialog auto-closes after 1.5s
    await expect(contacts.addContactDialog).not.toBeVisible({ timeout: 5000 })
    await contacts.requestsTab.click()
    // Both name and email fields show the same value — use first() to avoid strict mode violation
    await expect(page.getByText('newperson@example.com').first()).toBeVisible()
  })
})
