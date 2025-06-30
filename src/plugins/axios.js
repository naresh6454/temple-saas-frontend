import axios from 'axios'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token and loading states
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add tenant context if available (for multi-tenant requests)
    const tenantId = localStorage.getItem('current_tenant_id')
    if (tenantId && config.url?.includes('/entity/')) {
      config.headers['X-Tenant-ID'] = tenantId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common errors and responses
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data?.message) {
      // Show success toast for create/update operations
      const successMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
      if (successMethods.includes(response.config.method?.toUpperCase())) {
        const { showToast } = useToast()
        showToast(response.data.message, 'success')
      }
    }
    
    return response
  },
  (error) => {
    const { showToast } = useToast()
    const { logout } = useAuth()

    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          showToast('Session expired. Please login again.', 'error')
          logout()
          window.location.href = '/login'
          break

        case 403:
          // Forbidden - insufficient permissions
          showToast('You do not have permission to perform this action.', 'error')
          break

        case 404:
          // Not found
          showToast(data?.message || 'Resource not found.', 'error')
          break

        case 422:
          // Validation errors
          if (data?.errors) {
            // Handle validation errors (for forms)
            const firstError = Object.values(data.errors)[0]
            showToast(Array.isArray(firstError) ? firstError[0] : firstError, 'error')
          } else {
            showToast(data?.message || 'Validation failed.', 'error')
          }
          break

        case 429:
          // Rate limiting
          showToast('Too many requests. Please try again later.', 'warning')
          break

        case 500:
          // Server error
          showToast('Server error occurred. Please try again later.', 'error')
          break

        default:
          // Generic error
          showToast(data?.message || 'An unexpected error occurred.', 'error')
      }
    } else if (error.request) {
      // Network error
      showToast('Network error. Please check your connection.', 'error')
    } else {
      // Other errors
      showToast(error.message || 'An unexpected error occurred.', 'error')
    }

    return Promise.reject(error)
  }
)

// Request methods with common patterns for our temple SaaS
export const apiClient = {
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
    refreshToken: () => api.post('/auth/refresh')
  },

  // Tenant management (for TENANT role)
  tenant: {
    getProfile: () => api.get('/tenant/profile'),
    updateProfile: (data) => api.put('/tenant/profile', data),
    getTemples: () => api.get('/tenant/temples'),
    createTemple: (templeData) => api.post('/tenant/temples', templeData),
    updateTemple: (id, data) => api.put(`/tenant/temples/${id}`, data),
    uploadDocuments: (id, files) => {
      const formData = new FormData()
      files.forEach(file => formData.append('documents', file))
      return api.post(`/tenant/temples/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
  },

  // Temple/Entity management (for approved temple admins)
  entity: {
    getDashboard: (entityId) => api.get(`/entity/${entityId}/dashboard`),
    getStats: (entityId) => api.get(`/entity/${entityId}/stats`),
    
    // Devotee management
    getDevotees: (entityId, params) => api.get(`/entity/${entityId}/devotees`, { params }),
    getDevotee: (entityId, devoteeId) => api.get(`/entity/${entityId}/devotees/${devoteeId}`),
    updateDevotee: (entityId, devoteeId, data) => api.put(`/entity/${entityId}/devotees/${devoteeId}`, data),
    deactivateDevotee: (entityId, devoteeId) => api.patch(`/entity/${entityId}/devotees/${devoteeId}/deactivate`),
    exportDevotees: (entityId, format) => api.get(`/entity/${entityId}/devotees/export/${format}`, { responseType: 'blob' }),

    // Seva management
    getSevas: (entityId, params) => api.get(`/entity/${entityId}/sevas`, { params }),
    createSeva: (entityId, sevaData) => api.post(`/entity/${entityId}/sevas`, sevaData),
    updateSeva: (entityId, sevaId, data) => api.put(`/entity/${entityId}/sevas/${sevaId}`, data),
    approveSeva: (entityId, sevaId) => api.patch(`/entity/${entityId}/sevas/${sevaId}/approve`),
    rejectSeva: (entityId, sevaId, reason) => api.patch(`/entity/${entityId}/sevas/${sevaId}/reject`, { reason }),

    // Donation management
    getDonations: (entityId, params) => api.get(`/entity/${entityId}/donations`, { params }),
    generateReceipt: (entityId, donationId) => api.get(`/entity/${entityId}/donations/${donationId}/receipt`, { responseType: 'blob' }),
    getDonationReports: (entityId, period) => api.get(`/entity/${entityId}/donations/reports/${period}`),

    // Event management
    getEvents: (entityId, params) => api.get(`/entity/${entityId}/events`, { params }),
    createEvent: (entityId, eventData) => api.post(`/entity/${entityId}/events`, eventData),
    updateEvent: (entityId, eventId, data) => api.put(`/entity/${entityId}/events/${eventId}`, data),
    deleteEvent: (entityId, eventId) => api.delete(`/entity/${entityId}/events/${eventId}`),
    notifyDevotees: (entityId, eventId, message) => api.post(`/entity/${entityId}/events/${eventId}/notify`, { message }),

    // Communication
    sendBulkMessage: (entityId, messageData) => api.post(`/entity/${entityId}/communication/bulk`, messageData),
    getMessageTemplates: (entityId) => api.get(`/entity/${entityId}/communication/templates`),
    saveTemplate: (entityId, template) => api.post(`/entity/${entityId}/communication/templates`, template),
    getMessageHistory: (entityId, params) => api.get(`/entity/${entityId}/communication/history`, { params })
  },

  // Devotee endpoints
  devotee: {
    searchTemples: (searchParams) => api.get('/devotee/temples/search', { params: searchParams }),
    joinTemple: (templeId) => api.post(`/devotee/temples/${templeId}/join`),
    getProfile: () => api.get('/devotee/profile'),
    updateProfile: (data) => api.put('/devotee/profile', data),
    getProfileCompletion: () => api.get('/devotee/profile/completion'),
    
    // Seva booking
    getAvailableSevas: (entityId) => api.get(`/devotee/entity/${entityId}/sevas`),
    bookSeva: (entityId, sevaData) => api.post(`/devotee/entity/${entityId}/sevas/book`, sevaData),
    getMySevas: (entityId) => api.get(`/devotee/entity/${entityId}/sevas/my-bookings`),
    
    // Donations
    makeDonation: (entityId, donationData) => api.post(`/devotee/entity/${entityId}/donations`, donationData),
    getDonationHistory: (entityId) => api.get(`/devotee/entity/${entityId}/donations/history`),
    
    // Events
    getEvents: (entityId) => api.get(`/devotee/entity/${entityId}/events`),
    rsvpEvent: (entityId, eventId, response) => api.post(`/devotee/entity/${entityId}/events/${eventId}/rsvp`, { response })
  },

  // Volunteer endpoints
  volunteer: {
    searchTemples: (searchParams) => api.get('/volunteer/temples/search', { params: searchParams }),
    joinTemple: (templeId) => api.post(`/volunteer/temples/${templeId}/join`),
    getAssignments: (entityId) => api.get(`/volunteer/entity/${entityId}/assignments`),
    updateAssignmentStatus: (entityId, assignmentId, status) => api.patch(`/volunteer/entity/${entityId}/assignments/${assignmentId}`, { status }),
    getSchedule: (entityId, params) => api.get(`/volunteer/entity/${entityId}/schedule`, { params })
  },

  // Super Admin endpoints (internal only)
  admin: {
    getPendingTenants: () => api.get('/admin/tenants/pending'),
    approveTenant: (tenantId, notes) => api.post(`/admin/tenants/${tenantId}/approve`, { notes }),
    rejectTenant: (tenantId, reason) => api.post(`/admin/tenants/${tenantId}/reject`, { reason }),
    
    getPendingTemples: () => api.get('/admin/temples/pending'),
    approveTemple: (templeId, notes) => api.post(`/admin/temples/${templeId}/approve`, { notes }),
    rejectTemple: (templeId, reason) => api.post(`/admin/temples/${templeId}/reject`, { reason }),
    
    getSystemStats: () => api.get('/admin/stats')
  }
}

export default api