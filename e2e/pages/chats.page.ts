import type { Page, Locator } from '@playwright/test'

/**
 * Page Object for the chats layout and chat panel.
 * Covers: chat list, opening a chat, reading messages, sending messages.
 */
export class ChatsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Locate a chat list item by the contact's name */
  chatListItem(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name) }).first()
  }

  async openChat(name: string) {
    await this.chatListItem(name).click()
  }

  /** The "Type a message..." input in the chat panel */
  get messageInput(): Locator {
    return this.page.getByPlaceholder('Type a message...')
  }

  /** The submit button inside the message form */
  get sendButton(): Locator {
    return this.page.locator('form button[type="submit"]')
  }

  /** The emoji picker trigger button */
  get emojiButton(): Locator {
    return this.page.getByTitle('Emoji')
  }

  /** The emoji picker popover content */
  get emojiPicker(): Locator {
    return this.page.locator('em-emoji-picker')
  }

  /** The h2 name shown in the chat panel header */
  chatHeader(name: string): Locator {
    return this.page.locator('h2').filter({ hasText: name })
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text)
    await this.sendButton.click()
  }
}
