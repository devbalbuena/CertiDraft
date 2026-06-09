import { Queue } from 'bullmq'
// BullMQ ships its own ioredis. Import from it to avoid the type mismatch
// that occurs when you pass an external ioredis Redis instance as ConnectionOptions.
import IORedis from 'bullmq/node_modules/ioredis'

const QUEUE_NAME = 'certificate-generation'

let redisConnection: InstanceType<typeof IORedis> | null = null
let queue: Queue | null = null

function getRedisConnection(): InstanceType<typeof IORedis> {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) throw new Error('REDIS_URL environment variable is not set')

    // Upstash Redis requires TLS (rediss://) and these BullMQ-specific options
    redisConnection = new IORedis(redisUrl, {
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }
  return redisConnection
}

export function getCertificateQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
    })
  }
  return queue
}

export type { Queue }
export { QUEUE_NAME }
