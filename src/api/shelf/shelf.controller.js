const Shelf = require('../../models/Shelf')
const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all shelves
// @route   GET /api/v1/shelves
// @access  Public
exports.getShelves = asyncHandler(async (req, res, next) => {
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

  // Initialize the base query and populate the associated warehouse details
  query = Shelf.find(JSON.parse(queryStr)).populate(
    'warehouse',
    'name location'
  )

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
  const total = await Shelf.countDocuments(JSON.parse(queryStr))

  // Apply pagination to the query
  query = query.skip(startIndex).limit(limit)

  // 8. Execute query
  const shelves = await query

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
    count: shelves.length,
    total,
    pagination,
    data: shelves,
  })
})

// @desc    Get single shelf
// @route   GET /api/v1/shelves/:id
// @access  Public
exports.getShelf = asyncHandler(async (req, res, next) => {
  const shelf = await Shelf.findById(req.params.id).populate(
    'warehouse',
    'name location'
  )

  if (!shelf) {
    return next(
      new ErrorResponse(`Shelf not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: shelf,
  })
})

// @desc    Create new shelf
// @route   POST /api/v1/shelves
// @access  Private
exports.createShelf = asyncHandler(async (req, res, next) => {
  const shelf = await Shelf.create(req.body)

  res.status(201).json({
    success: true,
    data: shelf,
  })
})

// @desc    Update shelf
// @route   PUT /api/v1/shelves/:id
// @access  Private
exports.updateShelf = asyncHandler(async (req, res, next) => {
  let shelf = await Shelf.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!shelf) {
    return next(
      new ErrorResponse(`Shelf not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: shelf,
  })
})

// @desc    Delete shelf
// @route   DELETE /api/v1/shelves/:id
// @access  Private
exports.deleteShelf = asyncHandler(async (req, res, next) => {
  const shelf = await Shelf.findById(req.params.id)

  if (!shelf) {
    return next(
      new ErrorResponse(`Shelf not found with id of ${req.params.id}`, 404)
    )
  }

  await shelf.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
