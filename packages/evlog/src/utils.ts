import type { EnvironmentContext } from './types'

/**
 * Format duration for display
 * < 1s: shows milliseconds (e.g., "42ms")
 * >= 1s: shows seconds (e.g., "1.5s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * Check if running on client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if in development mode
 */
export function isDev(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== 'production'
  }
  return true
}

/**
 * Read package.json info (server-side only).
 */
export function getPackageInfo(): { name?: string, version?: string } {
  if (isClient()) {
    return {}
  }
  return {}
}

/**
 * Auto-detect environment context from various sources
 */
export async function detectEnvironment(): Promise<Partial<EnvironmentContext>> {
  const pkg = await getPackageInfo()
  const env = typeof process !== 'undefined' ? process.env : {}

  return {
    environment: env.NODE_ENV || 'development',
    service: env.SERVICE_NAME || pkg.name || 'app',
    version: env.APP_VERSION || pkg.version,
    commitHash: env.COMMIT_SHA
      || env.GITHUB_SHA
      || env.VERCEL_GIT_COMMIT_SHA
      || env.CF_PAGES_COMMIT_SHA,
    region: env.VERCEL_REGION
      || env.AWS_REGION
      || env.FLY_REGION
      || env.CF_REGION,
  }
}

// ANSI color codes for terminal output
export const colors = {
  reset: '\x1B[0m',
  bold: '\x1B[1m',
  dim: '\x1B[2m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',
} as const

/**
 * Get color for log level
 */
export function getLevelColor(level: string): string {
  switch (level) {
    case 'error':
      return colors.red
    case 'warn':
      return colors.yellow
    case 'info':
      return colors.cyan
    case 'debug':
      return colors.gray
    default:
      return colors.white
  }
}
