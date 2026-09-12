const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'Please add an SKU'],
      unique: false,
      trim: true,
    },

    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    barcode: {
      type: String,
      required: [true, 'Please add a barcode'],
      unique: false,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)
