import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token and tenant context
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // Add authentication token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // Add tenant context for multi-tenant requests
    if (authStore.user?.entityId && !config.url.includes('/superadmin/')) {
      config.headers['X-Tenant-ID'] = authStore.user.entityId
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
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const duration = new Date() - response.config.metadata.startTime
    console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    
    return response
  },
  async (error) => {
    const { showToast } = useToast()
    const authStore = useAuthStore()
    
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
          authStore.logout()
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
            message: data.message || 'The requested resource was not found.'
          })
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
            message: data.message || 'An unexpected error occurred.'
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
    return await apiClient(config)
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
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config)
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
      
      const response = await apiClient.post(url, formData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Download file
  async download(url, filename = null) {
    try {
      const response = await apiClient.get(url, {
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

// Role-based API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email'
  },

  // Super Admin (Internal Only)
  superAdmin: {
    dashboard: '/superadmin/dashboard',
    tenants: '/superadmin/tenants',
    approveTenant: (id) => `/superadmin/tenants/${id}/approve`,
    rejectTenant: (id) => `/superadmin/tenants/${id}/reject`,
    temples: '/superadmin/temples',
    approveTemple: (id) => `/superadmin/temples/${id}/approve`,
    rejectTemple: (id) => `/superadmin/temples/${id}/reject`,
    stats: '/superadmin/stats'
  },

  // Tenant (Temple Admin)
  tenant: {
    dashboard: '/tenant/dashboard',
    profile: '/tenant/profile',
    temples: '/tenant/temples',
    createTemple: '/tenant/temples',
    updateTemple: (id) => `/tenant/temples/${id}`,
    deleteTemple: (id) => `/tenant/temples/${id}`,
    documents: '/tenant/documents',
    uploadDocument: '/tenant/documents/upload'
  },

  // Entity (Temple Management)
  entity: (entityId) => ({
    dashboard: `/entities/${entityId}/dashboard`,
    devotees: `/entities/${entityId}/devotees`,
    devotee: (devoteeId) => `/entities/${entityId}/devotees/${devoteeId}`,
    sevas: `/entities/${entityId}/sevas`,
    seva: (sevaId) => `/entities/${entityId}/sevas/${sevaId}`,
    donations: `/entities/${entityId}/donations`,
    donation: (donationId) => `/entities/${entityId}/donations/${donationId}`,
    events: `/entities/${entityId}/events`,
    event: (eventId) => `/entities/${entityId}/events/${eventId}`,
    volunteers: `/entities/${entityId}/volunteers`,
    volunteer: (volunteerId) => `/entities/${entityId}/volunteers/${volunteerId}`,
    communication: `/entities/${entityId}/communication`,
    templates: `/entities/${entityId}/communication/templates`,
    bulkMessage: `/entities/${entityId}/communication/bulk`,
    reports: `/entities/${entityId}/reports`,
    settings: `/entities/${entityId}/settings`
  }),

  // Public endpoints
  public: {
    temples: '/public/temples',
    temple: (id) => `/public/temples/${id}`,
    searchTemples: '/public/temples/search',
    joinTemple: '/public/temples/join'
  },

  // User profile and preferences
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    notifications: '/user/notifications',
    markNotificationRead: (id) => `/user/notifications/${id}/read`,
    avatar: '/user/avatar'
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