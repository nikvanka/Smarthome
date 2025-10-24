import { useState } from 'react';

export default function Settings({ user }) {
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

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left">
              Change Password
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 text-left">
              Update Profile
            </button>
            <button className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-left">
              Delete Account
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-2">About Household Watch</h3>
          <p className="text-sm text-gray-600 mb-3">Version 1.0.0</p>
          <p className="text-sm text-gray-600">Smart energy management for modern homes</p>
        </div>
      </div>
    </div>
  );
}