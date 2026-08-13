const jwt = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')
const ErrorResponse = require('../utils/ErrorResponse')
const User = require('../api/users/User')

// 🛡️ Protect routes (Authentication)
exports.protect = asyncHandler(async (req, res, next) => {
  let token

  // Check headers for the Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user by the ID embedded in the token and attach to req object
    req.user = await User.findById(decoded.id)

    next()
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
})

// 👮 Grant access to specific roles (Authorization / RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the role of the logged-in user is included in the permitted roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403 // 403 Forbidden
        )
      )
    }
    next() // User has the right role, let them through!
  }
}
