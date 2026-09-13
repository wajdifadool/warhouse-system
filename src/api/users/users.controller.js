const User = require('../../models/User')
const ErrorResponse = require('../../utils/ErrorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all users
// @route   GET api/v1/users
// @access  Private (only Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  })
})

// @desc    Get single User
// @route   GET /api/v1/users/:id
// @access  Private (only Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Create new User
// @route   POST /api/v1/User
// @access  Private (only Admin)
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc    Update User
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns the updated document
    runValidators: true, // Ensures schema validation rules are checked
  })

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    )
  }

  await user.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
