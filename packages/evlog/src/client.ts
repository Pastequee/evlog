import type { Log, LogLevel } from './types'

let clientPretty = true
let clientService = 'client'

/**
 * Initialize the client logger.
 */
export function initClientLogger(options: { pretty?: boolean, service?: string } = {}): void {
  clientPretty = options.pretty ?? true
  clientService = options.service ?? 'client'
}

function emitClientWideEvent(level: LogLevel, event: Record<string, unknown>): void {
  const formatted = {
    timestamp: new Date().toISOString(),
    level,
    service: clientService,
    ...event,
  }

  if (clientPretty) {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    const { timestamp, level: lvl, service, ...rest } = formatted

    const levelColors: Record<string, string> = {
      error: 'color: #ef4444; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      info: 'color: #06b6d4; font-weight: bold',
      debug: 'color: #6b7280; font-weight: bold',
    }

    console[consoleMethod](
      `%c[${service}]%c ${lvl}`,
      levelColors[lvl] || '',
      'color: inherit',
      rest,
    )
  } else {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    console[consoleMethod](JSON.stringify(formatted))
  }
}

function emitClientTaggedLog(level: LogLevel, tag: string, message: string): void {
  if (clientPretty) {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    const levelColors: Record<string, string> = {
      error: 'color: #ef4444; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      info: 'color: #06b6d4; font-weight: bold',
      debug: 'color: #6b7280; font-weight: bold',
    }

    console[consoleMethod](
      `%c[${tag}]%c ${message}`,
      levelColors[level] || '',
      'color: inherit',
    )
  } else {
    emitClientWideEvent(level, { tag, message })
  }
}

function createClientLogMethod(level: LogLevel) {
  return function logMethod(tagOrEvent: string | Record<string, unknown>, message?: string): void {
    if (typeof tagOrEvent === 'string' && message !== undefined) {
      emitClientTaggedLog(level, tagOrEvent, message)
    } else if (typeof tagOrEvent === 'object') {
      emitClientWideEvent(level, tagOrEvent)
    } else {
      emitClientTaggedLog(level, 'log', String(tagOrEvent))
    }
  }
}

/**
 * Client-side logging API.
 */
export const clientLog: Log = {
  info: createClientLogMethod('info'),
  error: createClientLogMethod('error'),
  warn: createClientLogMethod('warn'),
  debug: createClientLogMethod('debug'),
}
