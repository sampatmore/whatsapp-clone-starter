import { useState, useEffect } from "react"
import Picker from "@emoji-mart/react"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [data, setData] = useState<unknown>(null)
  const isDark = document.documentElement.classList.contains("dark")

  useEffect(() => {
    import("@emoji-mart/data").then((m) => setData(m.default))
  }, [])

  if (!data) {
    return <div className="p-4 text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <Picker
      data={data}
      theme={isDark ? "dark" : "light"}
      previewPosition="none"
      skinTonePosition="none"
      onEmojiSelect={(e: { native: string }) => onEmojiSelect(e.native)}
    />
  )
}
