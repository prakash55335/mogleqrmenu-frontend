import axios from 'axios'

const API = axios.create({
  // Hardcoded your working live Railway URL directly as the fallback configuration
  baseURL: import.meta.env.VITE_API_URL || 'https://railway.app',
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
