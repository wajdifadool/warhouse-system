const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')
const colors = require('colors')

const Product = require('./models/Product')
const User = require('./models//User')
const Warehouse = require('./models/Warehouse')
// const Shelf = require('./models/Shelf')
const Inventory = require('./models/Inventory')
const Location = require('./models/Location')

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', '.env') })

// --- IMPORT DATA ---
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('🔗 Connected to Database...'.cyan)

    // 1. CLEAR EXISTING DATA
    await Inventory.deleteMany()
    await Product.deleteMany()

    await Warehouse.deleteMany()
    await User.deleteMany()
    await Location.deleteMany()

    // 2. DROP INDEXES (Prevents E11000 duplicate key errors)
    await Promise.all([
      Inventory.collection.dropIndexes().catch(() => {}),
      Product.collection.dropIndexes().catch(() => {}),

      Warehouse.collection.dropIndexes().catch(() => {}),
      User.collection.dropIndexes().catch(() => {}),
      Location.collection.dropIndexes().catch(() => {}),
    ])
    console.log('🗑️  Old data and indexes destroyed...'.red)

    // 3. CREATE USERS
    // Using .create() instead of insertMany so the pre('save') password hashing hook runs
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Warehouse Manager One',
        email: 'manager1@test.com',
        password: 'password123',
        role: 'manager',
        isActive: true,
      },
      {
        name: 'Warehouse Manager Two',
        email: 'manager2@test.com',
        password: 'password123',
        role: 'manager',
        isActive: true,
      },
    ])
    console.log('👤 Users created...'.green)

    // 4. CREATE WAREHOUSES
    const warehouses = await Warehouse.insertMany([
      {
        name: 'Main Distribution Center',
        location: '123 Industrial Parkway, NY',
        description: 'Primary hub for East Coast distribution',
        manager: users[1]._id, // Assign to Manager One
      },
      {
        name: 'West Coast Annex',
        location: '456 Tech Boulevard, CA',
        description: 'Secondary hub for West Coast operations',
        manager: users[2]._id, // Assign to Manager Two
      },
    ])
    console.log('🏭 Warehouses created...'.green)

    // 5. CREATE SHELVES
    const shelvesData = []
    warehouses.forEach((warehouse) => {
      // Create 5 shelves per warehouse
      for (let i = 1; i <= 5; i++) {
        shelvesData.push({
          code: `A-01-0${i}`,
          warehouse: warehouse._id,
          status: 'Empty',
        })
      }
    })
    const shelves = await Location.insertMany(shelvesData)
    console.log('🗄️  Shelves/Locations created...'.green)

    // 6. CREATE PRODUCTS
    const categories = [
      'Electronics',
      'Warehouse Supplies',
      'Hardware',
      'Safety Gear',
      'Office',
    ]
    const productsData = Array.from({ length: 50 }).map((_, index) => {
      return {
        name: `Simulated Product ${index + 1}`,
        sku: `SKU-${Date.now().toString().slice(-6)}-${index + 1}`,
        description: `This is the detailed description for simulated product ${
          index + 1
        }.`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: Math.floor(Math.random() * 1000) + 10,
        quantity: Math.floor(Math.random() * 50),
        // Ensures strict uniqueness for barcodes
        barcode: `100${Date.now().toString().slice(-5)}${index}`,
      }
    })
    const products = await Product.insertMany(productsData)
    console.log('📦 Products created...'.green)

    // 7. CREATE INVENTORY (The Bridge)
    const inventoryData = []

    // Put each product on 1 or 2 random shelves
    products.forEach((product) => {
      // Shuffle shelves array and pick the first 2 to ensure uniqueness (avoids the compound index error)
      const shuffledShelves = shelves
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)

      shuffledShelves.forEach((shelf) => {
        inventoryData.push({
          product: product._id,
          warehouse: shelf.warehouse, // Derived directly from the shelf to maintain logical consistency
          shelf: shelf._id,
          quantity: Math.floor(Math.random() * 50) + 1, // Random stock between 1 and 50
        })
      })
    })
    await Inventory.insertMany(inventoryData)
    console.log('🔗 Inventory mapped...'.green)

    console.log('✅ ALL DATA SUCCESSFULLY IMPORTED!'.green.inverse)
    process.exit()
  } catch (err) {
    console.error(`❌ Error with seeder: ${err.message}`.red.inverse)
    process.exit(1)
  }
}

// --- DESTROY DATA ---
const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    await Inventory.deleteMany()
    await Product.deleteMany()

    await Warehouse.deleteMany()
    await User.deleteMany()

    console.log('🗑️  All data destroyed!'.red.inverse)
    process.exit()
  } catch (err) {
    console.error(`❌ Error with seeder: ${err.message}`.red.inverse)
    process.exit(1)
  }
}

// --- COMMAND LINE ARGUMENT HANDLER ---
if (process.argv[2] === '-d') {
  destroyData()
} else if (process.argv[2] === '-i') {
  importData()
} else {
  console.log('Missing args. Use "-i" to import or "-d" to destroy.'.red.bold)
  process.exit()
}
