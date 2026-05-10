const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Shriyash Foods Setup...\n');

let hasErrors = false;

// Check 1: .env file
console.log('1. Checking .env file...');
if (fs.existsSync('.env')) {
    console.log('   ✅ .env file exists');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // Check for placeholder values
    if (envContent.includes('your_key_id_here') || 
        envContent.includes('your_shiprocket_email@example.com')) {
        console.log('   ⚠️  WARNING: .env contains placeholder values');
        console.log('   → Update RAZORPAY_KEY_ID and SHIPROCKET_EMAIL');
    }
} else {
    console.log('   ❌ .env file missing!');
    console.log('   → Copy .env.example to .env');
    hasErrors = true;
}

// Check 2: node_modules
console.log('\n2. Checking dependencies...');
if (fs.existsSync('node_modules')) {
    console.log('   ✅ Backend dependencies installed');
} else {
    console.log('   ❌ Backend dependencies missing!');
    console.log('   → Run: npm install');
    hasErrors = true;
}

if (fs.existsSync('client/node_modules')) {
    console.log('   ✅ Frontend dependencies installed');
} else {
    console.log('   ❌ Frontend dependencies missing!');
    console.log('   → Run: cd client && npm install');
    hasErrors = true;
}

// Check 3: MongoDB connection
console.log('\n3. Checking MongoDB...');
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shriyash-foods';

mongoose.connect(mongoUri, { 
    serverSelectionTimeoutMS: 3000 
})
.then(() => {
    console.log('   ✅ MongoDB connected successfully');
    
    // Check 4: Products in database
    const Product = require('./server/models/Product');
    return Product.countDocuments();
})
.then(count => {
    console.log(`\n4. Checking products in database...`);
    if (count > 0) {
        console.log(`   ✅ ${count} products found`);
    } else {
        console.log('   ⚠️  No products in database');
        console.log('   → Run: node server/seed.js');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
        console.log('❌ Setup incomplete - please fix the errors above');
    } else {
        console.log('✅ Setup looks good! You can start the app now.');
        console.log('\nTo start the application:');
        console.log('  Option 1: Run start.bat (double-click)');
        console.log('  Option 2: Run npm run dev');
    }
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
})
.catch(err => {
    console.log('   ❌ MongoDB connection failed!');
    console.log('   Error:', err.message);
    console.log('\n   Solutions:');
    console.log('   1. Make sure MongoDB is installed');
    console.log('   2. Start MongoDB service');
    console.log('   3. Or use MongoDB Atlas (cloud)');
    console.log('\n   To start MongoDB:');
    console.log('   - Windows: net start MongoDB');
    console.log('   - Or install from: https://www.mongodb.com/try/download/community');
    
    hasErrors = true;
    console.log('\n' + '='.repeat(50));
    console.log('❌ Setup incomplete - please fix the errors above');
    console.log('='.repeat(50) + '\n');
    
    process.exit(1);
});
