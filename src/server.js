const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, 'config', '.env') })
const connectDB = require('./config/db')

// Initialize express app
const app = express()

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(helmet()) // Adds security-related HTTP headers
app.use(cors()) // Enables Cross-Origin Resource Sharing
app.use(express.json()) // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })) // Parses URL-encoded data

// ==========================================
// 2. ROUTE IMPORTS
// ==========================================
// Note: Uncomment these as you create the index.js files in your api/ folders
/*

const inventoryRoutes = require('./api/inventory');
const warehouseRoutes = require('./api/warehouse');
const trackingRoutes = require('./api/tracking');
const userRoutes = require('./api/users');
*/
// const productRoutes = require('../src/api/products/products.controller')
const productRoutes = require('./api/products/products.router')
connectDB()
const authRoutes = require('./api/auth/auth.router')

const recognitionRoutes = require('./api/recognition/recognition.router')

// ==========================================
// 3. MOUNT ROUTES
// ==========================================
const API_PREFIX = '/api/v1'

// Health check endpoint (Useful for Docker/Kubernetes/Load Balancers)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

/*
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/warehouses`, warehouseRoutes);
app.use(`${API_PREFIX}/tracking`, trackingRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
*/
app.use(`${API_PREFIX}/products`, productRoutes)
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/recognition`, recognitionRoutes)

// ==========================================
// 4. ERROR HANDLING
// ==========================================

// Handle 404 - Route Not Found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.status = 404
  next(error)
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error]: ${err.message}`)

  const statusCode = err.status || 500
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      // Only show stack trace in development mode
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  })
})

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 3000

// Start server only if this file is run directly
// (Prevents address in use errors when running tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Warehouse Backend is running on http://localhost:${PORT}`)
    console.log(`🩺 Health check: http://localhost:${PORT}/health`)
  })
}

// Export for testing purposes
module.exports = app
