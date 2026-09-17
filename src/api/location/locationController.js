const Location = require('../../models/Location')
const Warehouse = require('../../models/Warehouse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Create new location
// @route   POST /api/v1/locations
// @access  Private/Admin/Manager
exports.createLocation = asyncHandler(async (req, res, next) => {
  const warehouseExists = await Warehouse.findById(req.body.warehouse)

  if (!warehouseExists) {
    req.log.warn(
      { warehouseId: req.body.warehouse },
      'Attempted to create location for non-existent warehouse'
    )
    res.status(404)
    throw new Error(`Warehouse with ID ${req.body.warehouse} not found`)
  }

  const location = await Location.create(req.body)

  // Pass data and instructions down the pipeline
  res.locals.statusCode = 201
  res.locals.data = location
  res.locals.logMessage = 'New location created'

  next()
})

// @desc    Get all locations
// @route   GET /api/v1/locations
// @access  Private
exports.getLocations = asyncHandler(async (req, res, next) => {
  const { warehouse, zone, aisle } = req.query
  const filter = {}

  if (warehouse) filter.warehouse = warehouse
  if (zone) filter.zone = zone
  if (aisle) filter.aisle = aisle

  // populate, replaces a referenced ID (ObjectId) in a document with the actual document data from another collection. It acts similarly to a JOIN statement in SQL or the $lookup operator in native MongoDB
  const locations = await Location.find(filter).populate('warehouse', 'name')

  res.locals.statusCode = 200
  res.locals.data = locations
  res.locals.logMessage = `Fetched ${locations.length} locations`

  next()
})

// @desc    Get single location
// @route   GET /api/v1/locations/:id
// @access  Private
exports.getLocation = asyncHandler(async (req, res, next) => {
  const location = await getLocationById(req.params.id, {
    populate: {
      path: 'warehouse',
      select: 'name',
    },
  })

  if (!location) {
    req.log.warn({ locationId: req.params.id }, 'Location not found')
    res.status(404)

    throw new Error('Location not found') // Let your global error handler catch this
  }

  res.locals.statusCode = 200
  res.locals.data = location

  next()
})

// @desc    Update location
// @route   PUT /api/v1/locations/:id
// @access  Private/Admin/Manager
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const location = await getLocationById(req.params.id)

  if (!location) {
    req.log.warn(
      { locationId: req.params.id },
      'Location update failed: Not found'
    )
    res.status(404)
    throw new Error('Location not found')
  }

  Object.assign(location, req.body)
  await location.save()

  res.locals.statusCode = 200
  res.locals.data = location
  res.locals.logMessage = 'Location updated'

  next()
})

// @desc    Delete location
// @route   DELETE /api/v1/locations/:id
// @access  Private/Admin
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await getLocationById(req.params.id)

  if (!location) {
    req.log.warn(
      { locationId: req.params.id },
      'Location deletion failed: Not found'
    )
    res.status(404)
    throw new Error('Location not found')
  }

  await location.deleteOne()

  res.locals.statusCode = 200
  res.locals.data = {}
  res.locals.logMessage = 'Location deleted'

  next()
})

const getLocationById = async (locationId, { populate = [] } = {}) => {
  let query = Location.findById(locationId)
  if (populate.length) {
    query.populate(populate)
  }
  return query
}
