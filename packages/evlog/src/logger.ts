import type { EnvironmentContext, Log, LogLevel, LoggerConfig, RequestLogger } from './types'
import { colors, detectEnvironment, formatDuration, getLevelColor, isDev } from './utils'

let globalEnv: EnvironmentContext = {
  service: 'app',
  environment: 'development',
}

let globalPretty = isDev()

/**
 * Initialize the logger with configuration.
 * Call this once at application startup.
 */
export async function initLogger(config: LoggerConfig = {}): Promise<void> {
  const detected = await detectEnvironment()

  globalEnv = {
    service: config.env?.service ?? detected.service ?? 'app',
    environment: config.env?.environment ?? detected.environment ?? 'development',
    version: config.env?.version ?? detected.version,
    commitHash: config.env?.commitHash ?? detected.commitHash,
    region: config.env?.region ?? detected.region,
  }

  globalPretty = config.pretty ?? isDev()
}

/**
 * Initialize the logger synchronously (uses only env vars, no package.json).
 */
export function initLoggerSync(config: LoggerConfig = {}): void {
  const env = typeof process !== 'undefined' ? process.env : {}

  globalEnv = {
    service: config.env?.service ?? env.SERVICE_NAME ?? 'app',
    environment: config.env?.environment ?? env.NODE_ENV ?? 'development',
    version: config.env?.version ?? env.APP_VERSION,
    commitHash: config.env?.commitHash ?? env.COMMIT_SHA ?? env.GITHUB_SHA,
    region: config.env?.region ?? env.VERCEL_REGION ?? env.AWS_REGION,
  }

  globalPretty = config.pretty ?? isDev()
}

function emitWideEvent(level: LogLevel, event: Record<string, unknown>): void {
  const formatted = {
    timestamp: new Date().toISOString(),
    level,
    ...globalEnv,
    ...event,
  }

  if (globalPretty) {
    prettyPrintWideEvent(formatted)
  } else {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    console[consoleMethod](JSON.stringify(formatted))
  }
}

function emitTaggedLog(level: LogLevel, tag: string, message: string): void {
  if (globalPretty) {
    const color = getLevelColor(level)
    const timestamp = new Date().toISOString().slice(11, 23)
    console.log(`${colors.dim}${timestamp}${colors.reset} ${color}[${tag}]${colors.reset} ${message}`)
  } else {
    emitWideEvent(level, { tag, message })
  }
}

function prettyPrintWideEvent(event: Record<string, unknown>): void {
  const { timestamp, level, service, environment, version, ...rest } = event
  const levelColor = getLevelColor(level as string)
  const ts = (timestamp as string).slice(11, 23)

  let header = `${colors.dim}${ts}${colors.reset} ${levelColor}${(level as string).toUpperCase()}${colors.reset}`
  header += ` ${colors.cyan}[${service}]${colors.reset}`

  if (rest.method && rest.path) {
    header += ` ${rest.method} ${rest.path}`
    delete rest.method
    delete rest.path
  }

  if (rest.duration) {
    header += ` ${colors.dim}${rest.duration}${colors.reset}`
    delete rest.duration
  }

  if (rest.status) {
    const statusColor = (rest.status as number) >= 400 ? colors.red : colors.green
    header += ` ${statusColor}${rest.status}${colors.reset}`
    delete rest.status
  }

  console.log(header)

  if (Object.keys(rest).length > 0) {
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        const formatted = typeof value === 'object' ? JSON.stringify(value) : value
        console.log(`  ${colors.dim}${key}:${colors.reset} ${formatted}`)
      }
    }
  }
}

function createLogMethod(level: LogLevel) {
  return function logMethod(tagOrEvent: string | Record<string, unknown>, message?: string): void {
    if (typeof tagOrEvent === 'string' && message !== undefined) {
      emitTaggedLog(level, tagOrEvent, message)
    } else if (typeof tagOrEvent === 'object') {
      emitWideEvent(level, tagOrEvent)
    } else {
      emitTaggedLog(level, 'log', String(tagOrEvent))
    }
  }
}

/**
 * Simple logging API - as easy as console.log
 *
 * @example
 * ```ts
 * log.info('auth', 'User logged in')
 * log.error({ action: 'payment', error: 'failed' })
 * ```
 */
export const log: Log = {
  info: createLogMethod('info'),
  error: createLogMethod('error'),
  warn: createLogMethod('warn'),
  debug: createLogMethod('debug'),
}

interface RequestLoggerOptions {
  method?: string
  path?: string
  requestId?: string
}

/**
 * Create a request-scoped logger for building wide events.
 *
 * @example
 * ```ts
 * const log = createRequestLogger({ method: 'POST', path: '/checkout' })
 * log.set({ user: { id: '123' } })
 * log.set({ cart: { items: 3 } })
 * log.emit()
 * ```
 */
export function createRequestLogger(options: RequestLoggerOptions = {}): RequestLogger {
  const startTime = Date.now()
  let context: Record<string, unknown> = {
    method: options.method,
    path: options.path,
    requestId: options.requestId,
  }
  let hasError = false

  return {
    set<T extends Record<string, unknown>>(data: T): void {
      context = { ...context, ...data }
    },

    error(error: Error | string, errorContext?: Record<string, unknown>): void {
      hasError = true
      const err = typeof error === 'string' ? new Error(error) : error

      context = {
        ...context,
        ...errorContext,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      }
    },

    emit(overrides?: Record<string, unknown>): void {
      const duration = formatDuration(Date.now() - startTime)
      const level: LogLevel = hasError ? 'error' : 'info'

      emitWideEvent(level, {
        ...context,
        ...overrides,
        duration,
      })
    },

    getContext(): Record<string, unknown> {
      return { ...context }
    },
  }
}

/**
 * Get the current environment context.
 */
export function getEnvironment(): EnvironmentContext {
  return { ...globalEnv }
}
