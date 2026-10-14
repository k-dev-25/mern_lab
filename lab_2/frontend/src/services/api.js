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
