const mongoose = require('mongoose')
const Inventory = require('../../models/Inventory')
const Location = require('../../models/Location')
const Warehouse = require('../../models/Warehouse')
const Product = require('../../models/Product')
const InventoryMovement = require('../../models/InventoryMovement')

const asyncHandler = require('../../middleware/asyncHandler')
const ErrorResponse = require('../../utils/ErrorResponse')
const { paginate } = require('../../utils/pagination')
const { AuditActions, AuditResources } = require('../audit/audit.constants')
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

  // AUDIT
  res.locals.audit = {
    action: AuditActions.INVENTORY_CREATED,
    resourceType: AuditResources.INVENTORY,
    resourceId: inventory._id,
    metadata: {
      warehouse,
      product,
      location,
    },
  }

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

// @desc    Get Inventory
// @route   GET /api/v1/inventory
// @route   GET /api/v1/products/:productId/inventory
// @route   GET /api/v1/warehouses/:warehouseId/inventory
// @access  Private/Admin/Manager
exports.GetAllInventory = asyncHandler(async (req, res, next) => {
  const { productId, warehouseId } = req.params

  const queryParams = {
    ...req.query,
    ...(productId && { product: productId }),
    ...(warehouseId && { warehouse: warehouseId }),
  }

  const result = await paginate(Inventory, queryParams)

  res.locals.statusCode = 200
  res.locals.data = result
  res.locals.logMessage = 'Inventory Retrieved'

  next()
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

  // AUDIT
  res.locals.audit = {
    action: AuditActions.INVENTORY_UPDATED,
    resourceType: AuditResources.INVENTORY,
    resourceId: inventory._id,
    metadata: {
      quantity: req.body.quantity,
    },
  }

  res.locals.statusCode = 200
  res.locals.data = inventory
  res.locals.logMessage = 'Inventory Retrived'

  next()
})

// @desc    Transfer inventory from one location to another
// @route   POST /api/v1/inventory/transfer
// @access  Private/Admin/Manager
exports.createInventoryTransfer = asyncHandler(async (req, res, next) => {
  // const { productId, fromLocationId, toLocationId, quantity, reason } = req.body
  const {
    productId,
    warehouseId,
    fromLocationId,
    toLocationId,
    quantity,
    reason,
    type,
    referenceId,
  } = req.body

  // ============================================================
  // 1. Validate required fields
  //
  // These values are required because we need to know:
  // - Which product are we moving?
  // - Where is it coming from?
  // - Where is it going?
  // - How many units are we moving?
  // ============================================================

  if (!productId || !fromLocationId || !toLocationId || !quantity) {
    // TODO: update : if quantity is 0, it will tell that quatniy is zero
    res.status(400)
    throw new Error(
      'productId, fromLocationId, toLocationId and quantity are required'
    )
  }

  // Quantity must be greater than zero.
  if (quantity <= 0) {
    res.status(400)
    throw new Error('Quantity must be greater than 0')
  }

  // It doesn't make sense to transfer inventory
  // from a location back to the same location.
  if (fromLocationId === toLocationId) {
    res.status(400)
    throw new Error('From location and to location cannot be the same')
  }

  // ============================================================
  // 2. Validate ObjectIds
  //
  // If someone sends:
  //
  // productId: "hello"
  //
  // Mongoose could throw a CastError when we call findById().
  // We return a clean 400 error instead.
  // ============================================================

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400)
    throw new Error(`Invalid product ID: ${productId}`)
  }

  if (!mongoose.Types.ObjectId.isValid(fromLocationId)) {
    res.status(400)
    throw new Error(`Invalid from location ID: ${fromLocationId}`)
  }

  if (!mongoose.Types.ObjectId.isValid(toLocationId)) {
    res.status(400)
    throw new Error(`Invalid to location ID: ${toLocationId}`)
  }

  // ============================================================
  // 3. Check that the product exists
  // ============================================================

  const productExists = await Product.findById(productId)

  if (!productExists) {
    req.log.warn(
      { productId },
      'Attempted inventory transfer for non-existent product'
    )

    res.status(404)
    throw new Error(`Product with ID ${productId} not found`)
  }

  // ============================================================
  // 4. Get both locations
  //
  // We need the actual Location documents because the destination
  // inventory requires a warehouse.
  //
  // Your Inventory schema requires:
  //
  // product
  // warehouse
  // location
  // quantity
  //
  // So when creating inventory at the destination, we need:
  //
  // toLocation.warehouse
  //
  // ============================================================

  const [fromLocation, toLocation] = await Promise.all([
    Location.findById(fromLocationId),
    Location.findById(toLocationId),
  ])

  if (!fromLocation) {
    req.log.warn(
      { locationId: fromLocationId },
      'Attempted inventory transfer from non-existent location'
    )

    res.status(404)
    throw new Error(`Location with ID ${fromLocationId} not found`)
  }

  if (!toLocation) {
    req.log.warn(
      { locationId: toLocationId },
      'Attempted inventory transfer to non-existent location'
    )

    res.status(404)
    throw new Error(`Location with ID ${toLocationId} not found`)
  }

  // ============================================================
  // 5. Start MongoDB transaction
  //
  // A transfer changes multiple documents:
  //
  // Source inventory:
  //     quantity decreases
  //
  // Destination inventory:
  //     quantity increases
  //
  // InventoryTransfer:
  //     new transfer record
  //
  // We want ALL of these operations to succeed.
  //
  // If one fails, MongoDB rolls back ALL changes.
  //
  // Example:
  //
  // Source:      50 -> 40
  // Destination: 20 -> 30
  // Transfer:    created
  //
  // If creating the transfer fails, MongoDB rolls back:
  //
  // Source:      50
  // Destination: 20
  // Transfer:    not created
  //
  // ============================================================

  const session = await mongoose.startSession()

  try {
    let transfer

    await session.withTransaction(async () => {
      // ========================================================
      // 6. Find inventory at the SOURCE location
      //
      // Your unique index guarantees that there should only be
      // one inventory document for:
      //
      // product + location
      //
      // ========================================================

      const sourceInventory = await Inventory.findOne({
        product: productId,
        location: fromLocationId,
      }).session(session)

      if (!sourceInventory) {
        res.status(404)
        throw new Error(
          `No inventory found for product ${productId} at location ${fromLocationId}`
        )
      }

      // ========================================================
      // 7. Make sure there is enough inventory
      //
      // Example:
      //
      // Current quantity = 5
      // Requested transfer = 10
      //
      // We cannot transfer 10 because only 5 exist.
      // ========================================================

      if (sourceInventory.quantity < quantity) {
        res.status(400)
        throw new Error(
          `Insufficient inventory. Available: ${sourceInventory.quantity}, requested: ${quantity}`
        )
      }

      // ========================================================
      // 8. Find inventory at the DESTINATION location
      //
      // There are two possibilities:
      //
      // A. Inventory already exists
      //    -> increase its quantity
      //
      // B. Inventory doesn't exist
      //    -> create a new inventory document
      // ========================================================

      let destinationInventory = await Inventory.findOne({
        product: productId,
        location: toLocationId,
      }).session(session)

      // ========================================================
      // 9. Remove quantity from SOURCE
      // ========================================================

      sourceInventory.quantity -= quantity

      await sourceInventory.save({ session })

      // ========================================================
      // 10. Add quantity to DESTINATION
      // ========================================================

      if (destinationInventory) {
        // Destination already has this product.
        // Just increase its quantity.

        destinationInventory.quantity += quantity

        await destinationInventory.save({ session })
      } else {
        // Destination doesn't have this product yet.
        // Create a new Inventory document.
        //
        // IMPORTANT:
        // Your Inventory schema requires "warehouse",
        // so we get the warehouse from the destination Location.
        //
        // This assumes your Location schema contains:
        //
        // warehouse: ObjectId
        //
        const createdInventory = await Inventory.create(
          [
            {
              product: productId,
              warehouse: toLocation.warehouse,
              location: toLocationId,
              quantity,
            },
          ],
          { session }
        )

        destinationInventory = createdInventory[0]
      }

      // ========================================================
      // 11. Create the transfer history record
      //
      // This does NOT represent the current inventory.
      //
      // It records what happened:
      //
      // Product X
      // Location A -> Location B
      // Quantity: 10
      // Reason: Shelf optimization
      // ========================================================

      const createdTransfer = await InventoryMovement.create(
        [
          {
            productId,
            warehouseId,
            fromLocationId,
            toLocationId,
            quantity,
            type,
            reason,
            performedBy: req.user._id,
            referenceId,
          },
        ],
        { session }
      )

      transfer = createdTransfer[0]
    })

    // ============================================================
    // 12. Transaction completed successfully
    //
    // At this point:
    //
    // - Source quantity was decreased
    // - Destination quantity was increased/created
    // - Transfer history was created
    //c
    // ============================================================

    // AUDIT TODO:
    res.locals.audit = {
      action: AuditActions.INVENTORY_TRANSFER,
      resourceType: AuditResources.INVENTORY,
      resourceId: transfer._id,
      metadata: {
        productId,
        warehouseId,
        fromLocationId,
        toLocationId,
        quantity,
        type,
        reason,
        performedBy: req.user._id,
        referenceId,
      },
    }

    res.locals.statusCode = 201
    res.locals.data = transfer
    res.locals.logMessage = 'Inventory transferred successfully'

    next()
  } finally {
    // Always close the MongoDB session.
    await session.endSession()
  }
})
