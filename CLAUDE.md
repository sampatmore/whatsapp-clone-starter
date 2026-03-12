# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (requires Node ≥ 20 — use nvm use 20)
pnpm lint         # ESLint
pnpm exec tsc --noEmit  # Type-check without emitting
pnpm build        # Type-check + Vite production build

pnpm test:e2e           # Run all Playwright E2E tests (reuses running dev server)
pnpm test:e2e:ui        # Playwright interactive UI
pnpm test:e2e --grep "chat panel"  # Run a single test by name
```

> **Node version:** The active system Node may be too old. Always run `nvm use 20` before dev or test commands.

## Architecture

### Data layer — two parallel in-memory stores

The app has **no backend**. All data lives in JavaScript module-level arrays that reset on page reload.

| Store | Location | Used by |
|---|---|---|
| `appStore` (TanStack Store) | `src/stores/app-store.tsx` | Chat sidebar, archive page — reads/writes directly |
| `chatsStore` / `messagesStore` | `src/lib/api/chats.ts` | Chat detail page via TanStack Query |
| `contactsStore` / `pendingRequestsStore` | `src/lib/api/contacts.ts` | Contacts page via TanStack Query |

These two stores are **independent** and can drift. For example, sending a message via the chat detail page updates `chatsStore` but not `appStore`, so the sidebar last-message preview goes stale. This is a known gap.

### Routing

File-based routing via `@tanstack/react-router`. Route files live in `src/routes/`:

- `_auth/` — unauthenticated layout (sign-in, sign-up). **No auth guard exists** on `_app/` routes yet.
- `_app/` — main app shell with `AppSidebar`. Subroutes: `chats/`, `chats/$chatId`, `contacts/`, `contacts/$contactId`, `archive`, `settings`.

The generated route tree is at `src/routeTree.gen.ts` — **do not edit manually**.

### Server state

TanStack Query v5 with `staleTime: Infinity` globally. Freshness is managed entirely by explicit `queryClient.invalidateQueries()` calls — there is no WebSocket integration yet (the `ws-client` and `use-websocket` hook exist but are not wired to invalidation).

### UI components

shadcn/ui components live in `src/components/ui/`. These are generated files — prefer editing higher-level components in `src/components/chat/` and `src/components/contacts/` instead.

## E2E Tests

Tests live in `e2e/` and use a **Page Object Model** pattern:

- `e2e/fixtures/index.ts` — custom `test` export that suppresses the ReactQueryDevtools overlay (its SVG intercepts pointer events without this fix)
- `e2e/pages/` — page objects for sidebar, chats, contacts
- `e2e/tests/` — spec files; import `test`/`expect` from `../fixtures/index`, not from `@playwright/test`

All tests run against the dev server at `localhost:5173`. Seed data is defined in `src/lib/data.ts`: two chats (Alice Johnson `chat-1`, Dario Amodei `chat-2`), three contacts, one inbound request (Diana Prince), one outbound request (Eve Martinez).

## CI

`.github/workflows/e2e.yml` runs on every PR:
- `checks` job: lint + typecheck (parallel with e2e)
- `e2e` job: Playwright tests with pnpm store and Playwright browser caches
- `auto-merge` job: squash-merges the PR if both jobs pass
