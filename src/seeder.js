const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

// Import your model

const Product = require('./api/products/Product')

// Load environment variables
// dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, 'config', '.env') })

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    // 1. Clear existing data
    await Product.deleteMany()

    // 2. Drop old indexes (This fixes the E11000 sku: null error!)
    await Product.collection.dropIndexes()
    console.log('🗑️  Old data and indexes destroyed...')

    const categories = [
      'Electronics',
      'Warehouse Supplies',
      'Hardware',
      'Safety Gear',
      'Office',
    ]

    // 3. Generate an array of 100 fake products WITH unique SKUs
    const dummyProducts = Array.from({ length: 100 }).map((_, index) => {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)]

      return {
        name: `Simulated Product ${index + 1}`,
        // Generate a unique SKU using the index and current time
        sku: `SKU-${Date.now().toString().slice(-6)}-${index + 1}`,
        description: `This is the description for product ${index + 1}.`,
        category: randomCategory,
        price: Math.floor(Math.random() * 1000) + 10,
        quantity: Math.floor(Math.random() * 50),

        barcode: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      }
    })

    // 4. Bulk insert the array into MongoDB
    await Product.insertMany(dummyProducts)

    console.log('✅ 100 Products successfully imported!')
    process.exit()
  } catch (err) {
    console.error(`❌ Error with seeder: ${err.message}`)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    await Product.deleteMany()
    console.log('🗑️  All products destroyed!')
    process.exit()
  } catch (err) {
    console.error(`❌ Error with seeder: ${err.message}`)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
