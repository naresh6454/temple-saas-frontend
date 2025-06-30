/**
 * Devotee Service
 * Handles all devotee-related API operations for the Multi-Tenant Temple SaaS Platform
 * Supports entity-scoped operations for multi-tenant architecture
 */

import api from './api.js'

class DevoteeService {
  constructor() {
    this.baseEndpoint = '/devotees'
  }

  /**
   * Get all devotees for a specific entity/temple
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters (page, limit, search, filters)
   * @returns {Promise<Object>} Devotees list with pagination
   */
  async getDevotees(entityId, params = {}) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          gender: params.gender || '',
          age_group: params.ageGroup || '',
          seva_preferences: params.sevaPreferences || '',
          sort_by: params.sortBy || 'created_at',
          sort_order: params.sortOrder || 'desc',
          ...params
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch devotees')
    }
  }

  /**
   * Get devotee by ID
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @returns {Promise<Object>} Devotee details
   */
  async getDevoteeById(entityId, devoteeId) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch devotee details')
    }
  }

  /**
   * Create new devotee profile
   * @param {string} entityId - Temple entity ID
   * @param {Object} devoteeData - Devotee information
   * @returns {Promise<Object>} Created devotee
   */
  async createDevotee(entityId, devoteeData) {
    try {
      const response = await api.post(`/entities/${entityId}${this.baseEndpoint}`, devoteeData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to create devotee profile')
    }
  }

  /**
   * Update devotee profile
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} updateData - Updated devotee information
   * @returns {Promise<Object>} Updated devotee
   */
  async updateDevotee(entityId, devoteeId, updateData) {
    try {
      const response = await api.put(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}`, updateData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update devotee profile')
    }
  }

  /**
   * Update devotee profile step by step (for multi-step form)
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {string} step - Step name (personal, spiritual, family, preferences, members, notes)
   * @param {Object} stepData - Step-specific data
   * @returns {Promise<Object>} Updated devotee with completion status
   */
  async updateDevoteeStep(entityId, devoteeId, step, stepData) {
    try {
      const response = await api.patch(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/steps/${step}`, stepData)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to update ${step} information`)
    }
  }

  /**
   * Deactivate/Activate devotee
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated devotee status
   */
  async toggleDevoteeStatus(entityId, devoteeId, isActive) {
    try {
      const response = await api.patch(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/status`, {
        is_active: isActive
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update devotee status')
    }
  }

  /**
   * Delete devotee (soft delete)
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteDevotee(entityId, devoteeId) {
    try {
      const response = await api.delete(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to delete devotee')
    }
  }

  /**
   * Get devotee statistics for dashboard
   * @param {string} entityId - Temple entity ID
   * @returns {Promise<Object>} Devotee statistics
   */
  async getDevoteeStats(entityId) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/stats`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch devotee statistics')
    }
  }

  /**
   * Get devotee seva history
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Seva booking history
   */
  async getDevoteeSevaHistory(entityId, devoteeId, params = {}) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/sevas`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || '',
          date_from: params.dateFrom || '',
          date_to: params.dateTo || '',
          ...params
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch seva history')
    }
  }

  /**
   * Get devotee donation history
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Donation history
   */
  async getDevoteeDonationHistory(entityId, devoteeId, params = {}) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/donations`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          date_from: params.dateFrom || '',
          date_to: params.dateTo || '',
          ...params
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donation history')
    }
  }

  /**
   * Get devotee event participation
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Event participation history
   */
  async getDevoteeEvents(entityId, devoteeId, params = {}) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/events`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || '', // registered, attended, cancelled
          upcoming: params.upcoming || false,
          ...params
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch event participation')
    }
  }

  /**
   * Export devotees data
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Export parameters
   * @param {string} format - Export format (excel, pdf, csv)
   * @returns {Promise<Blob>} File blob for download
   */
  async exportDevotees(entityId, params = {}, format = 'excel') {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/export`, {
        params: {
          format,
          search: params.search || '',
          status: params.status || '',
          gender: params.gender || '',
          age_group: params.ageGroup || '',
          seva_preferences: params.sevaPreferences || '',
          include_family: params.includeFamily || false,
          include_history: params.includeHistory || false,
          ...params
        },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to export devotees data')
    }
  }

  /**
   * Bulk import devotees
   * @param {string} entityId - Temple entity ID
   * @param {File} file - Excel/CSV file
   * @returns {Promise<Object>} Import results
   */
  async importDevotees(entityId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post(`/entities/${entityId}${this.baseEndpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to import devotees')
    }
  }

  /**
   * Send welcome email to devotee
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @returns {Promise<Object>} Email sent confirmation
   */
  async sendWelcomeEmail(entityId, devoteeId) {
    try {
      const response = await api.post(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/welcome-email`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to send welcome email')
    }
  }

  /**
   * Get devotee profile completion status
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @returns {Promise<Object>} Profile completion details
   */
  async getProfileCompletion(entityId, devoteeId) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/profile-completion`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch profile completion status')
    }
  }

  /**
   * Search devotees across all fields
   * @param {string} entityId - Temple entity ID
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchDevotees(entityId, query, filters = {}) {
    try {
      const response = await api.post(`/entities/${entityId}${this.baseEndpoint}/search`, {
        query,
        filters: {
          status: filters.status || '',
          gender: filters.gender || '',
          age_group: filters.ageGroup || '',
          seva_preferences: filters.sevaPreferences || '',
          family_size: filters.familySize || '',
          registration_date_from: filters.registrationDateFrom || '',
          registration_date_to: filters.registrationDateTo || '',
          ...filters
        },
        options: {
          include_family: filters.includeFamily || false,
          include_contact: filters.includeContact || false,
          fuzzy_search: filters.fuzzySearch || true
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to search devotees')
    }
  }

  /**
   * Get devotee family members
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @returns {Promise<Object>} Family members list
   */
  async getFamilyMembers(entityId, devoteeId) {
    try {
      const response = await api.get(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/family`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch family members')
    }
  }

  /**
   * Update family members
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Array} familyMembers - Family members data
   * @returns {Promise<Object>} Updated family members
   */
  async updateFamilyMembers(entityId, devoteeId, familyMembers) {
    try {
      const response = await api.put(`/entities/${entityId}${this.baseEndpoint}/${devoteeId}/family`, {
        family_members: familyMembers
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update family members')
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - API error
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      const message = data?.message || data?.error || defaultMessage
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`)
        case 401:
          return new Error('Authentication required. Please login again.')
        case 403:
          return new Error('Access denied. Insufficient permissions.')
        case 404:
          return new Error('Devotee not found or temple access denied.')
        case 409:
          return new Error(`Conflict: ${message}`)
        case 422:
          return new Error(`Validation Error: ${message}`)
        case 429:
          return new Error('Too many requests. Please try again later.')
        case 500:
          return new Error('Server error. Please try again later.')
        default:
          return new Error(`${defaultMessage}: ${message}`)
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.')
    } else {
      // Other error
      return new Error(error.message || defaultMessage)
    }
  }
}

// Export singleton instance
export default new DevoteeService()