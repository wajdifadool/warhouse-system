// Inventory: This is the bridge. It connects a Product to a Warehouse and Shelf, and stores the current quantity.
const mongoose = require('mongoose')

const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    location: {
      type: mongoose.Schema.ObjectId,
      ref: 'Location',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be less than zero'],
      default: 0,
    },
  },
  { timestamps: true }
)

// Ensure we don't have multiple inventory records for the exact same product on the exact same shelf
InventorySchema.index({ product: 1, location: 1 }, { unique: true })

module.exports = mongoose.model('Inventory', InventorySchema)
