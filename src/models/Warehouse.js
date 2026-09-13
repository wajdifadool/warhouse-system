// This represents the physical building or main facility.
const mongoose = require('mongoose')

const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a warehouse name'],
      trim: true,
      unique: true, // E.g., "Main Distribution Center"
    },
    location: {
      type: String,
      required: [true, 'Please add a location or address'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    manager: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Links to your User model to show who is in charge
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Warehouse', WarehouseSchema)
