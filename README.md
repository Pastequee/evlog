# evlog

[![npm version](https://img.shields.io/npm/v/evlog?color=black)](https://npmjs.com/package/evlog)
[![npm downloads](https://img.shields.io/npm/dm/evlog?color=black)](https://npm.chart.dev/evlog)
[![CI](https://img.shields.io/github/actions/workflow/status/HugoRCD/evlog/ci.yml?branch=main&color=black)](https://github.com/HugoRCD/evlog/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/evlog?color=black&label=size)](https://bundlephobia.com/package/evlog)
[![Nuxt](https://img.shields.io/badge/Nuxt-black?logo=nuxt&logoColor=white)](https://nuxt.com/)
[![license](https://img.shields.io/github/license/HugoRCD/evlog?color=black)](https://github.com/HugoRCD/evlog/blob/main/LICENSE)

**Your logs are lying to you.**

A single request generates 10+ log lines. When production breaks at 3am, you're grep-ing through noise, praying you'll find signal. Your errors say "Something went wrong" – thanks, very helpful.

**evlog fixes this.** One log per request. All context included. Errors that explain themselves.

## Why evlog?

### The Problem

```typescript
// server/api/checkout.post.ts

// ❌ Scattered logs - impossible to debug
console.log('Request received')
console.log('User:', user.id)
console.log('Cart loaded')
console.log('Payment failed')  // Good luck finding this at 3am

throw new Error('Something went wrong')  // 🤷‍♂️
```

### The Solution

```typescript
// server/api/checkout.post.ts
import { useLogger } from 'evlog'

// ✅ One comprehensive event per request
export default defineEventHandler(async (event) => {
  const log = useLogger(event)  // Auto-injected by evlog

  log.set({ user: { id: user.id, plan: 'premium' } })
  log.set({ cart: { items: 3, total: 9999 } })
  log.error(error, { step: 'payment' })

  // Emits ONE event with ALL context + duration (automatic)
})
```

Output:

```json
{
  "timestamp": "2025-01-24T10:23:45.612Z",
  "level": "error",
  "service": "my-app",
  "method": "POST",
  "path": "/api/checkout",
  "duration": "1.2s",
  "user": { "id": "123", "plan": "premium" },
  "cart": { "items": 3, "total": 9999 },
  "error": { "message": "Card declined", "step": "payment" }
}
```

### Built for AI-Assisted Development

We're in the age of AI agents writing and debugging code. When an agent encounters an error, it needs **clear, structured context** to understand what happened and how to fix it.

Traditional logs force agents to grep through noise. evlog gives them:
- **One event per request** with all context in one place
- **Self-documenting errors** with `why` and `fix` fields
- **Structured JSON** that's easy to parse and reason about

Your AI copilot will thank you.

---

## Installation

```bash
npm install evlog
```

## Nuxt Integration

The recommended way to use evlog. Zero config, everything just works.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],

  evlog: {
    env: {
      service: 'my-app',
      environment: process.env.NODE_ENV,
    },
  },
})
```

That's it. Now use `useLogger(event)` in any API route:

```typescript
// server/api/checkout.post.ts
import { useLogger, defineError } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)

  // Authenticate user and add to wide event
  const user = await requireAuth(event)
  log.set({ user: { id: user.id, plan: user.plan } })

  // Load cart and add to wide event
  const cart = await getCart(user.id)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  // Process payment
  try {
    const payment = await processPayment(cart, user)
    log.set({ payment: { id: payment.id, method: payment.method } })
  } catch (error) {
    log.error(error, { step: 'payment' })

    throw defineError({
      message: 'Payment failed',
      why: error.message,
      fix: 'Try a different payment method or contact your bank',
    })
  }

  // Create order
  const order = await createOrder(cart, user)
  log.set({ order: { id: order.id, status: order.status } })

  return order
  // log.emit() called automatically at request end
})
```

The wide event emitted at the end contains **everything**:

```json
{
  "timestamp": "2026-01-24T10:23:45.612Z",
  "level": "info",
  "service": "my-app",
  "method": "POST",
  "path": "/api/checkout",
  "duration": "1.2s",
  "user": { "id": "user_123", "plan": "premium" },
  "cart": { "items": 3, "total": 9999 },
  "payment": { "id": "pay_xyz", "method": "card" },
  "order": { "id": "order_abc", "status": "created" },
  "status": 200
}
```

## Nitro Integration

Works with **any framework powered by Nitro**: Nuxt, Analog, Vinxi, SolidStart, TanStack Start, and more.

```typescript
// nitro.config.ts
export default defineNitroConfig({
  plugins: ['evlog/nitro'],
})
```

Same API, same wide events:

```typescript
// routes/api/documents/[id]/export.post.ts
import { useLogger, defineError } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)

  // Get document ID from route params
  const documentId = getRouterParam(event, 'id')
  log.set({ document: { id: documentId } })

  // Parse request body for export options
  const body = await readBody(event)
  log.set({ export: { format: body.format, includeComments: body.includeComments } })

  // Load document from database
  const document = await db.documents.findUnique({ where: { id: documentId } })
  if (!document) {
    throw defineError({
      message: 'Document not found',
      why: `No document with ID "${documentId}" exists`,
      fix: 'Check the document ID and try again',
    })
  }
  log.set({ document: { id: documentId, title: document.title, pages: document.pages.length } })

  // Generate export
  try {
    const exportResult = await generateExport(document, body.format)
    log.set({ export: { format: body.format, size: exportResult.size, pages: exportResult.pages } })

    return { url: exportResult.url, expiresAt: exportResult.expiresAt }
  } catch (error) {
    log.error(error, { step: 'export-generation' })

    throw defineError({
      message: 'Export failed',
      why: `Failed to generate ${body.format} export: ${error.message}`,
      fix: 'Try a different format or contact support',
    })
  }
  // log.emit() called automatically - outputs one comprehensive wide event
})
```

Output when the export completes:

```json
{
  "timestamp": "2025-01-24T14:32:10.123Z",
  "level": "info",
  "service": "document-api",
  "method": "POST",
  "path": "/api/documents/doc_123/export",
  "duration": "2.4s",
  "document": { "id": "doc_123", "title": "Q4 Report", "pages": 24 },
  "export": { "format": "pdf", "size": 1240000, "pages": 24 },
  "status": 200
}
```

## Structured Errors

Errors should tell you **what** happened, **why**, and **how to fix it**.

```typescript
// server/api/repos/sync.post.ts
import { useLogger, defineError } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)

  log.set({ repo: { owner: 'acme', name: 'my-project' } })

  try {
    const result = await syncWithGitHub()
    log.set({ sync: { commits: result.commits, files: result.files } })
    return result
  } catch (error) {
    log.error(error, { step: 'github-sync' })

    throw defineError({
      message: 'Failed to sync repository',
      why: 'GitHub API rate limit exceeded',
      fix: 'Wait 1 hour or use a different token',
      link: 'https://docs.github.com/en/rest/rate-limit',
      cause: error,
    })
  }
})
```

Console output (development):

```
Error: Failed to sync repository
Why: GitHub API rate limit exceeded
Fix: Wait 1 hour or use a different token
More info: https://docs.github.com/en/rest/rate-limit
```

## Standalone TypeScript

For scripts, workers, or any TypeScript project:

```typescript
// scripts/migrate.ts
import { initLogger, log, createRequestLogger } from 'evlog'

// Initialize once at script start
initLogger({
  env: {
    service: 'migration-script',
    environment: 'production',
  },
})

// Simple logging
log.info('migration', 'Starting database migration')
log.info({ action: 'migration', tables: ['users', 'orders'] })

// Or use request logger for a logical operation
const migrationLog = createRequestLogger({ action: 'full-migration' })

migrationLog.set({ tables: ['users', 'orders', 'products'] })
migrationLog.set({ rowsProcessed: 15000 })
migrationLog.emit()
```

```typescript
// workers/sync-job.ts
import { initLogger, createRequestLogger, defineError } from 'evlog'

initLogger({
  env: {
    service: 'sync-worker',
    environment: process.env.NODE_ENV,
  },
})

async function processSyncJob(job: Job) {
  const log = createRequestLogger({ jobId: job.id, type: 'sync' })

  try {
    log.set({ source: job.source, target: job.target })

    const result = await performSync(job)
    log.set({ recordsSynced: result.count })

    return result
  } catch (error) {
    log.error(error, { step: 'sync' })
    throw error
  } finally {
    log.emit()
  }
}
```

## API Reference

### `initLogger(config)`

Initialize the logger. Required for standalone usage, automatic with Nuxt/Nitro plugins.

```typescript
initLogger({
  env: {
    service: string      // Service name
    environment: string  // 'production' | 'development' | 'test'
    version?: string     // App version
    commitHash?: string  // Git commit
    region?: string      // Deployment region
  },
  pretty?: boolean       // Pretty print (default: true in dev)
})
```

### `log`

Simple logging API.

```typescript
log.info('tag', 'message')     // Tagged log
log.info({ key: 'value' })     // Wide event
log.error('tag', 'message')
log.warn('tag', 'message')
log.debug('tag', 'message')
```

### `createRequestLogger(options)`

Create a request-scoped logger for wide events.

```typescript
const log = createRequestLogger({
  method: 'POST',
  path: '/checkout',
  requestId: 'req_123',
})

log.set({ user: { id: '123' } })  // Add context
log.error(error, { step: 'x' })   // Log error with context
log.emit()                         // Emit final event
log.getContext()                   // Get current context
```

### `defineError(options)`

Create a structured error.

```typescript
defineError({
  message: string   // What happened
  why?: string      // Why it happened
  fix?: string      // How to fix it
  link?: string     // Documentation URL
  cause?: Error     // Original error
})
```

## Framework Support

evlog works with any framework powered by [Nitro](https://nitro.unjs.io/):

| Framework | Integration |
|-----------|-------------|
| **Nuxt** | `modules: ['evlog/nuxt']` |
| **Analog** | `plugins: ['evlog/nitro']` |
| **Vinxi** | `plugins: ['evlog/nitro']` |
| **SolidStart** | `plugins: ['evlog/nitro']` |
| **TanStack Start** | `plugins: ['evlog/nitro']` |
| **Standalone Nitro** | `plugins: ['evlog/nitro']` |

## Philosophy

Inspired by [Logging Sucks](https://loggingsucks.com/) by [Boris Tane](https://github.com/boristane).

1. **Wide Events**: One log per request with all context
2. **Structured Errors**: Errors that explain themselves
3. **Request Scoping**: Accumulate context, emit once
4. **Pretty for Dev, JSON for Prod**: Human-readable locally, machine-parseable in production

## License

[MIT](./LICENSE)

Made by [@HugoRCD](https://github.com/HugoRCD)
