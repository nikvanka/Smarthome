const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/household-watch';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err.message));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  usageAlert: { type: Number, default: 500 },
  createdAt: { type: Date, default: Date.now }
});

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  room: { type: String, required: true },
  status: { type: String, enum: ['active', 'standby', 'inactive'], default: 'inactive' },
  currentUsage: { type: Number, default: 0 },
  dailyUsage: { type: Number, default: 0 },
  icon: { type: String, default: '⚡' },
  deviceId: { type: String, unique: true, sparse: true }, // ESP32 device ID
  createdAt: { type: Date, default: Date.now }
});

const readingSchema = new mongoose.Schema({
  deviceId: { type: String, default: 'ESP32_001' },
  voltage: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  power: { type: Number, default: 0 },
  energy: { type: Number, default: 0 },
  frequency: { type: Number, default: 50 },
  powerFactor: { type: Number, default: 0.95 },
  deviceStatus: { type: String, default: 'STANDBY' },
  sensorState: { type: Number, default: 0 },
  pulseCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const billSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billNumber: { type: String, unique: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  units: { type: Number, required: true },
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date, default: null },
  paymentMethod: { type: String, default: null },
  transactionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Device = mongoose.model('Device', deviceSchema);
const Reading = mongoose.model('Reading', readingSchema);
const Bill = mongoose.model('Bill', billSchema);

// In-memory storage for latest reading (quick access)
let latestReading = null;
let meterStreaming = false;

// ========== AUTH MIDDLEWARE ==========
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, name, role: 'admin' });
    res.status(201).json({ 
      success: true, 
      message: 'Account created! Please sign in.', 
      user: { username: user.username } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '30d' });
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        usageAlert: user.usageAlert,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ========= STREAMING CONTROL ENDPOINTS =========
app.post('/api/meter/connect', (req, res) => {
  meterStreaming = true;
  console.log('✅ Meter streaming enabled');
  res.json({ success: true, streaming: true });
});
app.post('/api/meter/disconnect', (req, res) => {
  meterStreaming = false;
  console.log('❌ Meter streaming disabled');
  res.json({ success: true, streaming: false });
});
app.get('/api/meter/status', (req, res) => {
  res.json({ success: true, streaming: meterStreaming });
});

// ========= SENSOR DATA ENDPOINT =========
app.post('/api/sensor/data', async (req, res) => {
  try {
    const sensorData = req.body;
    
    console.log('\n📊 ============= NEW SENSOR DATA =============');
    console.log(`⚡ Voltage: ${sensorData.voltage}V`);
    console.log(`🔌 Current: ${sensorData.current}A`);
    console.log(`💡 Power: ${sensorData.power}W`);
    console.log(`📈 Energy: ${sensorData.energy}kWh`);
    console.log(`📍 Device: ${sensorData.deviceId || 'ESP32_001'}`);
    console.log(`🔄 Status: ${sensorData.deviceStatus || 'N/A'}`);
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log('============================================\n');
    
    // Save to database
    const reading = new Reading(sensorData);
    await reading.save();
    
    // Update in-memory latest reading
    latestReading = {
      ...sensorData,
      timestamp: new Date()
    };
    
    res.json({ 
      success: true, 
      message: 'Data received successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error saving sensor data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========= LATEST SENSOR READING =========
app.get('/api/power/latest', auth, async (req, res) => {
  try {
    if (latestReading) {
      return res.json({
        success: true,
        data: {
          ...latestReading,
          connected: true
        }
      });
    }
    const reading = await Reading.findOne().sort({ timestamp: -1 }).limit(1);
    if (!reading) {
      return res.json({
        success: true,
        data: {
          voltage: 0,
          current: 0,
          power: 0,
          energy: 0,
          frequency: 50,
          powerFactor: 0,
          connected: false
        }
      });
    }
    res.json({
      success: true,
      data: {
        ...reading.toObject(),
        connected: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========= ENERGY STATS =========
app.get('/api/energy/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReadings = await Reading.find({
      timestamp: { $gte: today }
    }).sort({ timestamp: 1 });
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthReadings = await Reading.find({
      timestamp: { $gte: monthStart }
    }).sort({ timestamp: 1 });
    const todayUsage = todayReadings.length > 0 
      ? Math.max(0, todayReadings[todayReadings.length - 1].energy - todayReadings[0].energy)
      : 0;
    const monthlyUsage = monthReadings.length > 0
      ? Math.max(0, monthReadings[monthReadings.length - 1].energy - monthReadings[0].energy)
      : 0;
    const avgPower = todayReadings.length > 0
      ? todayReadings.reduce((sum, r) => sum + r.power, 0) / todayReadings.length
      : 0;
    res.json({
      success: true,
      data: {
        todayUsage: todayUsage.toFixed(3),
        monthlyUsage: monthlyUsage.toFixed(2),
        cost: (monthlyUsage * 0.15).toFixed(2),
        averagePower: avgPower.toFixed(2),
        readingsCount: {
          today: todayReadings.length,
          month: monthReadings.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========= HISTORICAL READINGS =========
app.get('/api/readings/history', auth, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const readings = await Reading.find({
      timestamp: { $gte: startTime }
    }).sort({ timestamp: 1 }).limit(100);
    res.json({
      success: true,
      data: readings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ... All other device, bill, settings, and PDF endpoints remain unchanged

// ========= HEALTH CHECK =========
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    latestReading: latestReading ? 'Available' : 'No data yet'
  });
});

// ========= ROOT =========
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Household Watch API</title></head>
      <body style="font-family: Arial; padding: 40px; background: #f0f0f0;">
        <h1>⚡ Household Watch Energy Monitor</h1>
        <p>Status: <strong style="color: green;">Running</strong></p>
        <h3>ESP32 Endpoints:</h3>
        <ul>
          <li><strong>POST /api/sensor/data</strong> - Receive sensor data from ESP32</li>
          <li>GET /api/power/latest - Get latest reading</li>
          <li>GET /api/energy/stats - Energy statistics</li>
          <li>GET /api/readings/history - Historical data</li>
        </ul>
        <h3>User Endpoints:</h3>
        <ul>
          <li>POST /api/auth/login - User login</li>
          <li>POST /api/auth/register - User registration</li>
          <li>GET /api/devices - Get devices</li>
          <li>GET /api/bills - Get bills</li>
        </ul>
        <h3>Latest Sensor Reading:</h3>
        <pre>${latestReading ? JSON.stringify(latestReading, null, 2) : 'No data yet - waiting for ESP32...'}</pre>
      </body>
    </html>
  `);
});

// ========= START SERVER =========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  ⚡ HOUSEHOLD WATCH BACKEND SERVER ⚡  ║
╠════════════════════════════════════════╣
║  ✅ Server: http://localhost:${PORT}      ║
║  📊 Health: http://localhost:${PORT}/health
║  📡 ESP32: http://localhost:${PORT}/api/sensor/data
║  📦 MongoDB: Connected                 ║
╚════════════════════════════════════════╝
  `);
  console.log('🔌 Waiting for ESP32 data...\n');
});
