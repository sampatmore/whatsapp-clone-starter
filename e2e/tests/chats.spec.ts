import { test, expect } from '../fixtures/index'
import { ChatsPage } from '../pages/chats.page'

/**
 * As a user, I can see my chats and open them to read messages.
 */
test.describe('Chat list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chats')
  })

  test('shows the Chats heading in the sidebar panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible()
  })

  test('lists all chats from seed data', async ({ page }) => {
    await expect(page.getByText('Alice Johnson')).toBeVisible()
    await expect(page.getByText('Dario Amodei')).toBeVisible()
  })

  test('shows the last message preview for each chat', async ({ page }) => {
    await expect(page.getByText("Hey! How's the workshop going?")).toBeVisible()
    await expect(page.getByText('Have an amazing hackathon session!')).toBeVisible()
  })

  test('opening a chat navigates to the correct URL', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.openChat('Alice Johnson')
    await expect(page).toHaveURL(/\/chats\/chat-1/)
  })

  test('chat panel shows the contact name in the header', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.openChat('Alice Johnson')
    await expect(chats.chatHeader('Alice Johnson')).toBeVisible()
  })

  test('chat panel shows existing messages from seed data', async ({ page }) => {
    const chats = new ChatsPage(page)
    await chats.openChat('Alice Johnson')
    // Scope message assertions to the chat panel (not the sidebar preview)
    const chatPanel = page.locator('.bg-muted')
    await expect(chatPanel.getByText('Hi Alice! Ready for the workshop?')).toBeVisible()
    await expect(chatPanel.getByText('Absolutely! This is going to be fun.')).toBeVisible()
    await expect(chatPanel.getByText("Hey! How's the workshop going?")).toBeVisible()
  })

  test('navigating directly to a chat URL loads the correct chat', async ({ page }) => {
    await page.goto('/chats/chat-2')
    const chats = new ChatsPage(page)
    await expect(chats.chatHeader('Dario Amodei')).toBeVisible()
    await expect(
      page.getByText('Hey there! Dario here from Anthropic.')
    ).toBeVisible()
  })
})
