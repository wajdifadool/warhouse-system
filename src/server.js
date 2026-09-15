const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const dotenv = require('dotenv')
const morgan = require('morgan')
const pinoHttp = require('pino-http')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/errorHandler.js')

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
app.use(morgan('dev'))
app.use(pinoHttp({ logger }))
// ==========================================
// 2. ROUTE IMPORTS
// ==========================================
// Note: Uncomment these as you create the index.js files in your api/ folders
/*

const inventoryRoutes = require('./api/inventory');

const trackingRoutes = require('./api/tracking');
*/
// const productRoutes = require('../src/api/products/products.controller')
const productRoutes = require('./api/products/products.router')
connectDB()
const authRoutes = require('./api/auth/auth.router')

const warehouseRoutes = require('./api/warehouse/warhouse.router')
const shelfRoutes = require('./api/shelf/shelf.router')
const recognitionRoutes = require('./api/recognition/recognition.router')
const userRoutes = require('./api/users/users.router')
const locationRoutes = require('./api/location/locationRoutes.js')

// ==========================================
// 3. MOUNT ROUTES
// ==========================================
const API_PREFIX = '/api/v1'

// Health check endpoint (Useful for Docker/Kubernetes/Load Balancers)
app.get('/health', (req, res) => {
  req.log.trace('health check')
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

/*
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);

app.use(`${API_PREFIX}/tracking`, trackingRoutes);

*/
app.use(`${API_PREFIX}/products`, productRoutes)
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/recognition`, recognitionRoutes)
app.use(`${API_PREFIX}/warehouses`, warehouseRoutes)
app.use(`${API_PREFIX}/locations`, locationRoutes)
// app.use(`${API_PREFIX}/warehouses/:warehouseId/locations`, locationRoutes) // nested Routes
app.use(`${API_PREFIX}/shelfs`, shelfRoutes)
app.use(`${API_PREFIX}/users`, userRoutes)

// ==========================================
// 4. ERROR HANDLING
// ==========================================

// Handle 404 - Route Not Found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.status = 404
  next(error)
})

app.use(errorHandler)

// // // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(`[Error]: ${err.message}`)

//   const statusCode = err.statusCode || 500
//   res.status(statusCode).json({
//     error: {
//       message: err.message || 'Internal Server Error',
//       // Only show stack trace in development mode
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//     },
//   })
// })

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
