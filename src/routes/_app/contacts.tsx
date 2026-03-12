import { createFileRoute, Outlet, Link, useParams } from "@tanstack/react-router"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  UserAdd01Icon,
  Tick02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  contactsQueryOptions,
  pendingRequestsQueryOptions,
  useAcceptContactRequest,
  useRejectContactRequest,
  useCancelContactRequest,
  useSendContactRequest,
} from "@/queries/contacts"
import { cn } from "@/lib/utils"
import type * as contactsApi from "@/lib/api/contacts"

export const Route = createFileRoute("/_app/contacts")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(contactsQueryOptions),
      queryClient.ensureQueryData(pendingRequestsQueryOptions),
    ]),
  component: ContactsLayout,
})

function ContactsLayout() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: contacts } = useSuspenseQuery(contactsQueryOptions)
  const { data: pendingRequests } = useSuspenseQuery(pendingRequestsQueryOptions)

  const filteredContacts = contacts.filter((contact) =>
    contact.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel id="sidebar" defaultSize="320px" minSize="200px" maxSize="400px">
        <div className="flex h-full w-full flex-col border-r border-border bg-card">
          <div className="flex h-[65px] items-center justify-between border-b border-border px-4">
            <h1 className="text-xl font-semibold">Contacts</h1>
            <AddContactDialog />
          </div>

          <Tabs defaultValue="contacts" className="flex flex-1 flex-col min-h-0">
            <div className="px-3 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="contacts" className="flex-1">
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex-1">
                  Requests
                  {pendingRequests.filter((r) => r.direction === "inbound").length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                      {pendingRequests.filter((r) => r.direction === "inbound").length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="contacts" className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="p-3">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    strokeWidth={2}
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                {filteredContacts.length === 0 ? (
                  <EmptyContactsState hasSearch={searchQuery.length > 0} />
                ) : (
                  <div className="px-2">
                    {filteredContacts.map((contact) => (
                      <ContactItem key={contact.id} contact={contact} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="requests" className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 min-h-0">
                {pendingRequests.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No pending requests
                    </p>
                  </div>
                ) : (
                  <RequestsList requests={pendingRequests} />
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="content" minSize="50%">
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function EmptyContactsState({ hasSearch }: { hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No contacts found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="mb-1 text-sm font-medium">No contacts yet</h3>
      <p className="text-xs text-muted-foreground">
        Add contacts to start chatting
      </p>
    </div>
  )
}

function ContactItem({ contact }: { contact: contactsApi.Contact }) {
  const params = useParams({ strict: false })
  const isActive = params.contactId === contact.id

  return (
    <Link
      to="/contacts/$contactId"
      params={{ contactId: contact.id }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors",
        isActive && "bg-accent"
      )}
    >
      <Avatar size="sm">
        <AvatarImage src={contact.user.image || undefined} alt={contact.user.name} />
        <AvatarFallback>
          {contact.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{contact.user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{contact.user.email}</p>
      </div>
    </Link>
  )
}

function RequestsList({ requests }: { requests: contactsApi.PendingRequest[] }) {
  const inbound = requests.filter((r) => r.direction === "inbound")
  const outbound = requests.filter((r) => r.direction === "outbound")
  const hasBoth = inbound.length > 0 && outbound.length > 0

  return (
    <div className="px-2 py-3">
      {inbound.length > 0 && (
        <>
          {hasBoth && (
            <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Received</p>
          )}
          {inbound.map((request) => (
            <PendingRequestItem key={request.id} request={request} />
          ))}
        </>
      )}
      {outbound.length > 0 && (
        <>
          {hasBoth && (
            <p className="px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground">Sent</p>
          )}
          {outbound.map((request) => (
            <PendingRequestItem key={request.id} request={request} />
          ))}
        </>
      )}
    </div>
  )
}

function PendingRequestItem({ request }: { request: contactsApi.PendingRequest }) {
  const acceptRequest = useAcceptContactRequest()
  const rejectRequest = useRejectContactRequest()
  const cancelRequest = useCancelContactRequest()

  const isProcessing = acceptRequest.isPending || rejectRequest.isPending || cancelRequest.isPending

  if (request.direction === "outbound") {
    const user = request.to
    return (
      <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
        <Avatar size="sm">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => cancelRequest.mutate(request.id)}
          disabled={isProcessing}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const user = request.from
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
      <Avatar size="sm">
        <AvatarImage src={user.image || undefined} alt={user.name} />
        <AvatarFallback>
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-100"
          onClick={() => acceptRequest.mutate(request.id)}
          disabled={isProcessing}
        >
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => rejectRequest.mutate(request.id)}
          disabled={isProcessing}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AddContactDialog() {
  const [open, setOpen] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const sendRequest = useSendContactRequest()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) return

    setError(null)
    setSuccess(false)

    sendRequest.mutate(identifier.trim(), {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setIdentifier("")
          setSuccess(false)
        }, 1500)
      },
      onError: (err: unknown) => {
        const apiError = err as { response?: { data?: { error?: string } } }
        setError(apiError.response?.data?.error || "Failed to send request")
      },
    })
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setIdentifier("")
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Add contact">
          <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Send a contact request to connect with someone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-2">
            <Label htmlFor="identifier">Email or username</Label>
            <Input
              id="identifier"
              placeholder="john@example.com or johndoe"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={sendRequest.isPending || success}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">Contact request sent!</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={sendRequest.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sendRequest.isPending || !identifier.trim() || success}>
              {sendRequest.isPending ? "Sending..." : success ? "Sent!" : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
