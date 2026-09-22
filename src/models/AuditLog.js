const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., "INVENTORY_TRANSFER"
    },
    resourceType: {
      type: String,
      required: true, // e.g., "Inventory"
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Allows flexible key-value pairs like { fromLocation: "A-01", toLocation: "B-02", quantity: 10 }
      default: {},
    },
    ipAddress: {
      type: String, // e.g., "127.0.0.1"
    },
  },
  {
    // Only enabling createdAt aligns with the requirement that Audit logs must be append-only
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
)

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

module.exports = AuditLog
