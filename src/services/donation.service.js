// donation.service.js
import api from './api.js'

/**
 * Donation Service
 * Handles all donation-related API operations for the temple SaaS platform
 * Supports multi-tenant architecture with entity-specific operations
 */

class DonationService {
  constructor() {
    this.baseUrl = '/api/v1'
  }

  // ==================== DONATION MANAGEMENT ====================

  /**
   * Create a new donation
   * @param {string} entityId - Temple entity ID
   * @param {Object} donationData - Donation details
   * @returns {Promise} API response
   */
  async createDonation(entityId, donationData) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donations`, {
        amount: donationData.amount,
        donationType: donationData.donationType,
        paymentMethod: donationData.paymentMethod,
        devoteeId: donationData.devoteeId,
        dedicatedTo: donationData.dedicatedTo,
        isAnonymous: donationData.isAnonymous || false,
        notes: donationData.notes,
        receiptRequired: donationData.receiptRequired || true,
        sevaId: donationData.sevaId, // Optional: if donation is for specific seva
        eventId: donationData.eventId, // Optional: if donation is for specific event
        recurringType: donationData.recurringType, // 'one-time', 'monthly', 'yearly'
        recurringEndDate: donationData.recurringEndDate,
        taxExemptionClaimed: donationData.taxExemptionClaimed || false
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to create donation')
    }
  }

  /**
   * Get donations for an entity with filtering and pagination
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with donations list
   */
  async getDonations(entityId, params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        donationType: params.donationType,
        paymentMethod: params.paymentMethod,
        devoteeId: params.devoteeId,
        status: params.status,
        isAnonymous: params.isAnonymous,
        recurringType: params.recurringType,
        search: params.search // Search by devotee name, receipt number, notes
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donations')
    }
  }

  /**
   * Get donation by ID
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @returns {Promise} API response with donation details
   */
  async getDonationById(entityId, donationId) {
    try {
      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/${donationId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donation details')
    }
  }

  /**
   * Update donation details
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @param {Object} updateData - Updated donation data
   * @returns {Promise} API response
   */
  async updateDonation(entityId, donationId, updateData) {
    try {
      const response = await api.put(`${this.baseUrl}/entities/${entityId}/donations/${donationId}`, updateData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update donation')
    }
  }

  /**
   * Delete donation (soft delete)
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @returns {Promise} API response
   */
  async deleteDonation(entityId, donationId) {
    try {
      const response = await api.delete(`${this.baseUrl}/entities/${entityId}/donations/${donationId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to delete donation')
    }
  }

  // ==================== DONATION REPORTS & ANALYTICS ====================

  /**
   * Get donation statistics for dashboard
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with donation stats
   */
  async getDonationStats(entityId, params = {}) {
    try {
      const queryParams = {
        period: params.period || 'month', // 'today', 'week', 'month', 'year', 'custom'
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        groupBy: params.groupBy || 'day' // 'day', 'week', 'month'
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/stats`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donation statistics')
    }
  }

  /**
   * Get top donors for the entity
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with top donors
   */
  async getTopDonors(entityId, params = {}) {
    try {
      const queryParams = {
        limit: params.limit || 10,
        period: params.period || 'year',
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        includeAnonymous: params.includeAnonymous || false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/top-donors`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top donors')
    }
  }

  /**
   * Get donation trends and analytics
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with donation trends
   */
  async getDonationTrends(entityId, params = {}) {
    try {
      const queryParams = {
        period: params.period || 'year',
        groupBy: params.groupBy || 'month',
        donationType: params.donationType,
        compareWithPrevious: params.compareWithPrevious || false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/trends`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donation trends')
    }
  }

  // ==================== DONATION RECEIPTS ====================

  /**
   * Generate donation receipt
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @returns {Promise} API response with receipt data
   */
  async generateReceipt(entityId, donationId) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donations/${donationId}/receipt`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to generate receipt')
    }
  }

  /**
   * Download donation receipt PDF
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @returns {Promise} Blob response for PDF download
   */
  async downloadReceipt(entityId, donationId) {
    try {
      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/${donationId}/receipt/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to download receipt')
    }
  }

  /**
   * Send receipt via email
   * @param {string} entityId - Temple entity ID
   * @param {string} donationId - Donation ID
   * @param {string} email - Recipient email
   * @returns {Promise} API response
   */
  async emailReceipt(entityId, donationId, email) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donations/${donationId}/receipt/email`, {
        email
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to send receipt via email')
    }
  }

  // ==================== RECURRING DONATIONS ====================

  /**
   * Get recurring donations
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with recurring donations
   */
  async getRecurringDonations(entityId, params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status, // 'active', 'paused', 'cancelled', 'expired'
        recurringType: params.recurringType,
        devoteeId: params.devoteeId
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/recurring`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recurring donations')
    }
  }

  /**
   * Update recurring donation status
   * @param {string} entityId - Temple entity ID
   * @param {string} recurringDonationId - Recurring donation ID
   * @param {string} status - New status ('active', 'paused', 'cancelled')
   * @returns {Promise} API response
   */
  async updateRecurringDonationStatus(entityId, recurringDonationId, status) {
    try {
      const response = await api.patch(`${this.baseUrl}/entities/${entityId}/donations/recurring/${recurringDonationId}/status`, {
        status
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update recurring donation status')
    }
  }

  // ==================== DONATION TYPES & CONFIGURATION ====================

  /**
   * Get donation types for the entity
   * @param {string} entityId - Temple entity ID
   * @returns {Promise} API response with donation types
   */
  async getDonationTypes(entityId) {
    try {
      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donation-types`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch donation types')
    }
  }

  /**
   * Create new donation type
   * @param {string} entityId - Temple entity ID
   * @param {Object} donationTypeData - Donation type details
   * @returns {Promise} API response
   */
  async createDonationType(entityId, donationTypeData) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donation-types`, {
        name: donationTypeData.name,
        description: donationTypeData.description,
        suggestedAmount: donationTypeData.suggestedAmount,
        minAmount: donationTypeData.minAmount,
        maxAmount: donationTypeData.maxAmount,
        isActive: donationTypeData.isActive !== false,
        isTaxExempt: donationTypeData.isTaxExempt || false,
        category: donationTypeData.category,
        displayOrder: donationTypeData.displayOrder
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to create donation type')
    }
  }

  // ==================== DEVOTEE DONATION HISTORY ====================

  /**
   * Get donations by devotee
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with devotee's donations
   */
  async getDevoteeDonations(entityId, devoteeId, params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        donationType: params.donationType,
        includeRecurring: params.includeRecurring !== false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/devotees/${devoteeId}/donations`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch devotee donations')
    }
  }

  /**
   * Get devotee donation summary
   * @param {string} entityId - Temple entity ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with donation summary
   */
  async getDevoteeDonationSummary(entityId, devoteeId, params = {}) {
    try {
      const queryParams = {
        period: params.period || 'year',
        includeRecurring: params.includeRecurring !== false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/devotees/${devoteeId}/donations/summary`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch devotee donation summary')
    }
  }

  // ==================== EXPORT & REPORTING ====================

  /**
   * Export donations to Excel/CSV
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Export parameters
   * @returns {Promise} Blob response for file download
   */
  async exportDonations(entityId, params = {}) {
    try {
      const queryParams = {
        format: params.format || 'excel', // 'excel', 'csv', 'pdf'
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        donationType: params.donationType,
        includeDevoteeDetails: params.includeDevoteeDetails !== false,
        includeRecurring: params.includeRecurring !== false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/export`, {
        params: this.cleanParams(queryParams),
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to export donations')
    }
  }

  /**
   * Generate donation report
   * @param {string} entityId - Temple entity ID
   * @param {Object} params - Report parameters
   * @returns {Promise} API response with report data
   */
  async generateDonationReport(entityId, params = {}) {
    try {
      const queryParams = {
        reportType: params.reportType || 'summary', // 'summary', 'detailed', 'trends', 'top-donors'
        period: params.period || 'month',
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        groupBy: params.groupBy,
        includeCharts: params.includeCharts !== false
      }

      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/reports`, {
        params: this.cleanParams(queryParams)
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to generate donation report')
    }
  }

  // ==================== PAYMENT INTEGRATION ====================

  /**
   * Process online donation payment
   * @param {string} entityId - Temple entity ID
   * @param {Object} paymentData - Payment processing data
   * @returns {Promise} API response with payment status
   */
  async processPayment(entityId, paymentData) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donations/payment`, {
        donationId: paymentData.donationId,
        paymentGateway: paymentData.paymentGateway, // 'razorpay', 'stripe', 'payu'
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: paymentData.paymentDetails,
        returnUrl: paymentData.returnUrl,
        webhookUrl: paymentData.webhookUrl
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to process payment')
    }
  }

  /**
   * Verify payment status
   * @param {string} entityId - Temple entity ID
   * @param {string} paymentId - Payment transaction ID
   * @returns {Promise} API response with payment verification
   */
  async verifyPayment(entityId, paymentId) {
    try {
      const response = await api.get(`${this.baseUrl}/entities/${entityId}/donations/payment/${paymentId}/verify`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to verify payment')
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clean parameters by removing undefined/null values
   * @param {Object} params - Parameters object
   * @returns {Object} Cleaned parameters
   */
  cleanParams(params) {
    const cleaned = {}
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleaned[key] = params[key]
      }
    })
    return cleaned
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - API error
   * @param {string} defaultMessage - Default error message
   * @throws {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    const message = error.response?.data?.message || error.message || defaultMessage
    const status = error.response?.status || 500
    const errorDetails = error.response?.data?.errors || {}
    
    const formattedError = new Error(message)
    formattedError.status = status
    formattedError.details = errorDetails
    formattedError.timestamp = new Date().toISOString()
    
    return formattedError
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update donation statuses
   * @param {string} entityId - Temple entity ID
   * @param {Array} donationIds - Array of donation IDs
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  async bulkUpdateStatus(entityId, donationIds, status) {
    try {
      const response = await api.patch(`${this.baseUrl}/entities/${entityId}/donations/bulk/status`, {
        donationIds,
        status
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to bulk update donation statuses')
    }
  }

  /**
   * Bulk generate receipts
   * @param {string} entityId - Temple entity ID
   * @param {Array} donationIds - Array of donation IDs
   * @returns {Promise} API response
   */
  async bulkGenerateReceipts(entityId, donationIds) {
    try {
      const response = await api.post(`${this.baseUrl}/entities/${entityId}/donations/bulk/receipts`, {
        donationIds
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to bulk generate receipts')
    }
  }
}

// Export singleton instance
export default new DonationService()