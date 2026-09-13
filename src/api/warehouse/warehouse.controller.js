const Warehouse = require('./Warehouse')
const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all warehouses
// @route   GET /api/v1/warehouses
// @access  Private
exports.getWarehouses = asyncHandler(async (req, res, next) => {
  const warehouses = await Warehouse.find()
  res.status(200).json({
    success: true,
    data: warehouses,
  })
})

// @desc    Get single warehouse
// @route   GET /api/v1/warehouses/:id
// @access  Private
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
