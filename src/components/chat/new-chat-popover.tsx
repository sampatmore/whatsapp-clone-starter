import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { contactsQueryOptions } from "@/queries/contacts"
import { useCreateDirectChat } from "@/queries/chats"

interface NewChatPopoverProps {
  onClose: () => void
}

export function NewChatPopover({ onClose }: NewChatPopoverProps) {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { data: contacts, isLoading, isError } = useQuery(contactsQueryOptions)
  const createDirectChat = useCreateDirectChat()

  const filtered = contacts?.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelect(contact: NonNullable<typeof contacts>[number]) {
    const chat = await createDirectChat.mutateAsync({
      userId: contact.user.id,
      userName: contact.user.name,
      userImage: contact.user.image ?? undefined,
    })
    navigate({ to: "/chats/$chatId", params: { chatId: chat.id } })
    onClose()
  }

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b border-border">
        <Input
          autoFocus
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <ScrollArea className="max-h-72">
        {isLoading && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Loading contacts…
          </p>
        )}
        {isError && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Could not load contacts
          </p>
        )}
        {!isLoading && !isError && filtered?.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            {search ? "No matches found" : "No contacts yet"}
          </p>
        )}
        {filtered?.map((contact) => (
          <button
            key={contact.id}
            disabled={createDirectChat.isPending}
            onClick={() => handleSelect(contact)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={contact.user.image} alt={contact.user.name} />
              <AvatarFallback className="text-xs">
                {contact.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{contact.user.name}</span>
          </button>
        ))}
      </ScrollArea>
    </div>
  )
}
