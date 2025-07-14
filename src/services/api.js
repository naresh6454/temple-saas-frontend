import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// API Configuration - FIXED to use proper URL structure
const API_CONFIG = {
  // Use relative path in development so Vite can proxy requests
  BASE_URL: import.meta.env.DEV 
    ? ''  // Empty string for relative paths - IMPORTANT FIX
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

console.log('🔧 API Config:', API_CONFIG) // Debug log

// Create axios instance - RENAMED to axiosInstance to avoid conflict
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token and tenant context
axiosInstance.interceptors.request.use(
  (config) => {
    // Debug log the actual full URL being requested
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    
    // Get auth token from localStorage directly first (for initial page load)
    let token = localStorage.getItem('auth_token')
    
    // If token not in localStorage, try to get from store
    if (!token) {
      try {
        const authStore = useAuthStore()
        token = authStore.token
      } catch (e) {
        console.warn('Could not access auth store, using localStorage token only:', e)
      }
    }
    
    // Add authentication token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No authentication token found for API request to:', config.url)
    }
    
    // Try to add tenant context for multi-tenant requests
    try {
      const authStore = useAuthStore()
      if (authStore.user?.entityId && !config.url.includes('/superadmin/')) {
        config.headers['X-Tenant-ID'] = authStore.user.entityId
      }
    } catch (e) {
      console.warn('Could not access auth store for tenant ID:', e)
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const duration = new Date() - response.config.metadata.startTime
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms - Status: ${response.status}`)
    
    return response
  },
  async (error) => {
    console.error('❌ API Error:', error)
    
    // Try to use toast service, but handle gracefully if not available
    let showToast
    try {
      const toastService = useToast()
      showToast = toastService.showToast || toastService.error || toastService
    } catch (e) {
      console.warn('Could not access toast service:', e)
      showToast = () => console.error('Toast service unavailable:', error)
    }
    
    // Try to access auth store, but handle gracefully if not available
    let authStore
    try {
      authStore = useAuthStore()
    } catch (e) {
      console.warn('Could not access auth store:', e)
    }
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          showToast({
            type: 'error',
            title: 'Authentication Required',
            message: 'Your session has expired. Please login again.'
          })
          if (authStore) {
            authStore.logout()
          } else {
            localStorage.removeItem('auth_token')
          }
          window.location.href = '/login'
          break
          
        case 403:
          // Forbidden - Insufficient permissions
          showToast({
            type: 'warning',
            title: 'Access Denied',
            message: data.message || 'You do not have permission to perform this action.'
          })
          break
          
        case 404:
          // Not Found
          showToast({
            type: 'error',
            title: 'Resource Not Found',
            message: data?.message || 'The requested resource was not found. Check that the API endpoint exists.'
          })
          console.warn('404 Not Found:', error.config.url)
          break
          
        case 422:
          // Validation Error
          console.warn('Validation errors:', data.errors)
          // Don't show toast for validation errors - let components handle them
          break
          
        case 429:
          // Rate Limited
          showToast({
            type: 'warning',
            title: 'Too Many Requests',
            message: 'Please slow down and try again in a moment.'
          })
          break
          
        case 500:
          // Server Error
          showToast({
            type: 'error',
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.'
          })
          break
          
        default:
          // Generic error
          showToast({
            type: 'error',
            title: 'Request Failed',
            message: data?.message || 'An unexpected error occurred.'
          })
      }
    } else if (error.request) {
      // Network error
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Please check your internet connection and try again.'
      })
    } else {
      // Request setup error
      console.error('Request setup error:', error.message)
      showToast({
        type: 'error',
        title: 'Request Error',
        message: 'Failed to make request. Please try again.'
      })
    }
    
    return Promise.reject(error)
  }
)

// Retry mechanism for failed requests
const retryRequest = async (config, attempt = 1) => {
  try {
    return await axiosInstance(config)
  } catch (error) {
    if (attempt < API_CONFIG.RETRY_ATTEMPTS && error.response?.status >= 500) {
      console.log(`Retrying request (attempt ${attempt + 1}/${API_CONFIG.RETRY_ATTEMPTS})`)
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt))
      return retryRequest(config, attempt + 1)
    }
    throw error
  }
}

// Core API methods
export const api = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await retryRequest({ method: 'get', url, ...config })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.post(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.put(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.patch(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await axiosInstance.delete(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // File upload with progress
  async upload(url, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
      
      const response = await axiosInstance.post(url, formData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Download file
  async download(url, filename = null) {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Batch requests
  async batch(requests) {
    try {
      const promises = requests.map(request => {
        const { method, url, data, config } = request
        return this[method](url, data, config)
      })
      
      return await Promise.allSettled(promises)
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Error handler
  handleError(error) {
    const errorResponse = {
      message: 'An unexpected error occurred',
      status: null,
      data: null,
      errors: null
    }

    if (error.response) {
      errorResponse.message = error.response.data?.message || error.message
      errorResponse.status = error.response.status
      errorResponse.data = error.response.data
      errorResponse.errors = error.response.data?.errors
    } else if (error.request) {
      errorResponse.message = 'Network error - please check your connection'
    } else {
      errorResponse.message = error.message
    }

    return errorResponse
  }
}

// Role-based API endpoints - FIXED to match backend routes.go
export const endpoints = {
  // Authentication
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    verifyEmail: '/api/v1/auth/verify-email'
  },

  // Super Admin (Internal Only)
  superAdmin: {
    dashboard: '/api/v1/superadmin/dashboard',
    tenants: '/api/v1/superadmin/tenants',
    pendingTenants: '/api/v1/superadmin/tenants/pending',
    updateTenantApproval: (id) => `/api/v1/superadmin/tenants/${id}/approval`,
    pendingEntities: '/api/v1/superadmin/entities/pending',
    updateEntityApproval: (id) => `/api/v1/superadmin/entities/${id}/approval`,
    stats: '/api/v1/superadmin/stats'
  },

  // Tenant (Temple Admin)
  tenant: {
    dashboard: '/api/v1/tenant/dashboard',
    profile: '/api/v1/tenant/profile',
    temples: '/api/v1/tenant/temples',
    createTemple: '/api/v1/tenant/temples',
    updateTemple: (id) => `/api/v1/tenant/temples/${id}`,
    deleteTemple: (id) => `/api/v1/tenant/temples/${id}`,
    documents: '/api/v1/tenant/documents',
    uploadDocument: '/api/v1/tenant/documents/upload'
  },

  // Entity (Temple Management)
  entity: (entityId) => ({
    dashboard: `/api/v1/entities/${entityId}/dashboard`,
    devotees: `/api/v1/entities/${entityId}/devotees`,
    devotee: (devoteeId) => `/api/v1/entities/${entityId}/devotees/${devoteeId}`,
    sevas: `/api/v1/entities/${entityId}/sevas`,
    seva: (sevaId) => `/api/v1/entities/${entityId}/sevas/${sevaId}`,
    donations: `/api/v1/entities/${entityId}/donations`,
    donation: (donationId) => `/api/v1/entities/${entityId}/donations/${donationId}`,
    events: `/api/v1/entities/${entityId}/events`,
    event: (eventId) => `/api/v1/entities/${entityId}/events/${eventId}`,
    volunteers: `/api/v1/entities/${entityId}/volunteers`,
    volunteer: (volunteerId) => `/api/v1/entities/${entityId}/volunteers/${volunteerId}`,
    communication: `/api/v1/entities/${entityId}/communication`,
    templates: `/api/v1/entities/${entityId}/communication/templates`,
    bulkMessage: `/api/v1/entities/${entityId}/communication/bulk`,
    reports: `/api/v1/entities/${entityId}/reports`,
    settings: `/api/v1/entities/${entityId}/settings`
  }),

  // Public endpoints
  public: {
    temples: '/api/v1/public/temples',
    temple: (id) => `/api/v1/public/temples/${id}`,
    searchTemples: '/api/v1/public/temples/search',
    joinTemple: '/api/v1/public/temples/join'
  },

  // User profile and preferences
  user: {
    profile: '/api/v1/user/profile',
    preferences: '/api/v1/user/preferences',
    notifications: '/api/v1/user/notifications',
    markNotificationRead: (id) => `/api/v1/user/notifications/${id}/read`,
    avatar: '/api/v1/user/avatar'
  }
}

// Utility functions for common API patterns
export const apiUtils = {
  // Build query string from object
  buildQuery(params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, value)
      }
    })
    return query.toString()
  },

  // Paginated request helper
  async paginate(endpoint, params = {}) {
    const queryString = this.buildQuery(params)
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return api.get(url)
  },

  // Search helper
  async search(endpoint, searchTerm, filters = {}) {
    const params = {
      search: searchTerm,
      ...filters
    }
    return this.paginate(endpoint, params)
  },

  // Bulk operations helper
  async bulkOperation(endpoint, operation, ids) {
    return api.post(`${endpoint}/bulk`, {
      operation,
      ids
    })
  }
}

export default api