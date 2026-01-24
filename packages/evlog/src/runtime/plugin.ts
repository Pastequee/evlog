import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  // evlog plugin - logger will be initialized here
  console.log('[evlog] Plugin initialized')
})
