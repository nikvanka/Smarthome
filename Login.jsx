import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const demoUsers = {
        'admin': { id: 1, username: 'admin', name: 'Admin User', email: 'admin@household.com', role: 'admin' },
        'user': { id: 2, username: 'user', name: 'Regular User', email: 'user@household.com', role: 'user' },
        'demo': { id: 3, username: 'demo', name: 'Demo Account', email: 'demo@household.com', role: 'demo' }
      };

      if (demoUsers[username] && password === 'demo') {
        onLogin(demoUsers[username], 'demo-token-12345');
      } else {
        setError('Invalid credentials. Try: admin/demo, user/demo, or demo/demo');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">⚡ Household Watch</h2>
        <p className="login-subtitle">Your Smart Energy Dashboard</p>
        
        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder="Enter your username"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="input-field"
            placeholder="Enter your password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px'}}>
            Demo credentials:
          </p>
          <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px'}}>• admin / demo</p>
          <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px'}}>• user / demo</p>
          <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px'}}>• demo / demo</p>
        </div>
      </div>
    </div>
  );
}