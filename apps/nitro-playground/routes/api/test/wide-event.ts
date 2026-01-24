import { defineHandler } from 'nitro/h3'
import { useLogger } from 'evlog'

export default defineHandler(async (event) => {
  // @ts-expect-error - TODO: update on v3 release
  const logger = useLogger(event)

  await new Promise(resolve => setTimeout(resolve, 200))
  logger.set({
    user: {
      id: 'user_789',
      email: 'demo@example.com',
      plan: 'enterprise',
      accountAge: '2 years',
    },
  })

  await new Promise(resolve => setTimeout(resolve, 200))
  logger.set({
    cart: {
      items: 5,
      total: 24999,
      currency: 'USD',
    },
  })

  await new Promise(resolve => setTimeout(resolve, 200))
  logger.set({
    checkout: {
      step: 'payment',
      paymentMethod: 'card',
      billingCountry: 'US',
    },
  })

  await new Promise(resolve => setTimeout(resolve, 200))
  logger.set({
    performance: {
      dbQueries: 3,
      cacheHits: 7,
      cacheMisses: 1,
    },
  })

  return {
    success: true,
    message: 'Wide event demo',
  }
})
