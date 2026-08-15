const multer = require('multer')
const path = require('path')
const ErrorResponse = require('../utils/ErrorResponse')

// 1. Configure Local Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This tells multer to save files in the root 'uploads' folder
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Creates a unique filename (e.g., image-1692881234.jpg) to prevent overwriting
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// 2. File Type Filter (Security)
const fileFilter = (req, file, cb) => {
  // Ensure the user is actually uploading an image, not a malicious script or PDF
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new ErrorResponse('Please upload a valid image file', 400), false)
  }
}

// 3. Initialize Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5000000 }, // Sets a strict 5MB limit per image
})

module.exports = upload
