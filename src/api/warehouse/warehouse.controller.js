const Warehouse = require('./Warehouse')
const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all warehouses
// @route   GET /api/v1/warehouses
// @access  Public (or Private depending on your auth)
exports.getWarehouses = asyncHandler(async (req, res, next) => {
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
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  // Initialize the base query and populate the manager field
  query = Warehouse.find(JSON.parse(queryStr)).populate('manager', 'name email')

  // 5. Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  // 6. Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    // Default sorting
    query = query.sort('-createdAt')
  }

  // 7. Pagination setup
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Get total document count for the specific filter
  const total = await Warehouse.countDocuments(JSON.parse(queryStr))

  // Apply pagination to the query
  query = query.skip(startIndex).limit(limit)

  // 8. Execute query
  const warehouses = await query

  // 9. Pagination result object
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
    count: warehouses.length,
    total,
    pagination,
    data: warehouses,
  })
})

// @desc    Get single warehouse
// @route   GET /api/v1/warehouses/:id
// @access  Public
exports.getWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.findById(req.params.id).populate(
    'manager',
    'name email'
  )

  if (!warehouse) {
    return next(
      new ErrorResponse(`Warehouse not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: warehouse,
  })
})

// @desc    Create new warehouse
// @route   POST /api/v1/warehouses
// @access  Private
exports.createWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.create(req.body)

  res.status(201).json({
    success: true,
    data: warehouse,
  })
})

// @desc    Update warehouse
// @route   PUT /api/v1/warehouses/:id
// @access  Private
exports.updateWarehouse = asyncHandler(async (req, res, next) => {
  let warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!warehouse) {
    return next(
      new ErrorResponse(`Warehouse not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: warehouse,
  })
})

// @desc    Delete warehouse
// @route   DELETE /api/v1/warehouses/:id
// @access  Private
exports.deleteWarehouse = asyncHandler(async (req, res, next) => {
  const warehouse = await Warehouse.findById(req.params.id)

  if (!warehouse) {
    return next(
      new ErrorResponse(`Warehouse not found with id of ${req.params.id}`, 404)
    )
  }

  await warehouse.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
