const express = require('express')
const router = express.Router()

const { protect, authorize } = require('../../middleware/auth')
const { businessLogger } = require('../../middleware/loggerMiddleware')
const { sendResponse } = require('../../middleware/responseMiddleware')

const {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
} = require('./locationController')

const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'
const WORKER_STRING = 'worker'

router.use(protect)
router.use(authorize(ADMIN_STRING, MANAGER_STRING, WORKER_STRING))

router.get('/', getLocations)
router.post('/', createLocation)
router.get('/:id', getLocation)
router.put('/:id', updateLocation)

// DELETE needs admin only
router.delete('/:id', authorize(ADMIN_STRING), deleteLocation)

// Everything after controllers
// router.use(auditMiddleware) //TODO:
router.use(businessLogger)
router.use(sendResponse)
module.exports = router
