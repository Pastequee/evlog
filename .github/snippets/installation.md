```bash
# npm
npm install evlog

# pnpm
pnpm add evlog

# bun
bun add evlog
```

For Nuxt projects, add to your config:

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
