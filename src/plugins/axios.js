// src/plugins/axios.js
import axios from 'axios'

// Base URL Configuration
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Log configuration in development only
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    baseURL,
    environment: import.meta.env.MODE
  })
}

// Request interceptor - Add auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    
    // Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add tenant ID header for proper tenant isolation
    const tenantId = localStorage.getItem('current_tenant_id')
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId
      
      // Log tenant header in development
      if (import.meta.env.DEV) {
        console.log(`Request with Tenant ID: ${tenantId}`)
      }
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log success in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`)
    }
    
    return response
  },
  (error) => {
    // Log error
    console.error('API Error:', error.message)
    
    if (error.response) {
      // Log response error details
      console.error(`Status: ${error.response.status}`, 
                   `Method: ${error.config?.method?.toUpperCase()}`, 
                   `URL: ${error.config?.url}`)
      
      // Handle 401 errors (except during login attempts)
      if (error.response.status === 401) {
        const isLoginAttempt = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/v1/auth/login')
        
        if (!isLoginAttempt) {
          // Clear authentication data
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          localStorage.removeItem('current_tenant_id')
          delete api.defaults.headers.common['Authorization']
          delete api.defaults.headers.common['X-Tenant-ID']
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?error=session_expired'
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth-specific API endpoints
const authAPI = {
  login: (credentials) => api.post('/v1/auth/login', credentials),
  register: (userData) => api.post('/v1/auth/register', userData),
  logout: () => api.post('/v1/auth/logout'),
  refreshToken: () => api.post('/v1/auth/refresh'),
  getProfile: () => api.get('/v1/auth/me')
}

// Temple/Entity endpoints
const templeAPI = {
  create: (data) => api.post('/v1/tenant/temples', data),
  getAll: () => api.get('/v1/tenant/temples'),
  getById: (id) => api.get(`/v1/tenant/temples/${id}`),
  update: (id, data) => api.put(`/v1/tenant/temples/${id}`, data),
  delete: (id) => api.delete(`/v1/tenant/temples/${id}`)
}

// User role-specific endpoints
const userAPI = {
  // Devotee endpoints
  devotee: {
    getProfile: () => api.get('/v1/devotee/profile'),
    updateProfile: (data) => api.put('/v1/devotee/profile', data),
    joinTemple: (templeId) => api.post('/v1/devotee/join-temple', { templeId })
  },
  
  // Volunteer endpoints
  volunteer: {
    getProfile: () => api.get('/v1/volunteer/profile'),
    updateProfile: (data) => api.put('/v1/volunteer/profile', data),
    joinTemple: (templeId) => api.post('/v1/volunteer/join-temple', { templeId })
  }
}

// Admin endpoints
const adminAPI = {
  getTemples: () => api.get('/v1/superadmin/temples'),
  getPendingTemples: () => api.get('/v1/superadmin/temples/pending'),
  approveTemple: (id, notes) => api.post(`/v1/superadmin/temples/${id}/approve`, { notes }),
  rejectTemple: (id, reason) => api.post(`/v1/superadmin/temples/${id}/reject`, { reason })
}

// Export structured API client
export const apiClient = {
  auth: authAPI,
  temple: templeAPI,
  user: userAPI,
  admin: adminAPI
}

// Default export for backward compatibility
export default api