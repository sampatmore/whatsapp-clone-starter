import {
  mockContacts,
  mockPendingRequests,
  nextRequestId,
} from "@/lib/data"

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  isOnline?: boolean
  lastSeen?: string | null
}

export interface Contact {
  id: string
  user: User
  createdAt: string
}

export interface InboundRequest {
  id: string
  direction: "inbound"
  from: User
  createdAt: string
}

export interface OutboundRequest {
  id: string
  direction: "outbound"
  to: User
  createdAt: string
}

export type PendingRequest = InboundRequest | OutboundRequest

// In-memory stores
const contactsStore = [...mockContacts]
const pendingRequestsStore = [...mockPendingRequests] as PendingRequest[]

// Get accepted contacts
export async function fetchContacts(): Promise<Contact[]> {
  return contactsStore
}

// Get pending contact requests (inbound + outbound)
export async function fetchPendingRequests(): Promise<PendingRequest[]> {
  return pendingRequestsStore
}

// Send a contact request
export async function sendContactRequest(identifier: string): Promise<void> {
  const newRequest: PendingRequest = {
    id: nextRequestId(),
    direction: "outbound",
    to: {
      id: `user-${Date.now()}`,
      name: identifier,
      email: identifier.includes("@") ? identifier : `${identifier}@example.com`,
      image: null,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  }
  pendingRequestsStore.push(newRequest)
}

// Accept a contact request
export async function acceptContactRequest(requestId: string): Promise<void> {
  const idx = pendingRequestsStore.findIndex((r) => r.id === requestId)
  if (idx < 0) return
  const request = pendingRequestsStore[idx]
  if (request.direction !== "inbound") return

  // Move from pending to contacts
  pendingRequestsStore.splice(idx, 1)
  contactsStore.push({
    id: `contact-${request.from.id}`,
    user: request.from,
    createdAt: new Date().toISOString(),
  })
}

// Reject a contact request
export async function rejectContactRequest(requestId: string): Promise<void> {
  const idx = pendingRequestsStore.findIndex((r) => r.id === requestId)
  if (idx >= 0) pendingRequestsStore.splice(idx, 1)
}

// Remove a contact
export async function removeContact(contactId: string): Promise<void> {
  // Check if it's a pending request (cancel) or a contact (remove)
  const reqIdx = pendingRequestsStore.findIndex((r) => r.id === contactId)
  if (reqIdx >= 0) {
    pendingRequestsStore.splice(reqIdx, 1)
    return
  }

  const contactIdx = contactsStore.findIndex((c) => c.id === contactId)
  if (contactIdx >= 0) contactsStore.splice(contactIdx, 1)
}
