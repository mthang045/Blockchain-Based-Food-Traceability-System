/**
 * Database Seeder - Import sample data vào MongoDB
 * Chạy: node seed-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const { User, Product, Organization } = require('./models');

// Database connection
const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_traceability';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Load JSON files
const loadJSONFile = (filename) => {
  const filePath = path.join(__dirname, 'sample-data', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Seed functions
const seedUsers = async () => {
  try {
    const users = loadJSONFile('users.json');
    if (users.length === 0) {
      console.log('⚠️  No users data found');
      return;
    }

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert new users
    const inserted = await User.insertMany(users);
    console.log(`✅ Inserted ${inserted.length} users`);
    
    // Show sample
    console.log('   Sample users:');
    inserted.slice(0, 3).forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    return inserted;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

const seedOrganizations = async () => {
  try {
    const organizations = loadJSONFile('organizations.json');
    if (organizations.length === 0) {
      console.log('⚠️  No organizations data found');
      return;
    }

    // Clear existing organizations
    await Organization.deleteMany({});
    console.log('🗑️  Cleared existing organizations');

    // Insert new organizations
    const inserted = await Organization.insertMany(organizations);
    console.log(`✅ Inserted ${inserted.length} organizations`);
    
    // Show sample
    console.log('   Sample organizations:');
    inserted.forEach(org => {
      console.log(`   - ${org.name} (${org.type})`);
    });

    return inserted;
  } catch (error) {
    console.error('❌ Error seeding organizations:', error.message);
    throw error;
  }
};

const seedProducts = async () => {
  try {
    const products = loadJSONFile('products.json');
    if (products.length === 0) {
      console.log('⚠️  No products data found');
      return;
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Inserted ${inserted.length} products`);
    
    // Show sample
    console.log('   Sample products:');
    inserted.forEach(product => {
      console.log(`   - ${product.name} (${product.category}) - Status: ${product.status}`);
    });

    return inserted;
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  console.log('');
  console.log('═'.repeat(60));
  console.log('🌱 DATABASE SEEDER - Food Traceability System');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Connect to database
    console.log('📦 Step 1: Connecting to MongoDB...');
    await connectDatabase();
    console.log('');

    // Seed users
    console.log('👥 Step 2: Seeding Users...');
    await seedUsers();
    console.log('');

    // Seed organizations
    console.log('🏢 Step 3: Seeding Organizations...');
    await seedOrganizations();
    console.log('');

    // Seed products
    console.log('📦 Step 4: Seeding Products...');
    await seedProducts();
    console.log('');

    // Summary
    console.log('═'.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('');

    // Show statistics
    const userCount = await User.countDocuments();
    const orgCount = await Organization.countDocuments();
    const productCount = await Product.countDocuments();

    console.log('📊 Database Statistics:');
    console.log(`   • Users: ${userCount}`);
    console.log(`   • Organizations: ${orgCount}`);
    console.log(`   • Products: ${productCount}`);
    console.log('');

    console.log('🔍 Sample Queries to Try:');
    console.log('   • db.users.find({ role: "MANUFACTURER" })');
    console.log('   • db.organizations.find({ type: "FARM" })');
    console.log('   • db.products.find({ status: "Delivered" })');
    console.log('');

    console.log('🚀 You can now start the server: npm start');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═'.repeat(60));
    console.error('❌ DATABASE SEEDING FAILED');
    console.error('═'.repeat(60));
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Solution: Make sure MongoDB is running!');
      console.error('   • Start MongoDB service');
      console.error('   • Or start MongoDB Compass');
      console.error('');
    }

    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    console.log('');
  }
};

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedUsers, seedOrganizations, seedProducts };
