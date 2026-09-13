const express = require('express')
const router = express.Router()
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('./users.controller')

const { protect, authorize } = require('../../middleware/auth')
const ADMIN_STRING = 'admin'

// apply middleware to all routes
router.use(protect)
router.use(authorize(ADMIN_STRING))

router.route('/').get(getUsers).post(createUser)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
