import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
};

// Generate PDF Bill
const generatePDF = (bill, userName) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 1000;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 800, 1000);
  
  // Header
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 800, 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('HOUSEHOLD WATCH', 50, 50);
  ctx.font = '14px Arial';
  ctx.fillText('Energy Billing Invoice', 50, 75);
  
  // Bill Details
  let y = 150;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('INVOICE DETAILS', 50, y);
  
  y += 40;
  ctx.font = '14px Arial';
  ctx.fillText(`Bill ID: ${bill.id}`, 50, y);
  y += 25;
  ctx.fillText(`Month: ${bill.month}`, 50, y);
  y += 25;
  ctx.fillText(`User: ${userName}`, 50, y);
  y += 25;
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 50, y);
  
  // Amount Details
  y += 50;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('BILLING SUMMARY', 50, y);
  
  y += 40;
  ctx.font = '14px Arial';
  ctx.fillText(`Energy Usage: ${bill.usage} kWh`, 50, y);
  y += 25;
  ctx.fillText(`Rate per kWh: ₹0.15`, 50, y);
  y += 25;
  
  ctx.font = 'bold 14px Arial';
  ctx.fillText(`Total Amount: ₹${bill.amount}`, 50, y);
  y += 25;
  
  ctx.font = '14px Arial';
  ctx.fillText(`Status: ${bill.status.toUpperCase()}`, 50, y);
  
  // Footer
  y = 900;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText('© 2025 Household Watch. All rights reserved.', 50, y);
  ctx.fillText('Developed by Vanka Nikhil with ❤️', 50, y + 25);
  
  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = `bill_${bill.month.replace(/\s+/g, '_')}_${bill.id}.png`;
  link.click();
};

const API_BASE_URL = 'http://localhost:5000/api';

const authAPI = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      return data;
    } catch {
      return { success: false, message: 'Connection failed. Using demo mode.' };
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return data;
    } catch {
      return { success: false, message: 'Connection failed. Using demo mode.' };
    }
  }
};

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    name: "", phone: "", address: "", meterNumber: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const response = await authAPI.login(loginData.username, loginData.password);
    
    if (response.token || response.success !== false) {
      const userData = response.user || {
        id: Math.random(),
        username: loginData.username,
        name: loginData.username.charAt(0).toUpperCase() + loginData.username.slice(1),
        email: `${loginData.username}@household.com`,
        role: 'user'
      };
      localStorage.setItem('token', response.token || 'demo-token');
      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData, response.token || 'demo-token');
    } else {
      setError(response.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (!signupData.username || !signupData.email || !signupData.password || !signupData.name) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    const response = await authAPI.register(signupData);
    
    if (response.token || response.user) {
      setSuccess("Account created successfully! Please sign in with your credentials.");
      setIsLogin(true);
      setSignupData({
        username: "", email: "", password: "", confirmPassword: "",
        name: "", phone: "", address: "", meterNumber: ""
      });
      setLoginData({ username: signupData.username, password: "" });
    } else {
      setError(response.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Household Watch</h2>
            <p className="text-gray-300">Energy Monitoring System</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-center font-medium rounded-l-lg transition-colors ${
                isLogin ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-center font-medium rounded-r-lg transition-colors ${
                !isLogin ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin / user / demo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="demo"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Username*</label>
                  <input
                    type="text"
                    value={signupData.username}
                    onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Full Name*</label>
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">Email*</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Password*</label>
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Min 6 chars"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Confirm*</label>
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Confirm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ connected, setConnected, user }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [todayUsage, setTodayUsage] = useState(0);
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [cost, setCost] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);

  useEffect(() => {
    if (!connected) {
      // Reset values when disconnected
      setDataPoints([]);
      setTodayUsage(0);
      setMonthlyUsage(0);
      setCost(0);
      setCurrentPower(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString();
      const hour = now.getHours();
      
      let baseLoad = 2;
      if (hour >= 6 && hour <= 9) baseLoad += 3;
      if (hour >= 17 && hour <= 22) baseLoad += 4;
      if (hour >= 12 && hour <= 14) baseLoad += 2;

      const variation = (Math.random() - 0.5) * 0.4 * baseLoad;
      const newPoint = Math.max(0.5, baseLoad + variation);

      setCurrentPower(newPoint);
      setDataPoints((prev) => [...prev.slice(-19), { time: timeLabel, value: newPoint }]);

      const kWhIncrement = newPoint / 1200;
      setTodayUsage(prev => prev + kWhIncrement);
      setMonthlyUsage(prev => prev + (kWhIncrement * 30));
      setCost(prev => prev + (kWhIncrement * 15));
    }, 3000);

    return () => clearInterval(interval);
  }, [connected]);

  const StatCard = ({ title, value, unit, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>
        {value} <span className="text-lg text-gray-500">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg max-w-lg">
        <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name || 'User'}!</h1>
        <p className="text-blue-100 text-sm">Ready to manage your energy consumption?</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 Energy Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor your home energy consumption in real-time</p>
        </div>
        <button 
          onClick={() => setConnected(!connected)} 
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all transform hover:scale-105 ${
            connected ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {connected ? "🔌 Disconnect Meter" : "⚡ Connect Meter"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Current Power" value={currentPower.toFixed(1)} unit="kW" color="text-blue-600" />
        <StatCard title="Today's Usage" value={todayUsage.toFixed(1)} unit="kWh" color="text-green-600" />
        <StatCard title="Monthly Usage" value={monthlyUsage.toFixed(0)} unit="kWh" color="text-purple-600" />
        <StatCard title="Total Cost" value={formatCurrency(cost)} unit="" color="text-orange-600" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Real-time Energy Usage</h2>
        {connected && dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Connect your meter to see live data</p>
              <p className="text-gray-400 text-sm">Real-time energy consumption will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Analytics = () => {
  const monthlyData = [
    { month: 'Jan', usage: 450, target: 400 },
    { month: 'Feb', usage: 380, target: 400 },
    { month: 'Mar', usage: 520, target: 500 },
    { month: 'Apr', usage: 480, target: 500 },
    { month: 'May', usage: 620, target: 600 },
    { month: 'Jun', usage: 720, target: 700 },
    { month: 'Jul', usage: 850, target: 800 },
    { month: 'Aug', usage: 780, target: 800 }
  ];

  const deviceUsage = [
    { name: 'HVAC', value: 42, color: '#6366F1' },
    { name: 'Water Heater', value: 18, color: '#8B5CF6' },
    { name: 'Lighting', value: 12, color: '#06B6D4' },
    { name: 'Appliances', value: 16, color: '#10B981' },
    { name: 'Electronics', value: 8, color: '#F59E0B' },
    { name: 'Other', value: 4, color: '#EF4444' }
  ];

  const MetricCard = ({ title, value, unit, color }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-indigo-600',
      green: 'from-emerald-500 to-teal-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-red-500'
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}>
        <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-lg font-medium text-white/80">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          📈 Energy Analytics
        </h1>
        <p className="text-gray-600 text-lg">Discover insights and optimize your consumption</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Daily Average" value="24.5" unit="kWh" color="blue" />
        <MetricCard title="Peak Demand" value="7.2" unit="kW" color="green" />
        <MetricCard title="Efficiency Score" value="84" unit="%" color="purple" />
        <MetricCard title="Cost Savings" value="₹345" unit="saved" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Energy Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="usage" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Energy Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={deviceUsage} cx="50%" cy="50%" innerRadius={65} outerRadius={130} paddingAngle={3} dataKey="value">
                {deviceUsage.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {deviceUsage.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 truncate">{item.name}</span>
                <span className="text-sm font-medium text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const Devices = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Air Conditioner', room: 'Living Room', status: 'active', currentUsage: 2.8, dailyUsage: 18.5, icon: '❄️' },
    { id: 2, name: 'Water Heater', room: 'Utility Room', status: 'active', currentUsage: 3.2, dailyUsage: 12.4, icon: '🔥' },
    { id: 3, name: 'Refrigerator', room: 'Kitchen', status: 'active', currentUsage: 0.8, dailyUsage: 4.2, icon: '🧊' },
    { id: 4, name: 'Smart TV', room: 'Living Room', status: 'standby', currentUsage: 0.1, dailyUsage: 3.2, icon: '📺' },
    { id: 5, name: 'Washing Machine', room: 'Laundry', status: 'inactive', currentUsage: 0.0, dailyUsage: 2.1, icon: '🧺' },
    { id: 6, name: 'LED Lights', room: 'Whole House', status: 'active', currentUsage: 0.6, dailyUsage: 5.8, icon: '💡' }
  ]);

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', room: '', icon: '⚡' });

  useEffect(() => {
    const hourlyInterval = setInterval(async () => {
      try {
        devices.forEach(async (device) => {
          await fetch(`${API_BASE_URL}/devices/${device.id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              status: device.status,
              currentUsage: device.currentUsage,
              dailyUsage: device.dailyUsage
            })
          });
        });
      } catch{
        console.log('Demo mode: Devices sync would occur here');
      }
    }, 3600000);

    return () => clearInterval(hourlyInterval);
  }, [devices]);

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.room) {
      alert('Please fill in all fields');
      return;
    }
    
    const addedDevice = {
      id: devices.length + 1,
      name: newDevice.name,
      room: newDevice.room,
      icon: newDevice.icon,
      status: 'inactive',
      currentUsage: 0,
      dailyUsage: 0
    };

    setDevices([...devices, addedDevice]);
    setNewDevice({ name: '', room: '', icon: '⚡' });
    setShowAddDevice(false);
    alert(`Device "${newDevice.name}" added successfully!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleDevice = (id) => {
    setDevices(devices.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'active' ? 'inactive' : 'active' };
      }
      return d;
    }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚡ Smart Devices</h1>
          <p className="text-gray-600 mt-1">Monitor and control your connected devices</p>
        </div>
        <button 
          onClick={() => setShowAddDevice(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Add Device
        </button>
      </div>

      {showAddDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Device</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Microwave"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <input
                  type="text"
                  value={newDevice.room}
                  onChange={(e) => setNewDevice({...newDevice, room: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kitchen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon Emoji</label>
                <input
                  type="text"
                  value={newDevice.icon}
                  onChange={(e) => setNewDevice({...newDevice, icon: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 🌊"
                  maxLength={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddDevice}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Device
                </button>
                <button
                  onClick={() => setShowAddDevice(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Active Devices</p>
          <p className="text-2xl font-bold text-gray-900">{devices.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">On Standby</p>
          <p className="text-2xl font-bold text-gray-900">{devices.filter(d => d.status === 'standby').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Offline</p>
          <p className="text-2xl font-bold text-gray-900">{devices.filter(d => d.status === 'inactive').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Power</p>
          <p className="text-2xl font-bold text-gray-900">{(devices.reduce((sum, d) => sum + d.currentUsage, 0)).toFixed(1)} kW</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => (
          <div key={device.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">{device.icon}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                {device.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{device.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{device.room}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Current</p>
                <p className="text-lg font-bold text-gray-900">{device.currentUsage} kW</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Daily</p>
                <p className="text-lg font-bold text-gray-900">{device.dailyUsage} kWh</p>
              </div>
            </div>
            <button 
              onClick={() => toggleDevice(device.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all"
            >
              {device.status === 'active' ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Bills = ({ user }) => {
  const [bills, setBills] = useState([
    { id: 1, month: 'December 2024', amount: 5672, usage: 1045, status: 'pending', dueDate: '2024-12-28' },
    { id: 2, month: 'November 2024', amount: 4612, usage: 850, status: 'paid', dueDate: '2024-11-28' },
    { id: 3, month: 'October 2024', amount: 3569, usage: 658, status: 'paid', dueDate: '2024-10-28' },
    { id: 4, month: 'September 2024', amount: 5270, usage: 968, status: 'paid', dueDate: '2024-09-28' }
  ]);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const getStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const handlePayment = async (bill) => {
    setPaymentProcessing(true);
    setPaymentSuccess(null);

    // Simulate payment processing
    setTimeout(() => {
      setBills(bills.map(b => 
        b.id === bill.id ? { ...b, status: 'paid', paidDate: new Date().toLocaleDateString() } : b
      ));
      setPaymentSuccess(bill.id);
      setPaymentProcessing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setPaymentSuccess(null), 3000);
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Energy Bills</h1>
          <p className="text-gray-600 mt-1">Track your energy costs and payment history</p>
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Set Budget Alert</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600">Current Bill</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(bills[0]?.amount || 0)}</p>
          <p className="text-xs text-red-500">Due in 5 days</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600">Avg Monthly</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(bills.reduce((sum, b) => sum + b.amount, 0) / bills.length)}</p>
          <p className="text-xs text-green-500">↓ 8% vs last year</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600">Budget Alert</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(6000)}</p>
          <p className="text-xs text-yellow-500">97% of budget used</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600">Year to Date</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(55950)}</p>
          <p className="text-xs text-blue-500">12 months paid</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bills.map(bill => (
            <div key={bill.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative">
              {paymentSuccess === bill.id && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-green-50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-5xl mb-2">✅</div>
                    <p className="text-green-700 font-bold">Payment Successful!</p>
                    <p className="text-green-600 text-sm">Bill marked as paid</p>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{bill.month}</h3>
                  <p className="text-sm text-gray-600">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                  {bill.status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(bill.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage</span>
                  <span className="text-lg font-semibold text-blue-600">{bill.usage} kWh</span>
                </div>
                <div className="flex gap-2">
                  {bill.status === 'pending' && (
                    <button 
                      onClick={() => handlePayment(bill)}
                      disabled={paymentProcessing}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {paymentProcessing && paymentSuccess !== bill.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  <button 
                    onClick={() => generatePDF(bill, user?.name || 'User')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Settings = ({ user }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailAlerts: true,
    monthlyReport: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Settings</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-lg font-semibold text-gray-900">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'notifications', label: 'Push Notifications', desc: 'Receive real-time alerts' },
              { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme' },
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get email notifications' },
              { key: 'monthlyReport', label: 'Monthly Report', desc: 'Receive monthly summary' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-8 px-8 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <p className="text-center text-sm">
            © 2025 Household Watch. All rights reserved. Developed by Vanka Nikhil with <span className="text-red-500 mx-1">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage("Dashboard");
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const navigation = [
    { name: "Dashboard", icon: "📊" },
    { name: "Analytics", icon: "📈" },
    { name: "Devices", icon: "⚡" },
    { name: "Bills", icon: "💰" },
    { name: "Settings", icon: "⚙️" },
    { name: "Logout", icon: "🚪" }
  ];

  const handleNavClick = (page) => {
    if (page === "Logout") {
      handleLogout();
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          {sidebarOpen && <div className="text-xl font-bold">⚡Household Watch</div>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors ${
                currentPage === item.name ? "bg-gray-700" : ""
              } ${item.name === 'Logout' ? 'mt-auto hover:bg-red-600/20' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="text-xs text-gray-400">
              Logged in as: <span className="text-white font-medium">{user?.username}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="min-h-screen">
          {currentPage === "Dashboard" && <Dashboard connected={connected} setConnected={setConnected} user={user} />}
          {currentPage === "Analytics" && <Analytics />}
          {currentPage === "Devices" && <Devices />}
          {currentPage === "Bills" && <Bills user={user} />}
          {currentPage === "Settings" && <Settings user={user} />}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;