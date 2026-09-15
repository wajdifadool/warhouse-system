// @desc    Standardizes all successful API responses
exports.sendResponse = (req, res, next) => {
  // If there's no data attached, something went wrong or the route doesn't exist
  if (!res.locals.data && !res.locals.message) {
    return next()
  }

  const statusCode = res.locals.statusCode || 200
  const data = res.locals.data || {}

  // Automatically calculate count if the data is an array
  const responsePayload = {
    success: true,
    ...(Array.isArray(data) && { count: data.length }),
    data: data,
  }

  res.status(statusCode).json(responsePayload)
}
