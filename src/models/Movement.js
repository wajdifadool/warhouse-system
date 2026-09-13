// This logs every single change in inventory. If an item is added, removed, or moved to a different shelf, it gets recorded here. This is crucial for fixing mistakes and tracking employee actions.

const mongoose = require('mongoose')

const MovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'TRANSFER'], // Receiving stock, Shipping stock, or Moving internally
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // You can't move 0 items
    },
    fromShelf: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shelf',
      // Not required because if it's an 'IN' movement, it comes from a truck, not a shelf
    },
    toShelf: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shelf',
      // Not required because if it's an 'OUT' movement, it leaves the warehouse
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true, // Who made the move
    },
    reference: {
      type: String,
      // Optional: A purchase order number, invoice ID, or OCR task ID
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Movement', MovementSchema)
