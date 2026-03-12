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
