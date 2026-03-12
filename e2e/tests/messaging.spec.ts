import { test, expect } from '../fixtures/index'
import { ChatsPage } from '../pages/chats.page'

/**
 * As a user, I can send messages in a chat.
 */
test.describe('Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to Alice's chat (chat-1 from seed data)
    await page.goto('/chats/chat-1')
  })

  test('message input is visible', async ({ page }) => {
    const chats = new ChatsPage(page)
    await expect(chats.messageInput).toBeVisible()
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    const chats = new ChatsPage(page)
    await expect(chats.messageInput).toHaveValue('')
    await expect(chats.sendButton).toBeDisabled()
  })

  test('send button becomes enabled when input has text', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.messageInput.fill('Hello')
    await expect(chats.sendButton).toBeEnabled()
  })

  test('sending a message displays it in the conversation', async ({ page }) => {
    const chats = new ChatsPage(page)
    const message = `E2E test message ${Date.now()}`
    await chats.sendMessage(message)
    await expect(page.getByText(message)).toBeVisible()
  })

  test('input is cleared after sending', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.sendMessage('Test message')
    await expect(chats.messageInput).toHaveValue('')
  })

  test('pressing Enter submits the message', async ({ page }) => {
    const chats = new ChatsPage(page)
    const message = `Enter key message ${Date.now()}`
    await chats.messageInput.fill(message)
    await chats.messageInput.press('Enter')
    await expect(page.getByText(message)).toBeVisible()
    await expect(chats.messageInput).toHaveValue('')
  })

  test('whitespace-only input does not send a message', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.messageInput.fill('   ')
    await expect(chats.sendButton).toBeDisabled()
  })
})

test.describe('Emoji picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chats/chat-1')
  })

  test('emoji picker button is visible in the chat input', async ({ page }) => {
    const chats = new ChatsPage(page)
    await expect(chats.emojiButton).toBeVisible()
  })

  test('clicking the emoji button opens the picker', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.emojiButton.click()
    await expect(chats.emojiPicker).toBeVisible()
  })

  test('selecting an emoji inserts it into the input', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.emojiButton.click()
    await expect(chats.emojiPicker).toBeVisible()
    // Click the grinning face emoji by its label
    await chats.emojiPicker.locator('button[aria-label*="grinning"]').first().click()
    await expect(chats.messageInput).not.toHaveValue('')
  })

  test('emoji is inserted at cursor position, not appended', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.messageInput.fill('Hello World')
    // Position cursor between 'Hello' and ' World'
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement
      input.setSelectionRange(5, 5)
    })
    await chats.emojiButton.click()
    await expect(chats.emojiPicker).toBeVisible()
    await chats.emojiPicker.locator('button[aria-label*="grinning"]').first().click()
    const value = await chats.messageInput.inputValue()
    // Emoji should appear at position 5, not at the end
    expect(value.startsWith('Hello')).toBe(true)
    expect(value.endsWith('World')).toBe(true)
    expect(value.length).toBeGreaterThan('Hello World'.length)
  })

  test('picker closes on Escape', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.emojiButton.click()
    await expect(chats.emojiPicker).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(chats.emojiPicker).not.toBeVisible()
  })
})
