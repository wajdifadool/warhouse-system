const express = require('express')
const router = express.Router()

// Import the controller
const { uploadImage, getTask } = require('./recognition.controller')

// Import middlewares
const { protect } = require('../../middleware/auth')
const upload = require('../../middleware/upload')

// Define the route
// 'image' is the field name the frontend/Postman must use for the file
router.route('/upload').post(protect, upload.single('image'), uploadImage)

router.route('/:id').get(getTask)
module.exports = router
