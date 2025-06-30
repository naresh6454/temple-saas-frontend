// src/stores/seva.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSevaStore = defineStore('seva', () => {
  // State
  const sevas = ref([])
  const sevaBookings = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filters = ref({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  })
  const selectedSeva = ref(null)
  const selectedBooking = ref(null)

  // Mock seva types and data
  const sevaTypes = ref([
    'Abhishekam',
    'Archana',
    'Aarti',
    'Sahasranama',
    'Rudra Homam',
    'Ganapati Homam',
    'Satyanarayana Pooja',
    'Varalakshmi Vratam',
    'Navagraha Pooja',
    'Kalyanam'
  ])

  const mockSevas = ref([
    {
      id: 1,
      name: 'Ganesha Abhishekam',
      type: 'Abhishekam',
      description: 'Sacred abhishekam ritual for Lord Ganesha',
      duration: '1 hour',
      price: 500,
      status: 'active',
      availability: 'daily',
      timeSlots: ['6:00 AM', '10:00 AM', '4:00 PM', '7:00 PM'],
      maxBookingsPerSlot: 5,
      requirements: ['Flowers', 'Fruits', 'Milk', 'Honey'],
      createdDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400&h=300&fit=crop',
      isVisible: true
    },
    {
      id: 2,
      name: 'Satyanarayana Pooja',
      type: 'Satyanarayana Pooja',
      description: 'Complete Satyanarayana Pooja with prasadam',
      duration: '2 hours',
      price: 1500,
      status: 'active',
      availability: 'weekends',
      timeSlots: ['9:00 AM', '2:00 PM'],
      maxBookingsPerSlot: 3,
      requirements: ['Coconut', 'Banana', 'Jaggery', 'Wheat flour'],
      createdDate: '2024-02-01',
      image: 'https://images.unsplash.com/photo-1574414920179-9d4b3f4c9e4f?w=400&h=300&fit=crop',
      isVisible: true
    },
    {
      id: 3,
      name: 'Rudra Homam',
      type: 'Rudra Homam',
      description: 'Powerful homam for Lord Shiva',
      duration: '3 hours',
      price: 2500,
      status: 'pending',
      availability: 'special',
      timeSlots: ['8:00 AM'],
      maxBookingsPerSlot: 1,
      requirements: ['Ghee', 'Samidha', 'Rice', 'Sesame seeds'],
      createdDate: '2024-06-01',
      image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=300&fit=crop',
      isVisible: false
    }
  ])

  const mockBookings = ref([
    {
      id: 1,
      sevaId: 1,
      sevaName: 'Ganesha Abhishekam',
      devoteeId: 1,
      devoteeName: 'Rajesh Kumar',
      devoteePhone: '+91 9876543210',
      bookingDate: '2024-06-15',
      timeSlot: '6:00 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 500,
      createdAt: '2024-06-10',
      specialRequests: 'Please arrange flowers',
      familyMembers: 4
    },
    {
      id: 2,
      sevaId: 2,
      sevaName: 'Satyanarayana Pooja',
      devoteeId: 2,
      devoteeName: 'Priya Sharma',
      devoteePhone: '+91 9876543211',
      bookingDate: '2024-06-16',
      timeSlot: '9:00 AM',
      status: 'pending',
      paymentStatus: 'pending',
      amount: 1500,
      createdAt: '2024-06-12',
      specialRequests: 'Family function',
      familyMembers: 6
    },
    {
      id: 3,
      sevaId: 1,
      sevaName: 'Ganesha Abhishekam',
      devoteeId: 3,
      devoteeName: 'Suresh Reddy',
      devoteePhone: '+91 9876543212',
      bookingDate: '2024-06-17',
      timeSlot: '10:00 AM',
      status: 'rejected',
      paymentStatus: 'refunded',
      amount: 500,
      createdAt: '2024-06-11',
      specialRequests: '',
      familyMembers: 2,
      rejectionReason: 'Slot not available'
    }
  ])

  // Getters
  const filteredSevas = computed(() => {
    let filtered = mockSevas.value

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(seva =>
        seva.name.toLowerCase().includes(query) ||
        seva.type.toLowerCase().includes(query) ||
        seva.description.toLowerCase().includes(query)
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

  const filteredBookings = computed(() => {
    let filtered = mockBookings.value

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.value.status)
    }

    // Date range filter
    if (filters.value.dateRange !== 'all') {
      const now = new Date()
      const startDate = new Date()
      
      switch (filters.value.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.bookingDate)
            return bookingDate >= startDate && bookingDate < new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
          })
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(booking => new Date(booking.bookingDate) >= startDate)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(booking => new Date(booking.bookingDate) >= startDate)
          break
      }
    }

    return filtered
  })

  const sevaStats = computed(() => ({
    total: mockSevas.value.length,
    active: mockSevas.value.filter(s => s.status === 'active').length,
    pending: mockSevas.value.filter(s => s.status === 'pending').length,
    visible: mockSevas.value.filter(s => s.isVisible).length
  }))

  const bookingStats = computed(() => ({
    total: mockBookings.value.length,
    confirmed: mockBookings.value.filter(b => b.status === 'confirmed').length,
    pending: mockBookings.value.filter(b => b.status === 'pending').length,
    rejected: mockBookings.value.filter(b => b.status === 'rejected').length,
    todayBookings: mockBookings.value.filter(b => {
      const today = new Date().toISOString().split('T')[0]
      return b.bookingDate === today
    }).length
  }))

  const monthlyRevenue = computed(() => {
    const now = new Date()
    const thisMonth = mockBookings.value.filter(booking => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             booking.paymentStatus === 'paid'
    })
    return thisMonth.reduce((total, booking) => total + booking.amount, 0)
  })

  // Actions
  const fetchSevas = async (entityId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      sevas.value = mockSevas.value
    } catch (error) {
      console.error('Error fetching sevas:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchSevaBookings = async (entityId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      sevaBookings.value = mockBookings.value
    } catch (error) {
      console.error('Error fetching seva bookings:', error)
    } finally {
      loading.value = false
    }
  }

  const createSeva = async (sevaData) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newSeva = {
        id: Date.now(),
        ...sevaData,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        isVisible: false
      }
      
      mockSevas.value.push(newSeva)
      
      return { success: true, message: 'Seva created successfully', data: newSeva }
    } catch (error) {
      console.error('Error creating seva:', error)
      return { success: false, message: 'Failed to create seva' }
    } finally {
      loading.value = false
    }
  }

  const updateSeva = async (sevaId, updates) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const seva = mockSevas.value.find(s => s.id === sevaId)
      if (seva) {
        Object.assign(seva, updates)
      }
      
      return { success: true, message: 'Seva updated successfully' }
    } catch (error) {
      console.error('Error updating seva:', error)
      return { success: false, message: 'Failed to update seva' }
    } finally {
      loading.value = false
    }
  }

  const updateSevaStatus = async (sevaId, status) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const seva = mockSevas.value.find(s => s.id === sevaId)
      if (seva) {
        seva.status = status
        if (status === 'active') {
          seva.isVisible = true
        }
      }
      
      return { success: true, message: `Seva ${status} successfully` }
    } catch (error) {
      console.error('Error updating seva status:', error)
      return { success: false, message: 'Failed to update seva status' }
    } finally {
      loading.value = false
    }
  }

  const updateBookingStatus = async (bookingId, status, rejectionReason = '') => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const booking = mockBookings.value.find(b => b.id === bookingId)
      if (booking) {
        booking.status = status
        if (status === 'rejected') {
          booking.rejectionReason = rejectionReason
          booking.paymentStatus = 'refunded'
        } else if (status === 'confirmed') {
          booking.paymentStatus = 'paid'
        }
      }
      
      return { success: true, message: `Booking ${status} successfully` }
    } catch (error) {
      console.error('Error updating booking status:', error)
      return { success: false, message: 'Failed to update booking status' }
    } finally {
      loading.value = false
    }
  }

  const deleteSeva = async (sevaId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = mockSevas.value.findIndex(s => s.id === sevaId)
      if (index > -1) {
        mockSevas.value.splice(index, 1)
      }
      
      return { success: true, message: 'Seva deleted successfully' }
    } catch (error) {
      console.error('Error deleting seva:', error)
      return { success: false, message: 'Failed to delete seva' }
    } finally {
      loading.value = false
    }
  }

  const toggleSevaVisibility = async (sevaId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const seva = mockSevas.value.find(s => s.id === sevaId)
      if (seva) {
        seva.isVisible = !seva.isVisible
      }
      
      return { success: true, message: `Seva ${seva.isVisible ? 'made visible' : 'hidden'} successfully` }
    } catch (error) {
      console.error('Error toggling seva visibility:', error)
      return { success: false, message: 'Failed to update seva visibility' }
    } finally {
      loading.value = false
    }
  }

  const getSevaById = (id) => {
    return mockSevas.value.find(seva => seva.id === id)
  }

  const getBookingById = (id) => {
    return mockBookings.value.find(booking => booking.id === id)
  }

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

  const setSelectedBooking = (booking) => {
    selectedBooking.value = booking
  }

  return {
    // State
    sevas,
    sevaBookings,
    loading,
    searchQuery,
    filters,
    selectedSeva,
    selectedBooking,
    sevaTypes,
    
    // Getters
    filteredSevas,
    filteredBookings,
    sevaStats,
    bookingStats,
    monthlyRevenue,
    
    // Actions
    fetchSevas,
    fetchSevaBookings,
    createSeva,
    updateSeva,
    updateSevaStatus,
    updateBookingStatus,
    deleteSeva,
    toggleSevaVisibility,
    getSevaById,
    getBookingById,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSelectedSeva,
    setSelectedBooking
  }
})