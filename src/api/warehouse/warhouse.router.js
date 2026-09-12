const express = require('express')
const router = express.Router()

const {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require('./warehouse.controller')

// Assuming you have your auth middleware mapped like in the product router
const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'

router
  .route('/')
  .get(getWarehouses)
  .post(authorize(ADMIN_STRING, MANAGER_STRING), createWarehouse)

router
  .route('/:id')
  .get(getWarehouse)
  .put(authorize(ADMIN_STRING, MANAGER_STRING), updateWarehouse)
  .delete(authorize(ADMIN_STRING, MANAGER_STRING), deleteWarehouse)

module.exports = router
