import axios from 'axios'

// In development, the proxy will handle routing to the backend
// In production, use the full URL
const baseURL = import.meta.env.DEV 
  ? '/api/v1'  // Will be proxied through Vite in development
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1')

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Redirect to login
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// Export both the raw api and the structured apiClient
export default api

// Request methods with common patterns for our temple SaaS
export const apiClient = {
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    refreshToken: () => api.post('/auth/refresh')
  },
  
  // Seva endpoints
  seva: {
    getSevas: (entityId) => api.get('/sevas', { params: { entity_id: entityId } }),
    createSeva: (sevaData) => api.post('/sevas', sevaData),
    updateSeva: (sevaId, sevaData) => api.put(`/sevas/${sevaId}`, sevaData),
    deleteSeva: (sevaId) => api.delete(`/sevas/${sevaId}`),
    getEntityBookings: () => api.get('/sevas/entity-bookings'),
    updateBookingStatus: (bookingId, status) => api.patch(`/sevas/bookings/${bookingId}/status`, { status })
  }
}