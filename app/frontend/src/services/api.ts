const API_URL = '';

// Create axios-like apiClient for consistent API calls
export const apiClient = {
  get: async (url: string, config?: any) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...config?.headers,
      },
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },

  post: async (url: string, data?: any, config?: any) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...config?.headers,
    };
    
    // Don't set Content-Type for FormData - let browser set it automatically
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },

  put: async (url: string, data?: any, config?: any) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...config?.headers,
      },
      body: JSON.stringify(data),
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },

  delete: async (url: string, config?: any) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...config?.headers,
      },
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },
};

export const api = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  signup: async (userData: { email: string; password: string; name: string }) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Profile endpoints
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
}; 