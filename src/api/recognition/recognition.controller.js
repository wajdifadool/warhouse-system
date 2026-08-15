const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')
const imageQueue = require('../../queues/imageQueue')
const ImageTask = require('./ImageTask')

// @desc    Upload an image for recognition
// @route   POST /api/v1/recognition/upload
// @access  Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
  // 1. Check if a file was actually uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400))
  }

  // 2. Create the ImageTask in the database
  // req.file.path contains the relative path (e.g., 'uploads/image-169...jpg')
  const imageTask = await ImageTask.create({
    imageUrl: req.file.path,
    status: 'pending',
    uploadedBy: req.user.id, // We get this from the 'protect' middleware!
  })

  // ADD THE JOB TO THE QUEUE <-- ADD THIS BLOCK
  await imageQueue.add('scan-barcodes', {
    imageTaskId: imageTask._id,
    imageUrl: req.file.path,
  })

  // 3. Send response
  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully and queued for processing',
    data: imageTask,
  })
})

// @desc    Get image task status and results
// @route   GET /api/v1/recognition/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await ImageTask.findById(req.params.id)

  if (!task) {
    return next(new ErrorResponse('Task not found', 404))
  }

  res.status(200).json({
    success: true,
    data: task,
  })
})
