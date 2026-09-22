const asyncHandler = require('./asyncHandler')
const AuditLog = require('../models/AuditLog')

const auditMiddleware = asyncHandler(async (req, res, next) => {
  if (!res.locals.audit) {
    return next()
  }

  await AuditLog.create({
    userId: req.user._id,
    action: res.locals.audit.action,
    resourceType: res.locals.audit.resourceType,
    resourceId: res.locals.audit.resourceId,
    metadata: res.locals.audit.metadata,
    ipAddress: req.ip,
  })

  next()
})

module.exports = auditMiddleware
