# Shared Package — Types, Schemas, Socket Events

## Project Overview
Pure TypeScript package with Zod validation schemas, socket event type definitions, and shared helpers used by both server and client.

## Commands
| Command | Action |
|---|---|
| `pnpm build` | `tsc -p tsconfig.json` |
| `pnpm dev` | `tsc -w` |

## Source Structure
```
src/
├── index.ts          — Public API (re-exports everything)
├── helpers.ts        — Shared utility functions
├── route/            — Route path/param constants and types
├── schemas/          — Zod validation schemas (auth, conversations, messages, users)
└── sockets/          — Socket event type definitions + payload Zod schemas
```

## Code Style
- **No runtime deps** beyond `zod` and `@chat/db/schemas`
- Schemas defined with Zod — used by server pipes for validation and client forms for type inference
- Socket events typed as const maps with Zod payload schemas for type-safe emit/listen
- Import Prisma-derived Zod schemas from `@chat/db/schemas`

## Usage
- **Server**: imports schemas for Zod validation pipes in HTTP + WebSocket handlers
- **Client**: imports schemas for form validation + types, socket event types for typed Socket.io
