# Feature Plan: Emoji Picker

## Goal

Add an emoji picker button to the chat message input that inserts the selected emoji at the cursor position.

---

## Package

```bash
pnpm add @emoji-mart/react @emoji-mart/data
```

`emoji-mart` is the right choice here: actively maintained, ships its own emoji dataset, has built-in keyboard navigation and search, supports light/dark theming, and is tree-shakeable. The data package (`@emoji-mart/data`) is separate so the ~1MB emoji dataset is only loaded when the picker is first opened (via dynamic import).

---

## Files to create

### `src/components/chat/emoji-picker.tsx`

A thin wrapper around `@emoji-mart/react` that keeps `ChatPanel` clean. Responsibilities:
- Lazy-load the emoji data on first render (`import('@emoji-mart/data')`) so the 1MB dataset doesn't block the initial page load
- Detect the current theme (`document.documentElement.classList.contains('dark')`) and pass `theme="light"|"dark"` to the picker
- Forward the `onEmojiSelect` callback, extracting `emoji.native` (the Unicode character) from the emoji-mart event object
- Apply a fixed width (`width={320}`) and set `previewPosition="none"` to keep the picker compact

```tsx
// Rough shape — not final implementation
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [data, setData] = useState(null)
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    import('@emoji-mart/data').then(m => setData(m.default))
  }, [])

  if (!data) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>

  return (
    <Picker
      data={data}
      theme={isDark ? 'dark' : 'light'}
      previewPosition="none"
      skinTonePosition="none"
      onEmojiSelect={(e) => onEmojiSelect(e.native)}
    />
  )
}
```

---

## Files to modify

### `src/components/chat/chat-panel.tsx`

**Three additions:**

**1. Picker open state**
```tsx
const [pickerOpen, setPickerOpen] = useState(false)
```

**2. `insertEmoji` function** — the critical piece (see Cursor Insertion below)

**3. UI changes to the `<form>` input area**

Add a second `InputGroupAddon` on the `inline-start` side (left of the text input) containing the emoji trigger button, wrapped in a `Popover`. The send button remains on `inline-end`. This mirrors the WhatsApp layout.

```tsx
<form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
  <InputGroup className="h-10">
    <InputGroupAddon align="inline-start">
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <InputGroupButton type="button" size="icon-sm" title="Emoji" aria-label="Open emoji picker">
            <HugeiconsIcon icon={SmileIcon} strokeWidth={2} />
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto p-0 border-0">
          <EmojiPicker onEmojiSelect={insertEmoji} />
        </PopoverContent>
      </Popover>
    </InputGroupAddon>
    <InputGroupInput
      ref={inputRef}
      placeholder="Type a message..."
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value)
        onInputChange?.()
      }}
    />
    <InputGroupAddon align="inline-end">
      <InputGroupButton type="submit" size="icon-sm" disabled={!inputValue.trim()}>
        <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</form>
```

Icon to use: `Smile01Icon` from `@hugeicons/core-free-icons` (consistent with the existing icon library).

---

## Cursor insertion — the hard part

The naive approach (`setInputValue(prev => prev + emoji)`) always appends to the end. This is wrong if the user has clicked mid-message to position their cursor.

The correct approach uses `flushSync` to force a synchronous React render so the cursor position can be restored immediately after the DOM update, without a visible flicker:

```tsx
import { flushSync } from 'react-dom'

function insertEmoji(emoji: string) {
  const input = inputRef.current
  if (!input) {
    setInputValue(prev => prev + emoji)
    return
  }

  const start = input.selectionStart ?? inputValue.length
  const end   = input.selectionEnd   ?? inputValue.length
  const next  = inputValue.slice(0, start) + emoji + inputValue.slice(end)

  // flushSync forces the DOM update before we restore the cursor,
  // preventing React's batching from resetting selectionStart to the end
  flushSync(() => setInputValue(next))

  input.focus()
  const cursor = start + [...emoji].length  // spread handles multi-codepoint emoji (e.g. 👨‍👩‍👧)
  input.setSelectionRange(cursor, cursor)
}
```

**Why `[...emoji].length` not `emoji.length`?**
Many emoji are multiple Unicode code units (e.g. 👨‍👩‍👧 is 8 code units but 1 visible character). Spreading into an array gives the correct visual character count for cursor placement.

**The picker should NOT close after each emoji selection** — users typically want to insert several emoji in a row. It should close only on Escape or clicking outside (the `Popover` component handles both via `onOpenChange`).

---

## Theming

`emoji-mart` renders its own shadow DOM with internal CSS variables. To make it respect the current brand theme, pass `theme="light"` or `theme="dark"` (auto-detected). The picker will use its own neutral dark/light styles, which is acceptable — attempting to override emoji-mart's internal shadow DOM CSS is fragile and not worth doing for this feature.

The `PopoverContent` should have `className="w-auto p-0 border-0 shadow-lg"` so the picker's own border and background show through cleanly.

---

## E2E tests to add

In `e2e/tests/messaging.spec.ts`:

```
'emoji picker button is visible in the chat input'
  → page.goto('/chats/chat-1')
  → expect getByTitle('Emoji') toBeVisible

'clicking the emoji button opens the picker'
  → click getByTitle('Emoji')
  → expect getByRole('searchbox') or picker container toBeVisible

'selecting an emoji inserts it into the input'
  → click emoji button
  → click a specific emoji (e.g. 😀 — locate by its label in the picker)
  → expect messageInput toHaveValue containing the emoji

'emoji is inserted at cursor position, not appended'
  → type 'Hello World' into input
  → click between 'Hello' and ' World' to position cursor (using input.setSelectionRange via page.evaluate)
  → open picker, select emoji
  → expect value to be 'Hello [emoji] World'

'picker closes on Escape'
  → open picker
  → press Escape
  → expect picker toBeHidden
```

---

## Edge cases

| Case | Handling |
|---|---|
| Emoji data fails to load | Show "Loading…" text in picker, no crash |
| Input is empty | Emoji is inserted at position 0 correctly |
| Cursor at very end | Emoji is appended (same as before) |
| Multi-codepoint emoji (👨‍👩‍👧) | `[...emoji].length` handles cursor offset correctly |
| Picker open + user submits form | `onSubmit` fires normally, picker stays open |
| Mobile virtual keyboard | `side="top"` on `PopoverContent` ensures picker appears above the keyboard |
| Theme switches while picker is open | Picker re-renders with new theme on next open (acceptable) |

---

## What this does NOT change

- `ChatPanel`'s `onSendMessage` prop — emoji are just Unicode characters in the message string, no API changes needed
- The message store or any query logic
- The `InputGroup` component itself — the new addon slot is additive
