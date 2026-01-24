# evlog

<!-- automd:badges color="black" license name="evlog" -->

[![npm version](https://img.shields.io/npm/v/evlog?color=black)](https://npmjs.com/package/evlog)
[![npm downloads](https://img.shields.io/npm/dm/evlog?color=black)](https://npm.chart.dev/evlog)
[![license](https://img.shields.io/github/license/HugoRCD/evlog?color=black)](https://github.com/HugoRCD/evlog/blob/main/LICENSE)

<!-- /automd -->

A TypeScript logging library focused on **wide events** and structured error handling.

Inspired by [Logging Sucks](https://loggingsucks.com/) by [Boris Tane](https://github.com/boristane).

## Why evlog?

Traditional logging is broken:

- **Scattered logs**: A single request generates 10+ log lines across your codebase
- **Missing context**: When debugging, you're grep-ing through noise hoping to find signal
- **Useless errors**: `"Error: Something went wrong"` tells you nothing

**evlog** fixes this with:

- **Wide Events**: One comprehensive log event per request with all context
- **Structured Errors**: Errors that explain *why* they occurred and *how* to fix them
- **Request Scoping**: Accumulate context throughout the request, emit once at the end

## Installation

```bash
# npm
npm install evlog

# pnpm
pnpm add evlog

# bun
bun add evlog
```

## Quick Start

```typescript
import { createLogger, getLogger, createError } from 'evlog'

// Initialize once at app startup
createLogger({
  env: {
    service: 'api',
    environment: 'production',
    version: '1.0.0',
  },
})

const logger = getLogger()

// Simple logging
logger.log('auth', 'User logged in')

// Wide events - accumulate context, emit once
const log = logger.request({ method: 'POST', path: '/checkout' })
log.set({ user: { id: '123', plan: 'premium' } })
log.set({ cart: { items: 3, total: 9999 } })
log.emit() // Single event with all context + duration

// Structured errors
throw createError({
  message: 'Payment failed',
  why: 'Card declined by issuer',
  fix: 'Try a different payment method',
  link: 'https://docs.example.com/payments',
})
```

## Wide Events

Instead of scattering logs throughout your code:

```typescript
// ❌ Traditional logging - 10+ lines per request
console.log('Request received')
console.log('User authenticated')
console.log('Loading cart')
console.log('Processing payment')
console.log('Payment failed')
// Good luck finding what you need during an incident
```

Use wide events:

```typescript
// ✅ Wide event - one comprehensive log
const log = logger.request({ method: 'POST', path: '/checkout' })

log.set({ user: { id: '123', subscription: 'premium', accountAge: 847 } })
log.set({ cart: { id: 'cart_xyz', items: 3, total: 15999 } })
log.set({ payment: { method: 'card', provider: 'stripe' } })

if (error) {
  log.error(error, { step: 'payment', retriable: false })
}

log.emit()
// Emits single event with ALL context + automatic duration tracking
```

Output:

```json
{
  "timestamp": "2025-01-24T10:23:45.612Z",
  "level": "error",
  "service": "api",
  "method": "POST",
  "path": "/checkout",
  "duration": "1.2s",
  "user": { "id": "123", "subscription": "premium", "accountAge": 847 },
  "cart": { "id": "cart_xyz", "items": 3, "total": 15999 },
  "payment": { "method": "card", "provider": "stripe" },
  "error": { "message": "Card declined", "step": "payment", "retriable": false }
}
```

## Structured Errors

Errors should explain themselves:

```typescript
import { createError } from 'evlog'

throw createError({
  message: 'Failed to sync repository',
  why: 'GitHub API rate limit exceeded',
  fix: 'Wait 1 hour or use a different token',
  link: 'https://docs.github.com/en/rest/rate-limit',
  cause: originalError,
})
```

Console output (development):

```
EvlogError: Failed to sync repository

  Why: GitHub API rate limit exceeded
  Fix: Wait 1 hour or use a different token
  Link: https://docs.github.com/en/rest/rate-limit

  at syncRepository (src/sync.ts:42:11)
  ...
```

## Nuxt Integration

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

## API Reference

### `createLogger(config)`

Initialize the global logger instance.

```typescript
createLogger({
  env: {
    service: string      // Service name (e.g., 'api', 'worker')
    environment: string  // Environment (e.g., 'production', 'development')
    commitHash?: string  // Git commit hash
    version?: string     // App version
    region?: string      // Deployment region
  },
  pretty?: boolean       // Enable pretty printing (default: true in dev)
})
```

### `getLogger()`

Get the global logger instance.

### `logger.log(tag, message)`

Simple logging with a tag.

### `logger.info(event)` / `logger.error(event)`

Emit a wide event.

### `logger.request(context)`

Create a request-scoped logger for building wide events.

Returns a `RequestLogger` with:
- `set(context)`: Add context to the event
- `error(error, context?)`: Log an error
- `emit(overrides?)`: Emit the final event with duration

### `createError(options)`

Create a structured error.

```typescript
createError({
  message: string   // What happened
  why?: string      // Why it happened
  fix?: string      // How to fix it
  link?: string     // Documentation URL
  cause?: Error     // Original error
})
```

## Credits

This library is inspired by [Logging Sucks](https://loggingsucks.com/) by [Boris Tane](https://github.com/boristane). The wide events philosophy and structured logging approach are adapted from his excellent work.

## License

[MIT](./LICENSE)

Made by [@HugoRCD](https://github.com/HugoRCD)
