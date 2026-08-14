import axios from 'axios';

// Pulls the Vercel environment variable, falls back to local URL for testing
const API_URL = import.meta.env.VITE_API_URL || 'https://bragboard-api-oo4v.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set the JWT token for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
