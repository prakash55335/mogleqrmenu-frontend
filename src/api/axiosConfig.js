import axios from 'axios'

const API = axios.create({
  // Fixed: Now points to your actual, unique Django backend deployment URL on Railway
  baseURL: import.meta.env.VITE_API_URL || 'https://web-production-a3bd8.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default API
