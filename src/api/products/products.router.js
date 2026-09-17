const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
  getProductByBySKU,
} = require('./products.controller')

// worker', 'viewer', 'manager', 'admin

const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'
const USER_STRING = 'user'

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorize(USER_STRING, ADMIN_STRING, MANAGER_STRING),
    createProduct
  )

router.route('/barcode/:barcode').get(getProductByBarcode)
router.route('/sku/:sku').get(getProductByBySKU)

router
  .route('/:id')
  .get(getProduct)
  .put(authorize(ADMIN_STRING, MANAGER_STRING), updateProduct)
  .delete(authorize(ADMIN_STRING, MANAGER_STRING), deleteProduct)

module.exports = router
