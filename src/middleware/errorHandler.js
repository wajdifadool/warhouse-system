const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // 1. Log the error
  // Passing { err } helps Pino format the error object correctly.
  // Passing err.message as the second argument ensures the error text prints to your console
  // even though your pino-pretty config has hideObject: true.
  logger.error({ err }, err.message)

  // 2. Extract status and custom code (default to 500 and SERVER_ERROR)
  const statusCode = err.statusCode || 500
  const code = err.code || 'SERVER_ERROR'

  // 3. Security: Never leak internal server details in production
  const isProduction = process.env.NODE_ENV === 'production'
  const message =
    isProduction && statusCode === 500 ? 'Internal Server Error' : err.message

  // 4. Return the exact response format required by the SRS
  res.status(statusCode).json({
    success: false,
    error: {
      code: code,
      message: message,
      // Only append the stack trace if we are NOT in production
      stack: !isProduction ? err.stack : undefined,
    },
  })
}

module.exports = errorHandler
