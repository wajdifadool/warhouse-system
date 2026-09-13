const express = require('express')
const router = express.Router()

const {
  getShelves,
  getShelf,
  createShelf,
  updateShelf,
  deleteShelf,
} = require('./shelf.controller')

const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'
const MANAGER_STRING = 'manager'

router
  .route('/')
  .get(getShelves)
  .post(authorize(ADMIN_STRING, MANAGER_STRING), createShelf)

router
  .route('/:id')
  .get(getShelf)
  .put(authorize(ADMIN_STRING, MANAGER_STRING), updateShelf)
  .delete(authorize(ADMIN_STRING, MANAGER_STRING), deleteShelf)

module.exports = router
