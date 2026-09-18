const express = require('express')
const router = express.Router({ mergeParams: true })

const { protect, authorize } = require('../../middleware/auth')
const { businessLogger } = require('../../middleware/loggerMiddleware')
const { sendResponse } = require('../../middleware/responseMiddleware')

const {
  createInventory,
  GetInventory,
  GetAllInventory,
  UpdateInventory,
  createInventoryTransfer,
} = require('./inventory.controller')

const ADMIN_STRING = 'admin'

// Applies to every route in this router
router.use(protect)
router.use(authorize(ADMIN_STRING))

// Routes
router.post('/', createInventory)
router.get('/', GetAllInventory)

router.post('/transfer', createInventoryTransfer)

router.get('/:id', GetInventory)
router.put('/:id', UpdateInventory)

// Applies to every route AFTER the controller
router.use(businessLogger)
router.use(sendResponse)

module.exports = router
