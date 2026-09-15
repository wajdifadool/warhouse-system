// @desc    Logs business logic events using Pino
exports.businessLogger = (req, res, next) => {
  // Only log if the controller specifically asked to by setting a logMessage
  if (res.locals.logMessage) {
    // We can pull the ID or Code from the data if it exists
    const context = {}
    if (res.locals.data && res.locals.data.code)
      context.locationCode = res.locals.data.code
    if (res.locals.data && res.locals.data._id) context.id = res.locals.data._id

    req.log.info(context, res.locals.logMessage)
  }

  next()
}
