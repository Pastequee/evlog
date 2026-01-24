# evlog

A TypeScript logging library focused on **wide events** and structured error handling.

Inspired by [Logging Sucks](https://loggingsucks.com/) by [Boris Tane](https://github.com/boristane).

## Philosophy

Traditional logging is broken. Your logs are scattered across dozens of files, each request generates 10+ log lines, and when something goes wrong, you're left grep-ing through noise hoping to find signal.

**evlog** takes a different approach:

1. **Wide Events**: One comprehensive log event per request, containing all context you need
2. **Structured Errors**: Errors that explain *why* they occurred and *how* to fix them
3. **Request Scoping**: Accumulate context throughout the request lifecycle, emit once at the end
4. **Pretty for Dev, JSON for Prod**: Human-readable in development, machine-parseable in production

## Quick Reference

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun run dev` | Start playground |
| `bun run dev:prepare` | Prepare module (generate types) |
| `bun run docs` | Start documentation site |
| `bun run build:module` | Build the module |
| `bun run test` | Run tests |
| `bun run lint` | Lint all packages |
| `bun run typecheck` | Type check all packages |

## Monorepo Structure

```
evlog/
├── apps/
│   ├── playground/          # Dev environment for testing
│   └── docs/                # Docus documentation site
├── packages/
│   └── evlog/               # Main package
│       ├── src/
│       │   ├── module.ts    # Nuxt module definition
│       │   └── runtime/     # Runtime code
│       └── test/            # Tests
└── .github/                  # CI/CD workflows
```

## Core API

### Logger

```typescript
import { createLogger, getLogger } from 'evlog'

// Initialize once at app startup
createLogger({
  env: {
    service: 'api',
    environment: 'production',
    version: '1.0.0',
  },
})

// Get logger anywhere
const logger = getLogger()

// Simple logging
logger.log('auth', 'User logged in')

// Wide events
logger.info({ userId: '123', action: 'checkout', items: 3 })
logger.error({ userId: '123', error: 'payment_failed', reason: 'card_declined' })
```

### Request Logger (Wide Events)

```typescript
const log = logger.request({ method: 'POST', path: '/checkout' })

// Accumulate context throughout the request
log.set({ user: { id: '123', plan: 'premium' } })
log.set({ cart: { items: 3, total: 9999 } })

// On error
log.error(error, { step: 'payment' })

// Emit final event with all context + duration
log.emit()
```

### Structured Errors

```typescript
import { createError, EvlogError } from 'evlog'

throw createError({
  message: 'Payment failed',
  why: 'Card declined by issuer',
  fix: 'Try a different payment method or contact your bank',
  link: 'https://docs.example.com/payments/declined',
  cause: originalError,
})
```

## Framework Integration

### Nuxt

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

### Nitro

```typescript
// nitro.config.ts or nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    plugins: ['evlog/nitro'],
  },
})
```

## Development Guidelines

### Wide Event Fields

Every wide event should include:

- **Request context**: `method`, `path`, `requestId`, `traceId`
- **User context**: `userId`, `subscription`, `accountAge`
- **Business context**: Domain-specific data (cart, order, etc.)
- **Outcome**: `status`, `duration`, `error` (if any)

### Error Structure

When creating errors, always provide:

- `message`: What happened (user-facing)
- `why`: Technical reason (for debugging)
- `fix`: Actionable solution (for developers)
- `link`: Documentation URL (optional)
- `cause`: Original error (if wrapping)

### Code Style

- Use TypeScript for all code
- Follow existing patterns in `packages/evlog/src/`
- Write tests for new functionality
- Document public APIs with JSDoc comments

## Publishing

```bash
cd packages/evlog
bun run release
```

## Credits

This library is inspired by [Logging Sucks](https://loggingsucks.com/) by [Boris Tane](https://github.com/boristane). The wide events philosophy and structured logging approach are adapted from his excellent work on making logging more useful.
