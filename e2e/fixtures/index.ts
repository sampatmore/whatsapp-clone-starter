import { test as base, expect } from '@playwright/test'

/**
 * Extended Playwright test fixture that suppresses the ReactQueryDevtools
 * overlay before each test. Without this, the devtools SVG circle (r=316px)
 * intercepts pointer events and blocks button clicks in the bottom-right area.
 *
 * Uses a 'load' event handler + addStyleTag to inject CSS after every
 * navigation (addInitScript alone isn't sufficient since React mounts async).
 */
export const test = base.extend<{ suppressDevtools: void }>({
  suppressDevtools: [
    async ({ page }, use) => {
      page.on('load', () => {
        page
          .addStyleTag({
            content: '.tsqd-parent-container { display: none !important; }',
          })
          .catch(() => {
            // Ignore errors if page is navigating away
          })
      })
      await use()
    },
    { auto: true },
  ],
})

export { expect }
