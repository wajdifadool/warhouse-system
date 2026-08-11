const Product = require('./product')
const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public (or Private depending on your auth)
// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public (or Private depending on your auth)
exports.getProducts = asyncHandler(async (req, res, next) => {
  let query

  // 1. Copy req.query
  const reqQuery = { ...req.query }

  // 2. Fields to exclude from standard Mongoose filtering
  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param])

  // 3. Create query string
  let queryStr = JSON.stringify(reqQuery)

  // 4. Create operators ($gt, $gte, $lt, $lte, $in)
  // This allows queries like: ?price[lte]=100
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  // Initialize the base query
  query = Product.find(JSON.parse(queryStr))

  // 5. Select Fields
  // Allows queries like: ?select=name,price
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  // 6. Sort
  // Allows queries like: ?sort=price,-createdAt
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    // Default sorting
    query = query.sort('-createdAt')
  }

  // 7. Pagination setup
  const page = parseInt(req.query.page, 10) || 1 // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 10 // Default to 10 items per page
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Get total document count for the specific filter
  const total = await Product.countDocuments(JSON.parse(queryStr))

  // Apply pagination to the query
  query = query.skip(startIndex).limit(limit)

  // 8. Execute query
  const products = await query

  // 9. Pagination result object (for the frontend to know if there are more pages)
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  // 10. Send Response
  res.status(200).json({
    success: true,
    count: products.length, // Number of items on THIS page
    total, // Total items in database matching the query
    pagination, // Next/Prev page metadata
    data: products,
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
    data: product,
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
