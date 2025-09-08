// src/stores/seva.js - Updated to match backend routes
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sevaService } from '@/services/seva.service'

export const useSevaStore = defineStore('seva', () => {
  // State
  const sevas = ref([])
  const sevaBookings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const filters = ref({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  })
  const selectedSeva = ref(null)
  
  // New state for recent sevas and booking counts
  const recentSevas = ref([])
  const loadingRecentSevas = ref(false)
  const bookingCounts = ref({})
  const loadingBookingCounts = ref(false)
  
  // State for seva catalog (all available sevas)
  const sevaCatalog = ref([])
  const loadingCatalog = ref(false)
  
  // Computed properties
  const filteredSevas = computed(() => {
    let filtered = sevas.value
    
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(seva =>
        seva.name?.toLowerCase().includes(query) ||
        seva.description?.toLowerCase().includes(query)
      )
    }
    
    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(seva => seva.status === filters.value.status)
    }
    
    // Type filter
    if (filters.value.type !== 'all') {
      filtered = filtered.filter(seva => seva.type === filters.value.type)
    }
    
    return filtered
  })
  
  // Computed stats
  const sevaStats = computed(() => ({
    total: sevas.value.length,
    active: sevas.value.filter(s => s.is_active).length,
    pending: sevas.value.filter(s => s.status === 'pending').length,
  }))
  
  // Actions - Connect to backend API
  
  /**
   * Fetch sevas for temple admin view - uses /entity-sevas endpoint
   * @param {Object} params - Query parameters
   * @returns {Array} Seva list
   */
  const fetchSevas = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getSevas({
        page: params.page || 1,
        limit: params.limit || 10,
        seva_type: params.seva_type || '',
        search: params.search || ''
      })
      
      if (response.success) {
        sevas.value = response.data || []
        return sevas.value
      } else {
        error.value = response.error
        return []
      }
    } catch (err) {
      console.error('Error fetching sevas:', err)
      error.value = err.message || 'Failed to fetch sevas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch sevas for devotee view - uses / endpoint with devotee middleware
   * @param {Object} params - Query parameters
   * @returns {Array} Seva list
   */
  const fetchDevoteeSevas = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getDevoteeSevas({
        page: params.page || 1,
        limit: params.limit || 10,
        seva_type: params.seva_type || '',
        search: params.search || ''
      })
      
      if (response.success) {
        sevas.value = response.data || []
        return sevas.value
      } else {
        error.value = response.error
        return []
      }
    } catch (err) {
      console.error('Error fetching devotee sevas:', err)
      error.value = err.message || 'Failed to fetch sevas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch booking counts - uses /booking-counts endpoint
   * @returns {Object} Booking statistics
   */
  const fetchBookingCounts = async () => {
    loadingBookingCounts.value = true
    
    try {
      const response = await sevaService.getBookingCounts()
      
      if (response.success) {
        bookingCounts.value = response.data || {}
        return bookingCounts.value
      } else {
        console.error('Failed to fetch booking counts:', response.error)
        bookingCounts.value = {}
        return {}
      }
    } catch (error) {
      console.error('Error fetching booking counts:', error)
      bookingCounts.value = {}
      return {}
    } finally {
      loadingBookingCounts.value = false
    }
  }
  
  /**
   * Fetch seva catalog for mapping purposes
   * @returns {Array} Complete seva catalog
   */
  const fetchSevaCatalog = async () => {
    loadingCatalog.value = true
    try {
      const response = await sevaService.getSevas({
        page: 1,
        limit: 1000, // Get all sevas
        search: ''
      })
      
      if (response.success) {
        sevaCatalog.value = response.data || []
        console.log('Seva catalog loaded:', sevaCatalog.value)
        return sevaCatalog.value
      } else {
        console.error('Failed to fetch seva catalog:', response.error)
        sevaCatalog.value = []
        return []
      }
    } catch (error) {
      console.error('Error fetching seva catalog:', error)
      sevaCatalog.value = []
      return []
    } finally {
      loadingCatalog.value = false
    }
  }
  
  /**
   * Fetch entity bookings - uses /entity-bookings endpoint
   * @param {string} entityId - Optional entity ID filter
   * @returns {Array} Booking list
   */
  const fetchEntityBookings = async (entityId = null) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getEntityBookings(entityId)
      
      if (response.success) {
        sevaBookings.value = response.data || []
        return sevaBookings.value
      } else {
        error.value = response.error
        sevaBookings.value = []
        return []
      }
    } catch (err) {
      console.error('Error fetching seva bookings:', err)
      error.value = err.response?.data?.error || 'Failed to fetch bookings'
      sevaBookings.value = []
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch single booking by ID - uses /bookings/:id endpoint
   * @param {string} bookingId - Booking ID
   * @returns {Object|null} Booking details
   */
  const fetchBookingById = async (bookingId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getBookingById(bookingId)
      
      if (response.success) {
        return response.data
      } else {
        error.value = response.error
        return null
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      error.value = err.response?.data?.error || 'Failed to fetch booking'
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch recent sevas for devotee dashboard - uses /my-bookings endpoint
   * @returns {Array} Recent bookings with seva details
   */
  const fetchRecentSevas = async () => {
    loadingRecentSevas.value = true;
    try {
      // Always fetch the catalog first, regardless of whether we have bookings
      await fetchSevaCatalog();
      
      // Then get the bookings
      const response = await sevaService.getMyBookings();
      
      if (response.success) {
        let bookings = response.data || [];
        
        // Map seva names to bookings using the catalog
        bookings = bookings.map(booking => {
          const sevaId = booking.seva_id || booking.SevaID;
          const seva = sevaCatalog.value.find(s => s.id === sevaId || s.ID === sevaId);
          
          return {
            ...booking,
            seva_name: seva?.name || seva?.Name || `Seva ${sevaId}`,
            seva_type: seva?.type || seva?.Type || seva?.seva_type || '',
            seva_description: seva?.description || seva?.Description || '',
            seva: seva ? {
              id: seva.id || seva.ID,
              name: seva.name || seva.Name,
              type: seva.type || seva.Type || seva.seva_type,
              description: seva.description || seva.Description
            } : null
          };
        });
        
        console.log('Bookings with seva names:', bookings);
        
        // Sort by booking time, newest first
        const sorted = [...bookings].sort((a, b) => {
          const dateA = new Date(a.booking_time || a.BookingTime || a.created_at || Date.now());
          const dateB = new Date(b.booking_time || b.BookingTime || b.created_at || Date.now());
          return dateB - dateA;
        });
        
        recentSevas.value = sorted;
        return recentSevas.value;
      } else {
        recentSevas.value = [];
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch recent sevas:', error);
      recentSevas.value = [];
      return [];
    } finally {
      loadingRecentSevas.value = false;
    }
  }
  
  /**
   * Create new seva - uses POST / endpoint
   * @param {Object} sevaData - Seva creation data
   * @returns {Object} Operation result
   */
  const createSeva = async (sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Creating seva with data:', sevaData)
      
      const response = await sevaService.createSeva(sevaData)
      
      // Add the new seva to the list if successful
      if (response.success && response.data) {
        sevas.value.push(response.data)
        // Also add to catalog
        sevaCatalog.value.push(response.data)
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva created successfully',
        data: response.data
      }
    } catch (err) {
      console.error('Error creating seva:', err)
      error.value = err.response?.data?.error || 'Failed to create seva'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update existing seva - uses PUT /:id endpoint
   * @param {string} sevaId - Seva ID to update
   * @param {Object} sevaData - Updated seva data
   * @returns {Object} Operation result
   */
  const updateSeva = async (sevaId, sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.updateSeva(sevaId, sevaData)
      
      // Update the seva in the list
      if (response.success && response.data) {
        const index = sevas.value.findIndex(s => s.id === sevaId)
        if (index !== -1) {
          sevas.value[index] = response.data
        }
        
        // Also update in catalog
        const catalogIndex = sevaCatalog.value.findIndex(s => s.id === sevaId)
        if (catalogIndex !== -1) {
          sevaCatalog.value[catalogIndex] = response.data
        }
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva updated successfully',
        data: response.data
      }
    } catch (err) {
      console.error('Error updating seva:', err)
      error.value = err.response?.data?.error || 'Failed to update seva'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Delete seva - uses DELETE /:id endpoint
   * @param {string} sevaId - Seva ID to delete
   * @returns {Object} Operation result
   */
  const deleteSeva = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.deleteSeva(sevaId)
      
      if (response.success) {
        // Remove the seva from the list
        sevas.value = sevas.value.filter(s => s.id !== sevaId)
        // Also remove from catalog
        sevaCatalog.value = sevaCatalog.value.filter(s => s.id !== sevaId)
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva deleted successfully' 
      }
    } catch (err) {
      console.error('Error deleting seva:', err)
      error.value = err.response?.data?.error || 'Failed to delete seva'
      return { 
        success: false, 
        message: error.value 
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Book a seva for devotees - uses POST /bookings endpoint
   * @param {number} sevaId - Seva ID to book
   * @returns {Object} Operation result
   */
  const bookSeva = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.bookSeva(sevaId)
      
      return {
        success: response.success,
        message: response.message || 'Seva booked successfully',
        data: response.data
      }
    } catch (err) {
      console.error('Error booking seva:', err)
      error.value = err.response?.data?.error || 'Failed to book seva'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update booking status - uses PATCH /bookings/:id/status endpoint
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Object} Operation result
   */
  const updateBookingStatus = async (bookingId, status) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.updateBookingStatus(bookingId, status)
      
      if (response.success) {
        // Update the booking status in the list if we have it
        const bookingIndex = sevaBookings.value.findIndex(b => b.id === bookingId || b.ID === bookingId)
        if (bookingIndex !== -1) {
          sevaBookings.value[bookingIndex].status = status
          sevaBookings.value[bookingIndex].Status = status // Handle both cases
        }
      }
      
      return { 
        success: response.success, 
        message: response.message || `Booking ${status} successfully` 
      }
    } catch (err) {
      console.error('Error updating booking status:', err)
      error.value = err.response?.data?.error || 'Failed to update booking status'
      return { 
        success: false, 
        message: error.value 
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get seva by ID - uses /:id endpoint
   * @param {string} sevaId - Seva ID
   * @returns {Object|null} Seva details
   */
  const getSevaById = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getSevaById(sevaId)
      
      if (response.success) {
        return response.data
      } else {
        error.value = response.error
        return null
      }
    } catch (err) {
      console.error('Error fetching seva:', err)
      error.value = err.response?.data?.error || 'Failed to fetch seva'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Utility functions
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }
  
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    filters.value = {
      status: 'all',
      type: 'all',
      dateRange: 'all'
    }
  }
  
  const setSelectedSeva = (seva) => {
    selectedSeva.value = seva
  }
  
  return {
    // State
    sevas,
    sevaBookings,
    loading,
    error,
    searchQuery,
    filters,
    selectedSeva,
    recentSevas,
    loadingRecentSevas,
    sevaCatalog,
    loadingCatalog,
    bookingCounts,
    loadingBookingCounts,
    
    // Getters
    filteredSevas,
    sevaStats,
    
    // Actions
    fetchSevas,
    fetchDevoteeSevas,
    fetchBookingCounts,
    fetchSevaCatalog,
    fetchEntityBookings,
    fetchBookingById,
    fetchRecentSevas,
    createSeva,
    updateSeva,
    deleteSeva,
    bookSeva,
    updateBookingStatus,
    getSevaById,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSelectedSeva
  }
})