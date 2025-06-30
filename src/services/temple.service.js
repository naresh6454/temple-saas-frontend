import api from './api.js'

/**
 * Temple Service - Handles all temple-related API operations
 * Supports multi-tenant architecture with role-based access
 */
class TempleService {
  constructor() {
    this.baseUrl = '/api/temples'
  }

  // ==================== TENANT OPERATIONS ====================
  
  /**
   * Create a new temple (Tenant only)
   * @param {Object} templeData - Temple creation data
   * @returns {Promise} API response
   */
  async createTemple(templeData) {
    try {
      const formData = new FormData()
      
      // Basic temple information
      formData.append('name', templeData.name)
      formData.append('description', templeData.description || '')
      formData.append('address', templeData.address)
      formData.append('city', templeData.city)
      formData.append('state', templeData.state)
      formData.append('pincode', templeData.pincode)
      formData.append('country', templeData.country || 'India')
      formData.append('phone', templeData.phone)
      formData.append('email', templeData.email)
      formData.append('website', templeData.website || '')
      
      // Temple details
      formData.append('establishedYear', templeData.establishedYear || '')
      formData.append('mainDeity', templeData.mainDeity || '')
      formData.append('templeType', templeData.templeType || '')
      formData.append('openingTime', templeData.openingTime || '')
      formData.append('closingTime', templeData.closingTime || '')
      
      // Document uploads
      if (templeData.documents && templeData.documents.length > 0) {
        templeData.documents.forEach((doc, index) => {
          formData.append(`documents[${index}]`, doc.file)
          formData.append(`documentTypes[${index}]`, doc.type)
        })
      }
      
      // Temple images
      if (templeData.images && templeData.images.length > 0) {
        templeData.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image)
        })
      }

      const response = await api.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get temples created by current tenant
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getTenantTemples(params = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/tenant`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update temple information (Tenant/Entity Admin)
   * @param {string} templeId - Temple ID
   * @param {Object} updateData - Update data
   * @returns {Promise} API response
   */
  async updateTemple(templeId, updateData) {
    try {
      const response = await api.put(`${this.baseUrl}/${templeId}`, updateData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete temple (Tenant only)
   * @param {string} templeId - Temple ID
   * @returns {Promise} API response
   */
  async deleteTemple(templeId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${templeId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ==================== PUBLIC/USER OPERATIONS ====================

  /**
   * Search approved temples (Public access)
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} API response
   */
  async searchTemples(searchParams = {}) {
    try {
      const params = {
        search: searchParams.search || '',
        city: searchParams.city || '',
        state: searchParams.state || '',
        mainDeity: searchParams.mainDeity || '',
        templeType: searchParams.templeType || '',
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        status: 'APPROVED' // Only show approved temples
      }

      const response = await api.get(`${this.baseUrl}/search`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get temple details by ID (Public access for approved temples)
   * @param {string} templeId - Temple ID
   * @returns {Promise} API response
   */
  async getTempleById(templeId) {
    try {
      const response = await api.get(`${this.baseUrl}/${templeId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Join a temple (Devotee/Volunteer)
   * @param {string} templeId - Temple ID
   * @param {Object} joinData - Join request data
   * @returns {Promise} API response
   */
  async joinTemple(templeId, joinData = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/${templeId}/join`, joinData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Leave a temple (Devotee/Volunteer)
   * @param {string} templeId - Temple ID
   * @returns {Promise} API response
   */
  async leaveTemple(templeId) {
    try {
      const response = await api.post(`${this.baseUrl}/${templeId}/leave`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user's joined temples
   * @returns {Promise} API response
   */
  async getMyTemples() {
    try {
      const response = await api.get(`${this.baseUrl}/my-temples`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ==================== SUPER ADMIN OPERATIONS ====================

  /**
   * Get all temples with approval status (Super Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getAllTemplesForApproval(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status || '',
        search: params.search || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }

      const response = await api.get(`${this.baseUrl}/admin/all`, { params: queryParams })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Approve temple (Super Admin only)
   * @param {string} templeId - Temple ID
   * @param {Object} approvalData - Approval data with notes
   * @returns {Promise} API response
   */
  async approveTemple(templeId, approvalData = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/${templeId}/approve`, {
        notes: approvalData.notes || '',
        approvedBy: approvalData.approvedBy || null
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Reject temple (Super Admin only)
   * @param {string} templeId - Temple ID
   * @param {Object} rejectionData - Rejection data with notes
   * @returns {Promise} API response
   */
  async rejectTemple(templeId, rejectionData = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/${templeId}/reject`, {
        notes: rejectionData.notes || 'Temple registration rejected',
        rejectedBy: rejectionData.rejectedBy || null,
        reason: rejectionData.reason || ''
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ==================== ENTITY ADMIN OPERATIONS ====================

  /**
   * Get temple members (Entity Admin)
   * @param {string} templeId - Temple ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getTempleMembers(templeId, params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        role: params.role || '', // devotee, volunteer
        search: params.search || '',
        isActive: params.isActive !== undefined ? params.isActive : true
      }

      const response = await api.get(`${this.baseUrl}/${templeId}/members`, { params: queryParams })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get temple statistics (Entity Admin)
   * @param {string} templeId - Temple ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getTempleStats(templeId, params = {}) {
    try {
      const queryParams = {
        period: params.period || 'month', // day, week, month, year
        startDate: params.startDate || '',
        endDate: params.endDate || ''
      }

      const response = await api.get(`${this.baseUrl}/${templeId}/stats`, { params: queryParams })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update temple settings (Entity Admin)
   * @param {string} templeId - Temple ID
   * @param {Object} settings - Temple settings
   * @returns {Promise} API response
   */
  async updateTempleSettings(templeId, settings) {
    try {
      const response = await api.put(`${this.baseUrl}/${templeId}/settings`, settings)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Upload temple documents
   * @param {string} templeId - Temple ID
   * @param {Array} documents - Document files
   * @returns {Promise} API response
   */
  async uploadDocuments(templeId, documents) {
    try {
      const formData = new FormData()
      
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc.file)
        formData.append(`documentTypes[${index}]`, doc.type)
        formData.append(`documentNames[${index}]`, doc.name || doc.file.name)
      })

      const response = await api.post(`${this.baseUrl}/${templeId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get temple documents
   * @param {string} templeId - Temple ID
   * @returns {Promise} API response
   */
  async getTempleDocuments(templeId) {
    try {
      const response = await api.get(`${this.baseUrl}/${templeId}/documents`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete temple document
   * @param {string} templeId - Temple ID
   * @param {string} documentId - Document ID
   * @returns {Promise} API response
   */
  async deleteDocument(templeId, documentId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${templeId}/documents/${documentId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get available temple types
   * @returns {Promise} API response
   */
  async getTempleTypes() {
    try {
      const response = await api.get(`${this.baseUrl}/types`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get popular deities list
   * @returns {Promise} API response
   */
  async getDeities() {
    try {
      const response = await api.get(`${this.baseUrl}/deities`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get states and cities for temple registration
   * @returns {Promise} API response
   */
  async getLocations() {
    try {
      const response = await api.get(`${this.baseUrl}/locations`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Handle API errors consistently
   * @param {Error} error - API error
   * @returns {Object} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      return {
        message: data.message || 'An error occurred',
        status,
        errors: data.errors || [],
        code: data.code || 'UNKNOWN_ERROR'
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        errors: [],
        code: 'NETWORK_ERROR'
      }
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 500,
        errors: [],
        code: 'UNEXPECTED_ERROR'
      }
    }
  }
}

// Export singleton instance
export default new TempleService()