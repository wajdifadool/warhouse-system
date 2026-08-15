// local Redis
const { Queue } = require('bullmq')

// Connect to local Redis (default port 6379)
const connection = {
  host: '127.0.0.1',
  port: 6379,
}

// Create the queue
const imageQueue = new Queue('ImageProcessingQueue', { connection })

module.exports = imageQueue
