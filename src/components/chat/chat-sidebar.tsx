import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageMultiple02Icon, Message01Icon } from "@hugeicons/core-free-icons"
import type { Chat } from "./types"
import { ChatListItem } from "./chat-list-item"
import { NewChatPopover } from "./new-chat-popover"

interface ChatSidebarProps {
  chats: Chat[]
}

export function ChatSidebar({ chats }: ChatSidebarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const activeChats = chats
    .filter((chat) => !chat.archivedAt)
    .sort((a, b) => {
      // Pinned chats first
      if (a.pinnedAt && !b.pinnedAt) return -1
      if (!a.pinnedAt && b.pinnedAt) return 1
      if (a.pinnedAt && b.pinnedAt) {
        return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime()
      }
      // Then by last message time
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bTime - aTime
    })

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="flex h-[65px] items-center justify-between border-b border-border px-4">
        <h1 className="text-xl font-semibold">Chats</h1>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <HugeiconsIcon icon={Message01Icon} strokeWidth={1.5} className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-0">
            <NewChatPopover onClose={() => setPopoverOpen(false)} />
          </PopoverContent>
        </Popover>
      </div>
      {activeChats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <HugeiconsIcon
              icon={MessageMultiple02Icon}
              strokeWidth={1.5}
              className="h-8 w-8 text-muted-foreground"
            />
          </div>
          <h3 className="mb-1 text-sm font-medium">No chats yet</h3>
          <p className="text-xs text-muted-foreground">
            Start a conversation with one of your contacts
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          {activeChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </ScrollArea>
      )}
    </div>
  )
}
