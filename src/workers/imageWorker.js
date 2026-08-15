require('dotenv').config({
  path: require('path').resolve(__dirname, '../config/.env'),
})
const { Worker } = require('bullmq')
const ImageTask = require('../api/recognition/ImageTask')
const Product = require('../api/products/Product')
const Shelf = require('../api/warehouse/Shelf')
const Warehouse = require('../api/warehouse/WareHouse')
const Inventory = require('../api/inventory/Inventory')

const connectDB = require('../config/db')
connectDB()

const connection = {
  host: '127.0.0.1',
  port: 6379,
}

// const worker = new Worker(
//   'ImageProcessingQueue',
//   async (job) => {
//     const { imageTaskId, imageUrl } = job.data
//     console.log(
//       `[Worker] Started processing job ${job.id} for image: ${imageUrl}`
//     )

//     // 1. Update status to 'processing'
//     await ImageTask.findByIdAndUpdate(imageTaskId, { status: 'processing' })

//     // 2. SIMULATE AI WORK (e.g., Python script or Node barcode scanner)
//     // We will pause for 5 seconds to fake heavy image processing
//     await new Promise((resolve) => setTimeout(resolve, 5000))

//     // TODO: this will be the main work here
//     // The data we "extracted" from the image
//     const extractedShelfCode = 'Aisle-1-Rack-A'
//     const extractedBarcode = '111120184aaa8'

//     // --- AUDIT LOGIC START ---
//     let auditStatus = 'Pass'
//     let auditMessage = 'Product is correctly located on this shelf.'

//     // TODO: add shelfs, add
//     const shelf = await Shelf.findOne({ code: extractedShelfCode })
//     const product = await Product.findOne({ barcode: extractedBarcode })
//     console.log(product)

//     if (!shelf || !product) {
//       auditStatus = 'Fail'
//       auditMessage =
//         'Error: Scanned barcode or shelf code does not exist in the system.'
//     } else {
//       // Check if they belong together
//       const inventoryRecord = await Inventory.findOne({
//         shelf: shelf._id,
//         product: product._id,
//       })

//       if (!inventoryRecord || inventoryRecord.quantity <= 0) {
//         auditStatus = 'Fail'
//         auditMessage =
//           'Mismatch: Product found on the wrong shelf or inventory quantity is zero.'
//       }
//     }
//     // --- AUDIT LOGIC END ---

//     // 3. Update status to 'completed' and save results
//     // Save everything back to the database
//     await ImageTask.findByIdAndUpdate(imageTaskId, {
//       status: 'completed',
//       ocrResults: {
//         detectedShelfCode: extractedShelfCode,
//         detectedBarcode: extractedBarcode,
//         auditStatus,
//         auditMessage,
//       },
//       processedAt: Date.now(),
//     })
//     console.log(`[Worker] Finished job ${job.id} successfully!`)
//   },
//   { connection }
// )
// ________________
// ________________
// ________________
// ________________

const worker = new Worker(
  'ImageProcessingQueue',
  async (job) => {
    const { imageTaskId, imageUrl } = job.data
    console.log(`[Worker] Started processing job ${job.id}`)

    await ImageTask.findByIdAndUpdate(imageTaskId, { status: 'processing' })

    // Simulate 3 seconds of AI work
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // The data we "extracted" from the image
    // const extractedShelfCode = 'LOC-A4-RB'
    // const extractedBarcode = '123456789012'

    const extractedShelfCode = 'Aisle-1-Rack-A'
    const extractedBarcode = '1111201848'

    // --- AUDIT LOGIC START ---
    let auditStatus = 'Pass'
    let auditMessage = 'Product is correctly located on this shelf.'

    const shelf = await Shelf.findOne({ code: extractedShelfCode })
    const product = await Product.findOne({ barcode: extractedBarcode })
    console.log(shelf)
    console.log(product)

    if (!shelf || !product) {
      auditStatus = 'Fail'
      auditMessage =
        'Error: Scanned barcode or shelf code does not exist in the system.'
    } else {
      // Check if they belong together
      const inventoryRecord = await Inventory.findOne({
        shelf: shelf._id,
        product: product._id,
      })

      if (!inventoryRecord || inventoryRecord.quantity <= 0) {
        auditStatus = 'Fail'
        auditMessage =
          'Mismatch: Product found on the wrong shelf or inventory quantity is zero.'
      }
    }
    // --- AUDIT LOGIC END ---

    // Save everything back to the database
    await ImageTask.findByIdAndUpdate(imageTaskId, {
      status: 'completed',
      ocrResults: {
        detectedShelfCode: extractedShelfCode,
        detectedBarcode: extractedBarcode,
        auditStatus,
        auditMessage,
      },
      processedAt: Date.now(),
    })

    console.log(
      `[Worker] Finished job ${job.id} - Audit: ${auditStatus} ${auditMessage}`
    )
  },
  { connection }
)

// Error handling
worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with error ${err.message}`)
})

async function createDummyWarehouse() {
  console.log('createDummyWarehouse')
  const warehouse = await Warehouse.create({
    name: 'Main Distribution Center',
    location: '123 Industrial Road',
    description: 'Main warehouse for inventory storage.',
  })

  await Shelf.insertMany([
    {
      code: 'Aisle-1-Rack-A',
      warehouse: warehouse._id,
      capacity: 100,
    },
    {
      code: 'Aisle-1-Rack-B',
      warehouse: warehouse._id,
      capacity: 150,
    },
    {
      code: 'Aisle-2-Rack-A',
      warehouse: warehouse._id,
      capacity: 75,
    },
    {
      code: 'Aisle-2-Rack-B',
      warehouse: warehouse._id,
      capacity: 200,
    },
  ])

  console.log('Dummy warehouse and shelves created')
}

// createDummyWarehouse()
module.exports = worker
