import type { Page, Locator } from '@playwright/test'

/**
 * Page Object for the persistent app sidebar navigation.
 * Encapsulates all sidebar interactions so tests don't depend on
 * implementation details like CSS classes or icon types.
 */
export class SidebarPage {
  readonly page: Page
  readonly chatsLink: Locator
  readonly contactsLink: Locator
  readonly archiveLink: Locator
  readonly settingsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.chatsLink = page.getByTitle('Chats')
    this.contactsLink = page.getByTitle('Contacts')
    this.archiveLink = page.getByTitle('Archive')
    this.settingsLink = page.getByTitle('Settings')
  }

  async goToChats() {
    await this.chatsLink.click()
  }

  async goToContacts() {
    await this.contactsLink.click()
  }

  async goToArchive() {
    await this.archiveLink.click()
  }

  async goToSettings() {
    await this.settingsLink.click()
  }
}
