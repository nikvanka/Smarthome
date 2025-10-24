const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/household-watch')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'demo'], default: 'user' },
  address: String,
  phone: String,
  meterNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        username: 'admin',
        email: 'admin@household.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        phone: '1234567890',
        address: '123 Admin Street',
        meterNumber: 'MTR001'
      },
      {
        username: 'user',
        email: 'user@household.com',
        password: 'user123',
        name: 'Regular User',
        role: 'user',
        phone: '9876543210',
        address: '456 User Avenue',
        meterNumber: 'MTR002'
      },
      {
        username: 'demo',
        email: 'demo@household.com',
        password: 'demo',
        name: 'Demo Account',
        role: 'demo',
        phone: '5555555555',
        address: '789 Demo Lane',
        meterNumber: 'MTR003'
      }
    ];

    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`Created user: ${userData.username}`);
    }

    console.log('✅ All users created successfully!');
    console.log('\nLogin credentials:');
    console.log('  admin / admin123');
    console.log('  user / user123');
    console.log('  demo / demo');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

createUsers();