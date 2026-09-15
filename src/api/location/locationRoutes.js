const express = require('express')
const router = express.Router()

// Middleware imports
const { protect, authorize } = require('../../middleware/auth') // Your security middleware
const { businessLogger } = require('../../middleware/loggerMiddleware')
const { sendResponse } = require('../../middleware/responseMiddleware')

// Controller imports
const {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
} = require('./locationController')

// Define the Roles constants (assuming you have these in a constants file or similar)
const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'
const USER_STRING = 'user'

// Routes for /api/v1/locations
router
  .route('/')
  .get(protect, getLocations, businessLogger, sendResponse)
  .post(
    protect,
    authorize(ADMIN_STRING, MANAGER_STRING),
    createLocation,
    businessLogger,
    sendResponse
  )

router
  .route('/:id')
  .get(protect, getLocation, businessLogger, sendResponse)
  .put(
    protect,
    authorize(ADMIN_STRING, MANAGER_STRING),
    updateLocation,
    businessLogger,
    sendResponse
  )
  .delete(
    protect,
    authorize(ADMIN_STRING), // Maybe only admins can delete?
    deleteLocation,
    businessLogger,
    sendResponse
  )

module.exports = router
