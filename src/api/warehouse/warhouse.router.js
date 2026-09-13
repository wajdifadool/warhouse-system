const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'

const {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require('./warehouse.controller')

// apply middleware to all routes
router.use(protect)
router.use(authorize(ADMIN_STRING))

router.route('/').get(getWarehouses).post(createWarehouse)
router
  .route('/:id')
  .get(getWarehouse)
  .put(updateWarehouse)
  .delete(deleteWarehouse)

module.exports = router
