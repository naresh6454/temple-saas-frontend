import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { apiClient } from '@/plugins/axios'

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
    pending: sevas.value.filter(s => !s.is_active).length,
  }))
  
  // Actions - Connect to backend API
  const fetchSevas = async (entityId) => {
    loading.value = true
    error.value = null
    
    try {
      // Call API using the updated apiClient
      const response = await apiClient.seva.getSevas(entityId)
      sevas.value = response.data || []
      return sevas.value
    } catch (err) {
      console.error('Error fetching sevas:', err)
      error.value = err.response?.data?.error || 'Failed to fetch sevas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  const fetchEntityBookings = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.seva.getEntityBookings()
      sevaBookings.value = response.data || []
      return sevaBookings.value
    } catch (err) {
      console.error('Error fetching seva bookings:', err)
      error.value = err.response?.data?.error || 'Failed to fetch bookings'
      return []
    } finally {
      loading.value = false
    }
  }
  
  const createSeva = async (sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      // Map the form data to match the Go backend model
      const payload = {
        name: sevaData.name,
        description: sevaData.description,
        price: parseFloat(sevaData.price),
        duration: parseInt(sevaData.duration),
        max_bookings_per_day: parseInt(sevaData.max_bookings_per_day || 10),
        availability_schedule: sevaData.availability_schedule || '{}',
        is_active: sevaData.is_active !== undefined ? sevaData.is_active : true
      }
      
      const response = await apiClient.seva.createSeva(payload)
      
      // Add the new seva to the list
      if (response.data) {
        sevas.value.push(response.data)
      }
      
      return { 
        success: true, 
        message: 'Seva created successfully',
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
  
  const updateSeva = async (sevaId, sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.seva.updateSeva(sevaId, sevaData)
      
      // Update the seva in the list
      const index = sevas.value.findIndex(s => s.id === sevaId)
      if (index !== -1 && response.data) {
        sevas.value[index] = response.data
      }
      
      return { 
        success: true, 
        message: 'Seva updated successfully',
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
  
  const deleteSeva = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.seva.deleteSeva(sevaId)
      
      // Remove the seva from the list
      sevas.value = sevas.value.filter(s => s.id !== sevaId)
      
      return { success: true, message: 'Seva deleted successfully' }
    } catch (err) {
      console.error('Error deleting seva:', err)
      error.value = err.response?.data?.error || 'Failed to delete seva'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  const updateBookingStatus = async (bookingId, status) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.seva.updateBookingStatus(bookingId, status)
      
      // Update the booking status in the list
      const index = sevaBookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        sevaBookings.value[index].status = status
      }
      
      return { success: true, message: `Booking ${status} successfully` }
    } catch (err) {
      console.error('Error updating booking status:', err)
      error.value = err.response?.data?.error || 'Failed to update booking status'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // Enhanced method to add a seva to the store with proper formatting
  const addSevaToStore = (seva) => {
    // Ensure sevas is initialized
    if (!sevas.value) {
      sevas.value = []
    }
    
    // Make sure the seva object has all required fields for the SevaList component
    const enhancedSeva = {
      ...seva,
      // Add default values for fields that might be missing
      devotee: seva.devotee || {
        name: 'Dev User',
        phone: '+91 98765 43210'
      },
      date: seva.date || new Date().toISOString().split('T')[0],
      time: seva.time || '09:00 AM',
      amount: seva.amount || seva.price || 0,
      status: seva.status || 'pending',
      notes: seva.notes || seva.description || '',
      type: seva.type || 'special'
    }
    
    // Add the enhanced seva to the store
    sevas.value.push(enhancedSeva)
    
    return { 
      success: true, 
      message: 'Seva added to store successfully',
      data: enhancedSeva
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
    
    // Getters
    filteredSevas,
    sevaStats,
    
    // Actions
    fetchSevas,
    fetchEntityBookings,
    createSeva,
    updateSeva,
    deleteSeva,
    updateBookingStatus,
    addSevaToStore,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSelectedSeva
  }
})