import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface EnvironmentContext {
  service: string
  environment: string
  commitHash?: string
  version?: string
  region?: string
}

export interface ModuleOptions {
  /**
   * Environment context for the logger
   */
  env?: EnvironmentContext

  /**
   * Enable pretty printing in development
   * @default true in development, false in production
   */
  pretty?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'evlog',
    configKey: 'evlog',
    docs: 'https://github.com/HugoRCD/evlog',
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
