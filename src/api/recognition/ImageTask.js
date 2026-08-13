// Instead of separate "Images" and "OCR_Results" collections, this combines them. Your Express backend will create this document with a pending status. Later, your background worker (via Redis/Bull or similar) will process the image, update the status to completed, and save the extracted data right here.

const mongoose = require('mongoose')

const ImageTaskSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Please provide the image URL or path'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // The raw data returned by your OCR/Image Recognition script
    ocrResults: {
      type: mongoose.Schema.Types.Mixed, // Allows you to store flexible JSON objects
      default: {},
    },
    errorLog: {
      type: String, // Useful if the AI script fails
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ImageTask', ImageTaskSchema)
