import { defineHandler } from 'nitro/h3'
import { useLogger } from 'evlog'

export default defineHandler(async (event) => {
  // @ts-expect-error - TODO: update on v3 release
  const logger = useLogger(event)

  logger.set({
    user: { id: 'user_123', plan: 'premium' },
    action: 'test_success',
  })

  await new Promise(resolve => setTimeout(resolve, 500))
  logger.set({ processingStep: 'validation' })

  await new Promise(resolve => setTimeout(resolve, 300))
  logger.set({ processingStep: 'complete' })

  return {
    success: true,
    message: 'Request processed successfully',
    timestamp: new Date().toISOString(),
  }
})
