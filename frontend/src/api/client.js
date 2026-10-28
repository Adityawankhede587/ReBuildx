import axios from 'axios';

// Support separate deployment via VITE_API_URL environment variable
const rawUrl = import.meta.env.VITE_API_URL || '';
const cleanUrl = rawUrl.replace(/\/+$/, '');
const apiBaseURL = cleanUrl
  ? (cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

