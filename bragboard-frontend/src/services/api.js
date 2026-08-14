import axios from 'axios';

// Pulls the Vercel environment variable, falls back to the live Render URL
const rawUrl = import.meta.env.VITE_API_URL || 'https://bragboard-api-oo4v.onrender.com';

// Defensive fix: Automatically correct any single-slash typos (e.g. "https:/" -> "https://")
const API_URL = rawUrl.replace('https:/', 'https://');

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
