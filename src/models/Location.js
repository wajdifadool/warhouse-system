const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Location code is required (e.g., A-01-02)'],
      trim: true,
      uppercase: true, // Auto-converts 'a-01-02' to 'A-01-02' for consistency
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse reference is required'],
    },

    status: {
      type: String,
      enum: ['Empty', 'Partial', 'Full', 'Inactive'],
      default: 'Empty',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensures virtual fields show up in API responses
    toObject: { virtuals: true },
  }
)

// 🔥 CRITICAL: Prevent duplicate location codes in the SAME warehouse
locationSchema.index({ code: 1, warehouse: 1 }, { unique: true })

module.exports = mongoose.model('Location', locationSchema)
