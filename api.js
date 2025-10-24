const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// Power Usage API
export const powerAPI = {
  saveReading: async (reading) => {
    const response = await fetch(`${API_BASE_URL}/power/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(reading)
    });
    return handleResponse(response);
  },

  getLatest: async () => {
    const response = await fetch(`${API_BASE_URL}/power/latest`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/energy/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// Device API
export const deviceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (device) => {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(device)
    });
    return handleResponse(response);
  },

  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  }
};

// Bill API
export const billAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  pay: async (billId, paymentMethod) => {
    const response = await fetch(`${API_BASE_URL}/bills/${billId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ paymentMethod })
    });
    return handleResponse(response);
  }
};

// Analytics API
export const analyticsAPI = {
  getMonthly: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/monthly`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getDeviceUsage: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/devices`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// Demo data
export const demoAPI = {
  createDemoData: async () => {
    const response = await fetch(`${API_BASE_URL}/demo/create-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};