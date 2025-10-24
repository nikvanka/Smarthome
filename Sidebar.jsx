export default function Sidebar({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, handleLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'devices', icon: '⚡', label: 'Devices' },
    { id: 'bills', icon: '💰', label: 'Bills' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 shadow-2xl fixed h-screen overflow-y-auto z-50`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {sidebarOpen && <h1 className="text-2xl font-bold">⚡ Household Watch</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all mt-8">
            <span className="text-2xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
}