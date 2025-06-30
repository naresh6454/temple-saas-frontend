// src/services/seva.service.js
import { apiClient } from './api.js'

class SevaService {
  /**
   * Get all sevas for a specific entity (temple)
   * @param {string} entityId - Temple ID
   * @param {Object} params - Query parameters (page, limit, search, status, type)
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getSevas(entityId, params = {}) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas`, { params })
      return {
        success: true,
        data: response.data.sevas || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching sevas:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get seva by ID
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @returns {Promise<Object>} Seva details
   */
  async getSevaById(entityId, sevaId) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas/${sevaId}`)
      return {
        success: true,
        data: response.data.seva || null
      }
    } catch (error) {
      console.error('Error fetching seva:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch seva details',
        data: null
      }
    }
  }

  /**
   * Create new seva
   * @param {string} entityId - Temple ID
   * @param {Object} sevaData - Seva information
   * @returns {Promise<Object>} Created seva
   */
  async createSeva(entityId, sevaData) {
    try {
      const response = await apiClient.post(`/entities/${entityId}/sevas`, sevaData)
      return {
        success: true,
        data: response.data.seva,
        message: 'Seva created successfully'
      }
    } catch (error) {
      console.error('Error creating seva:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Update seva
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {Object} sevaData - Updated seva information
   * @returns {Promise<Object>} Updated seva
   */
  async updateSeva(entityId, sevaId, sevaData) {
    try {
      const response = await apiClient.put(`/entities/${entityId}/sevas/${sevaId}`, sevaData)
      return {
        success: true,
        data: response.data.seva,
        message: 'Seva updated successfully'
      }
    } catch (error) {
      console.error('Error updating seva:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Delete seva
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @returns {Promise<Object>} Success status
   */
  async deleteSeva(entityId, sevaId) {
    try {
      await apiClient.delete(`/entities/${entityId}/sevas/${sevaId}`)
      return {
        success: true,
        message: 'Seva deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting seva:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete seva'
      }
    }
  }

  /**
   * Get seva bookings for a specific seva
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Seva bookings
   */
  async getSevaBookings(entityId, sevaId, params = {}) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas/${sevaId}/bookings`, { params })
      return {
        success: true,
        data: response.data.bookings || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching seva bookings:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch seva bookings',
        data: []
      }
    }
  }

  /**
   * Book a seva for devotee
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} Booking confirmation
   */
  async bookSeva(entityId, sevaId, bookingData) {
    try {
      const response = await apiClient.post(`/entities/${entityId}/sevas/${sevaId}/book`, bookingData)
      return {
        success: true,
        data: response.data.booking,
        message: 'Seva booked successfully'
      }
    } catch (error) {
      console.error('Error booking seva:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to book seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Cancel seva booking
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Cancellation status
   */
  async cancelSevaBooking(entityId, sevaId, bookingId) {
    try {
      await apiClient.delete(`/entities/${entityId}/sevas/${sevaId}/bookings/${bookingId}`)
      return {
        success: true,
        message: 'Seva booking cancelled successfully'
      }
    } catch (error) {
      console.error('Error cancelling seva booking:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel seva booking'
      }
    }
  }

  /**
   * Approve/Reject seva booking (Entity Admin only)
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {string} bookingId - Booking ID
   * @param {string} status - 'approved' or 'rejected'
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Updated booking status
   */
  async updateBookingStatus(entityId, sevaId, bookingId, status, notes = '') {
    try {
      const response = await apiClient.patch(
        `/entities/${entityId}/sevas/${sevaId}/bookings/${bookingId}/status`,
        { status, notes }
      )
      return {
        success: true,
        data: response.data.booking,
        message: `Seva booking ${status} successfully`
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update booking status'
      }
    }
  }

  /**
   * Get seva types/categories for dropdown
   * @returns {Promise<Object>} Seva types list
   */
  async getSevaTypes() {
    try {
      const response = await apiClient.get('/seva-types')
      return {
        success: true,
        data: response.data.types || []
      }
    } catch (error) {
      console.error('Error fetching seva types:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch seva types',
        data: []
      }
    }
  }

  /**
   * Get available seva slots for a specific date
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Available slots
   */
  async getAvailableSlots(entityId, sevaId, date) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas/${sevaId}/slots`, {
        params: { date }
      })
      return {
        success: true,
        data: response.data.slots || []
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch available slots',
        data: []
      }
    }
  }

  /**
   * Get devotee's seva bookings
   * @param {string} entityId - Temple ID
   * @param {string} devoteeId - Devotee ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Devotee's seva bookings
   */
  async getDevoteeSevaBookings(entityId, devoteeId, params = {}) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/devotees/${devoteeId}/seva-bookings`, { params })
      return {
        success: true,
        data: response.data.bookings || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching devotee seva bookings:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch seva bookings',
        data: []
      }
    }
  }

  /**
   * Get seva statistics for dashboard
   * @param {string} entityId - Temple ID
   * @param {Object} params - Query parameters (period, startDate, endDate)
   * @returns {Promise<Object>} Seva statistics
   */
  async getSevaStats(entityId, params = {}) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas/stats`, { params })
      return {
        success: true,
        data: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching seva stats:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch seva statistics',
        data: {}
      }
    }
  }

  /**
   * Export seva bookings to Excel/PDF
   * @param {string} entityId - Temple ID
   * @param {Object} params - Export parameters (format, filters, dateRange)
   * @returns {Promise<Object>} Export file or download link
   */
  async exportSevaBookings(entityId, params = {}) {
    try {
      const response = await apiClient.get(`/entities/${entityId}/sevas/export`, {
        params,
        responseType: 'blob'
      })
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'seva-bookings.xlsx'
      }
    } catch (error) {
      console.error('Error exporting seva bookings:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export seva bookings'
      }
    }
  }

  /**
   * Assign volunteer to seva
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {string} volunteerId - Volunteer ID
   * @returns {Promise<Object>} Assignment status
   */
  async assignVolunteer(entityId, sevaId, volunteerId) {
    try {
      const response = await apiClient.post(`/entities/${entityId}/sevas/${sevaId}/assign-volunteer`, {
        volunteerId
      })
      return {
        success: true,
        data: response.data,
        message: 'Volunteer assigned successfully'
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign volunteer'
      }
    }
  }

  /**
   * Remove volunteer from seva
   * @param {string} entityId - Temple ID
   * @param {string} sevaId - Seva ID
   * @param {string} volunteerId - Volunteer ID
   * @returns {Promise<Object>} Removal status
   */
  async removeVolunteer(entityId, sevaId, volunteerId) {
    try {
      await apiClient.delete(`/entities/${entityId}/sevas/${sevaId}/volunteers/${volunteerId}`)
      return {
        success: true,
        message: 'Volunteer removed successfully'
      }
    } catch (error) {
      console.error('Error removing volunteer:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove volunteer'
      }
    }
  }
}

// Export singleton instance
export const sevaService = new SevaService()
export default sevaService