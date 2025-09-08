// src/services/seva.service.js - Complete updated version

import api from '@/plugins/axios'

class SevaService {

  /**
   * Get all sevas for the current entity (temple) - matches /entity-sevas route
   * @param {Object} params - Query parameters for filtering (seva_type, search, page, limit)
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getSevas(params = {}) {
    try {
      console.log('Requesting sevas with params:', params)
      
      // Use entity-sevas endpoint for temple admin view
      const response = await api.get('/v1/sevas/entity-sevas', { params })
      
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
   * Get all sevas for devotees - matches / route with devotee middleware
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getDevoteeSevas(params = {}) {
    try {
      console.log('Requesting devotee sevas with params:', params)
      
      const response = await api.get('/v1/sevas', { params })
      
      console.log('Devotee seva response:', response.data)
      
      return {
        success: true,
        data: response.data?.sevas || [],
        pagination: response.data?.pagination || {}
      }
    } catch (error) {
      console.error('Error fetching devotee sevas:', error)
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get seva by ID - matches /:id route
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

  /**
   * Get booking counts - matches /booking-counts route
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingCounts() {
    try {
      const response = await api.get('/v1/sevas/booking-counts')
      return {
        success: true,
        data: response.data || {}
      }
    } catch (error) {
      console.error('Error fetching booking counts:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking counts',
        data: {}
      }
    }
  }

  /**
   * Create a new seva - matches POST / route
   * @param {Object} sevaData - Seva data to create
   * @returns {Promise<Object>} Creation response
   */
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

  /**
   * Update seva - matches PUT /:id route
   * @param {string} sevaId - Seva ID to update
   * @param {Object} sevaData - Updated seva data
   * @returns {Promise<Object>} Update response
   */
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

  /**
   * Delete seva - matches DELETE /:id route
   * @param {string} sevaId - Seva ID to delete
   * @returns {Promise<Object>} Delete response
   */
  async deleteSeva(sevaId) {
    try {
      console.log('Deleting seva with ID:', sevaId)
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

  /**
   * Book a seva - matches POST /bookings route (devotee only)
   * @param {number} sevaId - Seva ID to book
   * @returns {Promise<Object>} Booking response
   */
  async bookSeva(sevaId) {
    const payload = { seva_id: sevaId };

    try {
      const response = await api.post('/v1/sevas/bookings', payload);

      return {
        success: true,
        data: response.data,
        message: 'Seva booked successfully'
      };
    } catch (error) {
      console.error('Error booking seva:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to book seva'
      };
    }
  }

  /**
   * Get user's seva bookings - matches GET /my-bookings route (devotee only)
   * @returns {Promise<Object>} User's booking history
   */
  async getMyBookings() {
    try {
      const response = await api.get('/v1/sevas/my-bookings');
      return {
        success: true,
        data: response.data?.bookings || []
      };
    } catch (error) {
      console.error('Error fetching my bookings:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking history',
        data: []
      };
    }
  }

  /**
   * Get entity bookings - matches GET /entity-bookings route (temple admin)
   * @param {string} entityId - Optional entity ID to filter bookings
   * @returns {Promise<Object>} Entity bookings with pagination
   */
  async getEntityBookings(entityId) {
    try {
      // If entityId is provided, use it in the request
      const url = entityId ? `/v1/sevas/entity-bookings?entity_id=${entityId}` : '/v1/sevas/entity-bookings'
      const response = await api.get(url)
      
      return {
        success: true,
        data: response.data.bookings || [], 
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
   * Get booking by ID - matches GET /bookings/:id route (temple admin)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/v1/sevas/bookings/${bookingId}`)
      return {
        success: true,
        data: response.data || null
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking details',
        data: null
      }
    }
  }

  /**
   * Update booking status - matches PATCH /bookings/:id/status route (temple admin)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (approved, rejected, completed, etc.)
   * @returns {Promise<Object>} Status update response
   */
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

  /**
   * Helper method to save booking to localStorage (for UI simulation)
   * @private
   * @param {number} sevaId - Seva ID to save
   */
  _saveBookingToLocalStorage(sevaId) {
    try {
      // Get existing bookings
      const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
      
      // Add this booking if not already present
      if (!existingBookings.some(b => b.seva_id === sevaId)) {
        existingBookings.push({
          id: Math.floor(Math.random() * 1000),
          seva_id: sevaId,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('user_bookings', JSON.stringify(existingBookings));
      }
    } catch (e) {
      console.error('Error saving booking to localStorage:', e);
    }
  }
}

// Export singleton instance
export const sevaService = new SevaService()
export default sevaService