const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8100';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      if (token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    const errorMessage = data?.message || (typeof data === 'string' ? data : 'Erro na requisição');
    throw new Error(errorMessage);
  }

  return data;
}

export const authService = {
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha: password }),
    });
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.email ? data.email.split('@')[0] : 'Usuário',
        email: data.email,
        perfil: data.perfil
      }));
    }
    return data;
  },

  register: async (name, email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome: name,
        email,
        senha: password,
        perfil: 'CLIENTE'
      }),
    });
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: name || (data.email ? data.email.split('@')[0] : 'Usuário'),
        email: data.email,
        perfil: data.perfil
      }));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const orderService = {
  getAllOrders: async () => {
    return await apiFetch('/orders');
  },

  getOrderById: async (id) => {
    return await apiFetch(`/orders/${id}`);
  },

  createOrder: async (orderData) => {
    return await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateOrderStatus: async (id, status) => {
    return await apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

