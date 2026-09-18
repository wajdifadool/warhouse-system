const Inventory = require('../../models/Inventory')
const Location = require('../../models/Location')
const Warehouse = require('../../models/Warehouse')
const Product = require('../../models/Product')
const asyncHandler = require('../../middleware/asyncHandler')
const ErrorResponse = require('../../utils/ErrorResponse')
const { paginate } = require('../../utils/pagination')
// @desc    Create new Inventory
// @route   POST /api/v1/inventory
// @access  Private/Admin/Manager
exports.createInventory = asyncHandler(async (req, res, next) => {
  //warehouse
  const { warehouse, product, location } = req.body
  const warehouseExists = await Warehouse.findById(warehouse)
  const productExiset = await Product.findById(product)
  const LocationExiset = await Location.findById(location)

  if (!warehouseExists) {
    req.log.warn(
      { warehouseId: req.body.warehouse },
      'Attempted to create Inventory for non-existent warehouse'
    )
    res.status(404)
    throw new Error(`Warehouse with ID ${warehouse} not found`)
  }
  // Product
  if (!productExiset) {
    req.log.warn(
      { productId: req.body.product },
      'Attempted to create Invontery for non-existent product'
    )
    res.status(404)
    throw new Error(`product with ID ${product} not found`)
  }

  //   Location

  if (!LocationExiset) {
    req.log.warn(
      { locationId: req.body.location },
      'Attempted to create Invontery for non-existent Location'
    )
    res.status(404)
    throw new Error(`Location with ID ${location} not found`)
  }

  const inventory = await Inventory.create(req.body)

  // Pass data and instructions down the pipeline
  res.locals.statusCode = 201
  res.locals.data = inventory
  res.locals.logMessage = 'New Inventory created'

  next()
})

// @desc    Get Inventory
// @route   POST /api/v1/inventory/:id
// @access  Private/Admin/Manager
exports.GetInventory = asyncHandler(async (req, res, next) => {
  const inventory = await Inventory.findById(req.params.id)

  if (!inventory) {
    req.log.warn({ inventoryId: req.params.id }, 'Inventory not found')
    res.status(404)

    throw new ErrorResponse('Inventory not found') // Let your global error handler catch this
  }

  res.locals.statusCode = 203
  res.locals.data = inventory
  res.locals.logMessage = 'Inventory Retrived'

  next()
})

// @desc    Get All Inventory
// @route   POST /api/v1/inventory
// @access  Private/Admin/Manager
exports.GetAllInventory = asyncHandler(async (req, res, next) => {
  const result = await paginate(Inventory, req.query)

  // 10. Send Response
  res.status(200).json({
    success: true,
    count: result.length,
    ...result,
  })
})

// @desc    Update Inventory qunatity only
// @route   POST /api/v1/inventory/:id
// @access  Private/Admin/Manager
exports.UpdateInventory = asyncHandler(async (req, res, next) => {
  const inventory = await Inventory.findById(req.params.id)

  if (!inventory) {
    req.log.warn({ inventoryId: req.params.id }, 'Inventory not found')
    res.status(404)

    throw new ErrorResponse('Inventory not found') // Let your global error handler catch this
  }

  // Object.assign(inventory, { quantity: req.body.quantity }); the same
  inventory.quantity = req.body.quantity
  await inventory.save()

  res.locals.statusCode = 200
  res.locals.data = inventory
  res.locals.logMessage = 'Inventory Retrived'

  next()
})
