// src/services/seva.service.js
import api from '@/plugins/axios'

class SevaService {
  /**
   * Get all sevas for a specific entity (temple)
   * @param {string} entityId - Temple ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getSevas(entityId, params = {}) {
    try {
      // Match backend route GET /sevas/ with entity_id as a query param
      const response = await api.get('/sevas', { 
        params: { ...params, entity_id: entityId } 
      })
      
      return {
        success: true,
        data: response.data || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching sevas:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
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
      // Use GET /sevas/:id endpoint
      const response = await api.get(`/sevas/${sevaId}`, {
        params: { entity_id: entityId }
      })
      return {
        success: true,
        data: response.data || null
      }
    } catch (error) {
      console.error('Error fetching seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch seva details',
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
      // Match backend route POST /sevas/
      const payload = {
        ...sevaData,
        entity_id: entityId
      }
      
      const response = await api.post('/sevas', payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Seva created successfully'
      }
    } catch (error) {
      console.error('Error creating seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create seva',
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
      // Since there's no direct PUT /sevas/:id in your routes, we'll use the same path
      // but make sure to include entity_id in the payload
      const payload = {
        ...sevaData,
        entity_id: entityId
      }
      
      const response = await api.put(`/sevas/${sevaId}`, payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Seva updated successfully'
      }
    } catch (error) {
      console.error('Error updating seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update seva',
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
      // Since there's no direct DELETE /sevas/:id in your routes, we'll use the same path
      // but include entity_id as a query param
      await api.delete(`/sevas/${sevaId}`, {
        params: { entity_id: entityId }
      })
      
      return {
        success: true,
        message: 'Seva deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete seva'
      }
    }
  }

  /**
   * Get seva bookings for entity (temple)
   * @param {string} entityId - Temple ID
   * @returns {Promise<Object>} Entity seva bookings
   */
  async getEntityBookings(entityId) {
    try {
      // Match backend route GET /sevas/entity-bookings
      const response = await api.get('/sevas/entity-bookings', {
        params: { entity_id: entityId }
      })
      
      return {
        success: true,
        data: response.data || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching entity bookings:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch bookings',
        data: []
      }
    }
  }

  /**
   * Book a seva for devotee
   * @param {string} entityId - Temple ID
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} Booking confirmation
   */
  async bookSeva(entityId, bookingData) {
    try {
      // Match backend route POST /sevas/bookings
      const payload = {
        ...bookingData,
        entity_id: entityId
      }
      
      const response = await api.post('/sevas/bookings', payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Seva booked successfully'
      }
    } catch (error) {
      console.error('Error booking seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to book seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Update booking status (approve/reject)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (approved/rejected)
   * @returns {Promise<Object>} Updated booking
   */
  async updateBookingStatus(bookingId, status) {
    try {
      // Match backend route PATCH /sevas/bookings/:id/status
      const response = await api.patch(`/sevas/bookings/${bookingId}/status`, { 
        status 
      })
      
      return {
        success: true,
        data: response.data,
        message: `Booking ${status} successfully`
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update booking status'
      }
    }
  }

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Cancellation status
   */
  async cancelBooking(bookingId) {
    try {
      // Match backend route PATCH /sevas/bookings/:id/cancel
      const response = await api.patch(`/sevas/bookings/${bookingId}/cancel`)
      
      return {
        success: true,
        message: 'Booking cancelled successfully'
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel booking'
      }
    }
  }

  /**
   * Get my seva bookings (devotee only)
   * @returns {Promise<Object>} My bookings
   */
  async getMyBookings() {
    try {
      // Match backend route GET /sevas/my-bookings
      const response = await api.get('/sevas/my-bookings')
      
      return {
        success: true,
        data: response.data || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch bookings',
        data: []
      }
    }
  }
}

// Export singleton instance
export const sevaService = new SevaService()
export default sevaService