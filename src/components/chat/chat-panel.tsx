import { useState, useRef } from "react"
import { flushSync } from "react-dom"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, Smile01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import type { Chat, Message } from "./types"
import { MessageBubble } from "./message-bubble"
import { EmojiPicker } from "./emoji-picker"


interface ChatPanelProps {
  chat: Chat | undefined
  messages: Message[]
  currentUserId: string | null
  onSendMessage: (content: string) => void
  onInputChange?: () => void
  typingUsers?: string[]
  senderNames?: Map<string, string>
}

export function ChatPanel({ chat, messages, currentUserId, onSendMessage, onInputChange, typingUsers, senderNames }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useScrollToBottom([chat?.id, messages.length])

  function insertEmoji(emoji: string) {
    const input = inputRef.current
    if (!input) {
      setInputValue((prev) => prev + emoji)
      return
    }
    const start = input.selectionStart ?? inputValue.length
    const end = input.selectionEnd ?? inputValue.length
    const next = inputValue.slice(0, start) + emoji + inputValue.slice(end)
    flushSync(() => setInputValue(next))
    input.focus()
    const cursor = start + [...emoji].length
    input.setSelectionRange(cursor, cursor)
  }

  const isGroup = chat?.type === "group"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  if (!chat) {
    return (
      <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-muted">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>
              {chat.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {isGroup ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="h-3 w-3" />
            </span>
          ) : chat.otherUserOnline ? (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          ) : null}
        </div>
        <div>
          <h2 className="font-semibold">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {isGroup ? "Group" : chat.otherUserOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden bg-muted [&>div>div]:!block">
        <div className="flex flex-col gap-2 p-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isGroup={isGroup}
              senderName={message.senderId ? senderNames?.get(message.senderId) : undefined}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-muted-foreground italic">
          {typingUsers.length === 1 ? "Someone is typing..." : `${typingUsers.length} people are typing...`}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-start">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <InputGroupButton type="button" size="icon-sm" title="Emoji" aria-label="Open emoji picker">
                  <HugeiconsIcon icon={Smile01Icon} strokeWidth={2} />
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-auto p-0 border-0 shadow-lg">
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
    </div>
  )
}
