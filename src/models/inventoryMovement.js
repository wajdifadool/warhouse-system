const mongoose = require('mongoose')

const inventoryMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    fromLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    toLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'RECEIVE',
        'TRANSFER',
        'PICK',
        'PACK',
        'SHIP',
        'RETURN',
        'ADJUSTMENT',
        'DAMAGE',
        'LOSS',
      ],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    referenceId: {
      type: String, // Can store string IDs like "ORDER-10001"
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

inventoryMovementSchema.index({ productId: 1 })
inventoryMovementSchema.index({ warehouseId: 1 })
inventoryMovementSchema.index({ performedBy: 1 })
inventoryMovementSchema.index({ type: 1 })
inventoryMovementSchema.index({ createdAt: 1 })

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema)
