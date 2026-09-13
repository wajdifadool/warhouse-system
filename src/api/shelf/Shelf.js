// This represents the specific aisles, racks, or bins inside a warehouse.
const mongoose = require('mongoose')

const ShelfSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a shelf code (e.g., Aisle-4-Rack-B)'],
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    capacity: {
      type: Number,
      default: 100, // Optional: Maximum items this shelf can hold
    },
  },
  { timestamps: true }
)

// Ensure a shelf code is unique ONLY within a specific warehouse
ShelfSchema.index({ code: 1, warehouse: 1 }, { unique: true })

module.exports = mongoose.model('Shelf', ShelfSchema)
