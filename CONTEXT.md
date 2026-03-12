# WhatsApp Clone Starter — Context

## Executive Summary

A workshop-ready WhatsApp clone frontend — a React 19 + TypeScript SPA with routing, auth, real-time WebSocket messaging, contacts management, and a polished UI. Designed as a starting point for a Claude Code workshop, connecting to a pre-deployed Railway backend.

**What it is:** Fully scaffolded frontend. Backend is treated as a black box.
**What it is not:** Full-stack. No database, no server code, no tests.
**Workshop goal:** Use Claude Code to implement, extend, or refactor features in a realistic, non-trivial codebase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9, Vite 7 |
| Routing | TanStack Router (file-based, type-safe) |
| Server state | TanStack Query v5 (suspense + loaders) |
| Client state | TanStack Store |
| Auth | better-auth (email/password + Google OAuth) |
| Real-time | ReconnectingWebSocket |
| UI | shadcn/ui (57 components), Radix, Tailwind CSS v4 |
| HTTP | Axios (cookie-based auth) |
| Icons | HugeIcons |
| Mock layer | MSW (Mock Service Worker) |

---

## Working Instructions

### 1. Initial Setup

```bash
pnpm install

# Use mock data (offline) OR keep existing .env for live Railway backend
cp .env.example .env

pnpm dev  # → http://localhost:5173
```

See `MSW_SETUP.md` for full offline mock mode setup.

### 2. Project Structure

```
src/
├── routes/          # Pages — one file per route (TanStack Router)
├── components/
│   ├── chat/        # Chat-specific components
│   ├── contacts/    # Contacts management components
│   └── ui/          # 57 generic shadcn/ui primitives
├── hooks/           # Custom React hooks (WebSocket, current user, etc.)
├── queries/         # TanStack Query definitions (chats, contacts)
├── stores/          # Client state (app-store, ws-store)
└── lib/
    ├── api/         # API call functions
    ├── api-client.ts
    ├── auth-client.ts
    ├── ws-client.ts   # WebSocket singleton
    └── data.ts        # Mock data
```

### 3. Key Files for Feature Work

| Task | File |
|---|---|
| Add a new page/route | `src/routes/_app/` |
| Modify chat UI | `src/components/chat/chat-panel.tsx` |
| Add an API call | `src/lib/api/` → wire up in `src/queries/` |
| Handle a new WebSocket event | `src/lib/ws-types.ts` + `src/hooks/use-websocket.ts` |
| Add client state | `src/stores/app-store.tsx` |
| Change auth flow | `src/lib/auth-client.ts`, `src/routes/_auth/` |

### 4. Commands

```bash
pnpm dev       # Hot-reload dev server
pnpm build     # Type-check + production build
pnpm lint      # ESLint
pnpm preview   # Serve production build locally
```

---

## Recommendations

### Immediate
1. **Add tests** — biggest gap. Use Vitest + React Testing Library. Query/store layers are well-isolated.
2. **Wire up stubbed features** — reactions, message edits, file upload, read receipts exist in UI but may not be connected end-to-end.
3. **Complete Settings page** — `src/routes/_app/settings.tsx` is a placeholder. Start with profile editor (username, bio, avatar).
4. **MSW offline mode** — follow `MSW_SETUP.md` to remove dependency on the live Railway backend.

### Medium-Term
5. **Error boundaries** — Suspense is used throughout but there are no `<ErrorBoundary>` components.
6. **Optimistic updates** — message sends and reactions should update UI immediately, roll back on failure.
7. **Infinite scroll** — `infiniteQuery` is configured; ensure the UI triggers fetch-next-page on scroll up.
8. **Accessibility audit** — verify keyboard navigation and ARIA labels on chat input and message list.

### Longer-Term
9. **Env variable validation** — add Zod validation of `import.meta.env` at startup.
10. **CI pipeline** — add GitHub Actions for lint + build + test on PRs.
11. **Backend ownership** — Railway backend is a shared demo instance; own it for a real project.
12. **Group chats** — WebSocket types support group messages (`ws-types.ts`) but the UI only handles 1:1.

---

## Claude Code Workshop Tips

- `/explain` complex files like `use-websocket.ts` or `app-store.tsx` before modifying them.
- Describe features in plain English — Claude Code will write and wire them up.
- Ask Claude Code to generate tests for specific hooks or query functions.
- Use Claude Code for code review focused on React 19 patterns or accessibility.
