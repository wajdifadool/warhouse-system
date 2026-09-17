const Product = require('../../models/Product')
const ErrorResponse = require('../../utils/ErrorResponse')
const { paginate } = require('../../utils/pagination')

const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public (or Private depending on your auth)
// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public (or Private depending on your auth)
exports.getProducts = asyncHandler(async (req, res, next) => {
  const result = await paginate(Product, req.query)

  // 10. Send Response
  res.status(200).json({
    success: true,
    count: result.length,
    ...result,
  })
})

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: product,
  })
})

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    data: { product },
  })
})

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns the updated document
    runValidators: true, // Ensures schema validation rules are checked
  })

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: product,
  })
})

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    )
  }

  await product.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get product by BarCode
// @route   GET /api/v1/products/barcode/:barcode
// @access  Public
exports.getProductByBarcode = asyncHandler(async (req, res, next) => {
  const barcode = req.params.barcode
  const product = await Product.findOne({ barcode })
  res.status(200).json({
    success: true,
    data: product,
  })
})

// @desc    Get product by sku
// @route   GET /api/v1/products/barcode/:sku
// @access  Public
exports.getProductByBySKU = asyncHandler(async (req, res, next) => {
  const sku = req.params.sku
  const product = await Product.findOne({ sku })
  res.status(200).json({
    success: true,
    data: product,
  })
})
