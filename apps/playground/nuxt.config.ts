export default defineNuxtConfig({
  modules: ['evlog/nuxt', '@nuxt/ui'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: 'latest',

  evlog: {
    env: {
      service: 'playground',
    }
  },
})
