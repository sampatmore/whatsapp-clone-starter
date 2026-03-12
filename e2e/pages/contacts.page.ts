import type { Page, Locator } from '@playwright/test'

/**
 * Page Object for the Contacts page.
 * Covers: contact list, search, tabs (Contacts / Requests),
 * add contact dialog, accepting/rejecting requests.
 */
export class ContactsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Contacts', exact: true })
  }

  get contactsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Contacts' })
  }

  get requestsTab(): Locator {
    return this.page.getByRole('tab', { name: /Requests/ })
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder('Search contacts...')
  }

  /** The add-contact icon button in the Contacts header */
  get addContactButton(): Locator {
    return this.page.getByTitle('Add contact')
  }

  get addContactInput(): Locator {
    return this.page.getByLabel('Email or username')
  }

  get sendRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'Send Request' })
  }

  get requestSentConfirmation(): Locator {
    return this.page.getByText('Contact request sent!')
  }

  get addContactDialog(): Locator {
    return this.page.getByRole('dialog')
  }

  async openAddContactDialog() {
    await this.addContactButton.click()
  }

  async sendContactRequest(identifier: string) {
    await this.openAddContactDialog()
    await this.addContactInput.fill(identifier)
    await this.sendRequestButton.click()
  }
}
