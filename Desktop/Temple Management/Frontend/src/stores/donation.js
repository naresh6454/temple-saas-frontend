import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDonationStore = defineStore('donation', () => {
  // State
  const donations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedDonation = ref(null)
  const filters = ref({
    dateRange: 'all',
    minAmount: null,
    maxAmount: null,
    donationType: 'all',
    devoteeId: null,
    status: 'all'
  })

  // Mock data
  const mockDonations = [
    {
      id: 1,
      devoteeId: 1,
      devoteeName: 'Rajesh Kumar',
      devoteeEmail: 'rajesh.kumar@email.com',
      amount: 5000,
      donationType: 'general',
      paymentMethod: 'online',
      transactionId: 'TXN123456789',
      status: 'completed',
      receiptGenerated: true,
      receiptNumber: 'RCP-2024-001',
      date: '2024-01-15',
      purpose: 'Temple Renovation',
      notes: 'For new sanctum construction'
    },
    {
      id: 2,
      devoteeId: 2,
      devoteeName: 'Priya Sharma',
      devoteeEmail: 'priya.sharma@email.com',
      amount: 2500,
      donationType: 'seva',
      paymentMethod: 'cash',
      transactionId: null,
      status: 'completed',
      receiptGenerated: true,
      receiptNumber: 'RCP-2024-002',
      date: '2024-01-20',
      purpose: 'Abhisheka Seva',
      notes: 'Monthly seva donation'
    },
    {
      id: 3,
      devoteeId: 3,
      devoteeName: 'Amit Patel',
      devoteeEmail: 'amit.patel@email.com',
      amount: 10000,
      donationType: 'festival',
      paymentMethod: 'online',
      transactionId: 'TXN987654321',
      status: 'pending',
      receiptGenerated: false,
      receiptNumber: null,
      date: '2024-01-25',
      purpose: 'Diwali Celebration',
      notes: 'For festival arrangements'
    }
  ]

  // Getters
  const totalDonations = computed(() => {
    return filteredDonations.value.reduce((sum, donation) => sum + donation.amount, 0)
  })

  const recentDonations = computed(() => {
    return donations.value
      .filter(d => d.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  })

  const filteredDonations = computed(() => {
    let filtered = donations.value

    // Date range filter
    if (filters.value.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.value.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(d => new Date(d.date) >= filterDate)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(d => new Date(d.date) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(d => new Date(d.date) >= filterDate)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          filtered = filtered.filter(d => new Date(d.date) >= filterDate)
          break
      }
    }

    // Amount range filter
    if (filters.value.minAmount) {
      filtered = filtered.filter(d => d.amount >= filters.value.minAmount)
    }
    if (filters.value.maxAmount) {
      filtered = filtered.filter(d => d.amount <= filters.value.maxAmount)
    }

    // Donation type filter
    if (filters.value.donationType !== 'all') {
      filtered = filtered.filter(d => d.donationType === filters.value.donationType)
    }

    // Devotee filter
    if (filters.value.devoteeId) {
      filtered = filtered.filter(d => d.devoteeId === filters.value.devoteeId)
    }

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(d => d.status === filters.value.status)
    }

    return filtered
  })

  const donationStats = computed(() => {
    const completed = donations.value.filter(d => d.status === 'completed')
    const pending = donations.value.filter(d => d.status === 'pending')
    
    return {
      total: donations.value.length,
      completed: completed.length,
      pending: pending.length,
      totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
      averageAmount: completed.length > 0 ? Math.round(completed.reduce((sum, d) => sum + d.amount, 0) / completed.length) : 0
    }
  })

  // Actions
  const fetchDonations = async (templeId) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      donations.value = mockDonations
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createDonation = async (donationData) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newDonation = {
        ...donationData,
        id: Date.now(),
        status: 'completed',
        receiptGenerated: true,
        receiptNumber: `RCP-2024-${String(donations.value.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0]
      }
      
      donations.value.unshift(newDonation)
      return newDonation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDonation = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const index = donations.value.findIndex(d => d.id === id)
      if (index !== -1) {
        donations.value[index] = { ...donations.value[index], ...updates }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateReceipt = async (donationId) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const donation = donations.value.find(d => d.id === donationId)
      if (donation) {
        donation.receiptGenerated = true
        donation.receiptNumber = `RCP-2024-${String(donationId).padStart(3, '0')}`
      }
      
      return donation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      dateRange: 'all',
      minAmount: null,
      maxAmount: null,
      donationType: 'all',
      devoteeId: null,
      status: 'all'
    }
  }

  const setSelectedDonation = (donation) => {
    selectedDonation.value = donation
  }

  return {
    // State
    donations,
    loading,
    error,
    selectedDonation,
    filters,
    
    // Getters
    totalDonations,
    recentDonations,
    filteredDonations,
    donationStats,
    
    // Actions
    fetchDonations,
    createDonation,
    updateDonation,
    generateReceipt,
    setFilters,
    clearFilters,
    setSelectedDonation
  }
})