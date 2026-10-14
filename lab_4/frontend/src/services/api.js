const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const registerCustomer = (customer) =>
  request('/customers/register', {
    method: 'POST',
    body: JSON.stringify(customer),
  });

export const loginCustomer = (credentials) =>
  request('/customers/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const getCurrentCustomer = () => request('/customers/me');

export const logoutCustomer = () =>
  request('/customers/logout', { method: 'POST' });

export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  const query = params.toString();
  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => request(`/products/${id}`);

export const addToWishlist = (productId) =>
  request(`/wishlist/${productId}`, { method: 'POST' });

export const getWishlist = () => request('/wishlist');

export const removeFromWishlist = (productId) =>
  request(`/wishlist/${productId}`, { method: 'DELETE' });
