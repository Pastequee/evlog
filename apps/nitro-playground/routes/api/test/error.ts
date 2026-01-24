import { HTTPError, defineHandler } from 'nitro/h3'
import { useLogger } from 'evlog'

export default defineHandler(async (event) => {
  // @ts-expect-error - TODO: update on v3 release
  const logger = useLogger(event)

  logger.set({
    user: { id: 'user_456', plan: 'free' },
    action: 'test_error',
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  logger.error(new Error('Payment processing failed'), {
    paymentMethod: 'card',
    amount: 9999,
    reason: 'Card declined by issuer',
  })

  logger.emit()

  throw new HTTPError({
    statusCode: 400,
    message: 'Payment processing failed',
  })
})
