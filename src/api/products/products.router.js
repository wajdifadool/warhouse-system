const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('./products.controller')

const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'
router
  .route('/')
  .get(getProducts)
  .post(authorize(ADMIN_STRING, MANAGER_STRING), createProduct)

router
  .route('/:id')
  .get(getProduct)
  .put(authorize(ADMIN_STRING, MANAGER_STRING), updateProduct)
  .delete(authorize(ADMIN_STRING, MANAGER_STRING), deleteProduct)

module.exports = router
