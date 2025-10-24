import { useState } from 'react';

export default function Devices() {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Air Conditioner', room: 'Living Room', status: 'active', currentUsage: 2.8, dailyUsage: 18.5, icon: '❄️' },
    { id: 2, name: 'Water Heater', room: 'Utility Room', status: 'active', currentUsage: 3.2, dailyUsage: 12.4, icon: '🔥' },
    { id: 3, name: 'Refrigerator', room: 'Kitchen', status: 'active', currentUsage: 0.8, dailyUsage: 4.2, icon: '🧊' },
    { id: 4, name: 'Smart TV', room: 'Living Room', status: 'standby', currentUsage: 0.1, dailyUsage: 3.2, icon: '📺' },
    { id: 5, name: 'Washing Machine', room: 'Laundry', status: 'inactive', currentUsage: 0.0, dailyUsage: 2.1, icon: '🧺' },
    { id: 6, name: 'LED Lights', room: 'Whole House', status: 'active', currentUsage: 0.6, dailyUsage: 5.8, icon: '💡' }
  ]);

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
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md">Add Device</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(d => (
          <div key={d.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{d.icon}</div>
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-500">{d.room}</div>
                </div>
              </div>
              <div className={`px-2 py-1 text-sm rounded ${getStatusColor(d.status)}`}>{d.status}</div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Current: {d.currentUsage} kW • Daily: {d.dailyUsage} kWh
            </div>
            <div className="mt-3">
              <button onClick={() => toggleDevice(d.id)} className="px-3 py-1 bg-gray-100 rounded">Toggle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}