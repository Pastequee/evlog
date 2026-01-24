import { defineHandler } from 'nitro/h3'

export default defineHandler(() => {
  return {
    message: 'evlog Nitro Playground',
    endpoints: [
      'GET /api/test/success',
      'GET /api/test/error',
      'GET /api/test/wide-event',
    ],
  }
})
