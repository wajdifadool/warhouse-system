const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../../middleware/auth')
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
  getProductByBySKU,
} = require('./products.controller')

const ADMIN = 'admin'
const MANAGER = 'manager'
const WORKER = 'worker'

router.use(protect)
router.use(authorize(ADMIN, MANAGER, WORKER))

router.get('/', getProducts)
router.get('/barcode/:barcode', getProductByBarcode)
router.get('/sku/:sku', getProductByBySKU)
router.post('/', createProduct)
router.get('/:id', getProduct)
router.put('/:id', updateProduct)

router.delete('/:id', authorize(ADMIN, MANAGER), deleteProduct) //admin + manager

// TODO:Add Other Middlewares !

module.exports = router
