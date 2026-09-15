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
    zone: {
      type: String,
      required: [true, 'Zone is required (e.g., A)'],
      trim: true,
      uppercase: true,
    },
    aisle: {
      type: String,
      required: [true, 'Aisle is required (e.g., 01)'],
      trim: true,
    },
    rack: {
      type: String,
      required: [true, 'Rack is required (e.g., 02)'],
      trim: true,
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

// Virtual property: Aliases 'code' as 'barcode'
// This doesn't save to the database, but it lets your frontend request location.barcode
locationSchema.virtual('barcode').get(function () {
  return this.code
})

// Optional: Auto-generate the code before saving if it wasn't provided
locationSchema.pre('validate', function (next) {
  if (!this.code && this.zone && this.aisle && this.rack) {
    this.code = `${this.zone}-${this.aisle}-${this.rack}`
  }
  // next()
})

module.exports = mongoose.model('Location', locationSchema)
