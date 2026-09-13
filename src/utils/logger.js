const pino = require('pino')

const isDevelopment = process.env.NODE_ENV !== 'production'

const logger = pino({
  // Filter out noise in production
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'warn'),

  // Use pretty-printing in development, raw JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          hideObject: true, // 👇 This completely hides all extra data in the console
        },
      }
    : undefined, // Add file/external transports here for production later

  // Global context stamped on every log
  base: {
    env: process.env.NODE_ENV || 'development',
    app: 'express-api-backend',
  },

  // NEVER log sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.token',
      'password',
    ],
    censor: '[HIDDEN]',
  },
})

module.exports = logger
