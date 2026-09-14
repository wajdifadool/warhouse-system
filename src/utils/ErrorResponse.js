class ErrorResponse extends Error {
  constructor(message, statusCode, code = 'SERVER_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

module.exports = ErrorResponse
