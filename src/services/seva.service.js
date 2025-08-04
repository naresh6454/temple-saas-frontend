// src/services/seva.service.js
import api from '@/plugins/axios'

class SevaService {
  /**
   * Get all sevas for the current entity (temple)
   * @param {Object} params - Query parameters for filtering (seva_type, search, page, limit)
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getSevas(params = {}) {
  try {
    console.log('Requesting sevas with params:', params)
    
    const response = await api.get('/v1/sevas', { params })
    
    console.log('Seva response:', response.data)
    
    return {
      success: true,
      data: response.data?.sevas || [],
      pagination: response.data?.pagination || {}
    }
  } catch (error) {
    console.error('Error fetching sevas:', error)
    console.error('Error details:', error.response?.data || 'No response data')
    
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch sevas',
      data: []
    }
  }
}

  /**
   * Book a seva
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Object>} Booking response
   */
  async bookSeva(bookingData) {
    try {
      const response = await api.post('/v1/sevas/bookings', bookingData)
      
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
        data: null
      }
    }
  }

  /**
   * Get user's seva bookings
   * @returns {Promise<Object>} User's booking history
   */
  async getMyBookings() {
    try {
      const response = await api.get('/v1/sevas/my-bookings')
      
      return {
        success: true,
        data: response.data?.bookings || []
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking history',
        data: []
      }
    }
  }

  /**
   * Get seva by ID
   * @param {string} sevaId - Seva ID
   * @returns {Promise<Object>} Seva details
   */
  async getSevaById(sevaId) {
    try {
      const response = await api.get(`/v1/sevas/${sevaId}`)
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

  // Rest of the methods remain unchanged
  async createSeva(sevaData) {
    try {
      console.log('Creating seva with data:', sevaData)
      const response = await api.post('/v1/sevas', sevaData)
      
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

  async updateSeva(sevaId, sevaData) {
    try {
      console.log('Updating seva with ID:', sevaId, 'Data:', sevaData)
      const response = await api.put(`/v1/sevas/${sevaId}`, sevaData)
      
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

  async deleteSeva(sevaId) {
    try {
      await api.delete(`/v1/sevas/${sevaId}`)
      
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

  async getEntityBookings() {
    try {
      const response = await api.get('/v1/sevas/entity-bookings')
      
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

  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.patch(`/v1/sevas/bookings/${bookingId}/status`, { 
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
}

// Export singleton instance
export const sevaService = new SevaService()
export default sevaService