// src/stores/devotee.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDevoteeStore = defineStore('devotee', () => {

  const profile = ref({
    personalDetails: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    // Add more step-wise objects if needed (e.g., familyDetails, sevaPreferences)
  })

  // ✅ ADD DASHBOARD DATA STATE
  const dashboardData = ref({
    summary: {
      totalDonations: 0,
      totalSevaBookings: 0,
      upcomingEvents: 0,
      profileCompletion: 0
    },
    recentDonations: [],
    upcomingSevas: [],
    announcements: [],
    quickStats: {
      thisMonthDonations: 0,
      thisMonthSevas: 0,
      favoriteDeity: '',
      memberSince: ''
    }
  })

  // State
  const completedSteps = ref([])
  const incompleteSteps = ref([])
  const totalSteps = ref(6)
  const completionPercentage = computed(() =>
    totalSteps.value === 0
      ? 0
      : Math.round((completedSteps.value.length / totalSteps.value) * 100)
  )
  const isProfileComplete = computed(() => completionPercentage.value === 100)
  const selectedTempleId = ref(null) // Added for temple selection

  const devotees = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filters = ref({
    status: 'all',
    gotra: 'all',
    nativePlace: 'all'
  })
  const selectedDevotee = ref(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
  })

  // Mock data
  const mockDevotees = ref([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 9876543210',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      gotra: 'Bharadwaj',
      nakshatra: 'Rohini',
      rashi: 'Vrishabha',
      nativePlace: 'Chennai, Tamil Nadu',
      status: 'active',
      joinedDate: '2024-01-15',
      profileCompletion: 85,
      totalDonations: 15000,
      sevaBookings: 12,
      familyMembers: 4,
      lastActivity: '2024-06-10',
      address: {
        street: '123 Temple Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 9876543211',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b9dc1dd0?w=150&h=150&fit=crop&crop=face',
      gotra: 'Kashyap',
      nakshatra: 'Ashwini',
      rashi: 'Mesha',
      nativePlace: 'Mumbai, Maharashtra',
      status: 'active',
      joinedDate: '2024-02-20',
      profileCompletion: 92,
      totalDonations: 25000,
      sevaBookings: 18,
      familyMembers: 3,
      lastActivity: '2024-06-12',
      address: {
        street: '456 Divine Avenue',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560002'
      }
    },
    {
      id: 3,
      name: 'Suresh Reddy',
      email: 'suresh@example.com',
      phone: '+91 9876543212',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      gotra: 'Vashishta',
      nakshatra: 'Bharani',
      rashi: 'Vrishabha',
      nativePlace: 'Hyderabad, Telangana',
      status: 'inactive',
      joinedDate: '2024-03-10',
      profileCompletion: 65,
      totalDonations: 8000,
      sevaBookings: 5,
      familyMembers: 2,
      lastActivity: '2024-05-20',
      address: {
        street: '789 Sacred Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560003'
      }
    }
  ])

  // Getters
  const filteredDevotees = computed(() => {
    let filtered = mockDevotees.value

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(devotee =>
        devotee.name.toLowerCase().includes(query) ||
        devotee.email.toLowerCase().includes(query) ||
        devotee.gotra.toLowerCase().includes(query) ||
        devotee.nativePlace.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(devotee => devotee.status === filters.value.status)
    }

    // Gotra filter
    if (filters.value.gotra !== 'all') {
      filtered = filtered.filter(devotee => devotee.gotra === filters.value.gotra)
    }

    // Native place filter
    if (filters.value.nativePlace !== 'all') {
      filtered = filtered.filter(devotee => 
        devotee.nativePlace.toLowerCase().includes(filters.value.nativePlace.toLowerCase())
      )
    }

    return filtered
  })

  const totalDevotees = computed(() => mockDevotees.value.length)
  const activeDevotees = computed(() => mockDevotees.value.filter(d => d.status === 'active').length)
  const inactiveDevotees = computed(() => mockDevotees.value.filter(d => d.status === 'inactive').length)
  
  const devoteeStats = computed(() => ({
    total: totalDevotees.value,
    active: activeDevotees.value,
    inactive: inactiveDevotees.value,
    newThisMonth: mockDevotees.value.filter(d => {
      const joinDate = new Date(d.joinedDate)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length
  }))

  const availableGotras = computed(() => {
    const gotras = [...new Set(mockDevotees.value.map(d => d.gotra))]
    return gotras.sort()
  })

  const availableNativePlaces = computed(() => {
    const places = [...new Set(mockDevotees.value.map(d => d.nativePlace))]
    return places.sort()
  })

  // ✅ ADD MISSING METHOD: loadProfileData
  const loadProfileData = async () => {
    try {
      loading.value = true
      
      // Mock API call - replace with actual API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              personal: {
                fullName: 'Rajesh Kumar',
                dateOfBirth: '1985-06-15',
                gender: 'male',
                phone: '+91 9876543210',
                email: 'rajesh@example.com',
                address: {
                  street: '123 Temple Street',
                  city: 'Bengaluru',
                  state: 'Karnataka',
                  pincode: '560001',
                  country: 'India'
                }
              },
              spiritual: {
                gotra: 'Bharadwaj',
                nakshatra: 'Rohini',
                rashi: 'Vrishabha',
                favoriteDeity: 'Lord Venkateswara',
                spiritualGuru: 'Sri Ramana Maharshi',
                preferredLanguage: 'Sanskrit'
              },
              // Other steps might have partial or no data
            }
          })
        }, 1000)
      })

      // Update profile with fetched data
      const profileData = response.data
      
      // Return the step data for the profile creation form
      return profileData

    } catch (error) {
      console.error('Error loading profile data:', error)
      return {}
    } finally {
      loading.value = false
    }
  }

  // ✅ ADD MISSING METHOD: updateProfileStep
  const updateProfileStep = async (stepId, data) => {
    try {
      loading.value = true
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local profile data
      // This would actually send the data to the backend in a real implementation
      console.log(`Updating profile step ${stepId} with data:`, data)
      
      return { success: true }
    } catch (error) {
      console.error(`Error updating profile step ${stepId}:`, error)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // ✅ ADD MISSING METHOD: completeProfile
  const completeProfile = async () => {
    try {
      loading.value = true
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Profile completed')
      
      return { success: true, message: 'Profile completed successfully' }
    } catch (error) {
      console.error('Error completing profile:', error)
      return { success: false, message: 'Failed to complete profile' }
    } finally {
      loading.value = false
    }
  }

  // ✅ ADD MISSING METHOD: fetchDashboardData
  const fetchDashboardData = async (templeId) => {
    try {
      loading.value = true
      
      // Mock API call - replace with actual API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              summary: {
                totalDonations: 45000,
                totalSevaBookings: 15,
                upcomingEvents: 3,
                profileCompletion: 85
              },
              recentDonations: [
                {
                  id: 1,
                  amount: 2500,
                  purpose: 'Abhishekam Seva',
                  date: '2024-06-20',
                  status: 'completed'
                },
                {
                  id: 2,
                  amount: 1000,
                  purpose: 'Annadanam',
                  date: '2024-06-18',
                  status: 'completed'
                },
                {
                  id: 3,
                  amount: 5000,
                  purpose: 'Temple Maintenance',
                  date: '2024-06-15',
                  status: 'completed'
                }
              ],
              upcomingSevas: [
                {
                  id: 1,
                  name: 'Satyanarayana Vratam',
                  date: '2024-06-28',
                  time: '10:00 AM',
                  status: 'confirmed'
                },
                {
                  id: 2,
                  name: 'Lakshmi Pooja',
                  date: '2024-07-02',
                  time: '6:00 PM',
                  status: 'pending'
                }
              ],
              announcements: [
                {
                  id: 1,
                  title: 'Brahmotsavam Festival',
                  message: 'Annual Brahmotsavam festival starts from July 10th. All devotees are welcome to participate.',
                  date: '2024-06-25',
                  priority: 'high'
                },
                {
                  id: 2,
                  title: 'New Seva Timings',
                  message: 'Morning seva timings have been updated. Please check the schedule.',
                  date: '2024-06-23',
                  priority: 'medium'
                }
              ],
              quickStats: {
                thisMonthDonations: 8500,
                thisMonthSevas: 4,
                favoriteDeity: 'Lord Venkateswara',
                memberSince: '2024-01-15'
              }
            }
          })
        }, 1000)
      })

      dashboardData.value = response.data
      return response.data

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ✅ ADD METHOD: Get dashboard summary
  const getDashboardSummary = () => {
    return dashboardData.value.summary
  }

  // ✅ ADD METHOD: Get recent activities
  const getRecentActivities = () => {
    return {
      donations: dashboardData.value.recentDonations,
      sevas: dashboardData.value.upcomingSevas
    }
  }

  // ✅ ADD METHOD: setSelectedTempleId
  const setSelectedTempleId = (templeId) => {
    selectedTempleId.value = templeId
  }

  // Actions
  const fetchDevotees = async (entityId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      devotees.value = mockDevotees.value
      pagination.value.total = mockDevotees.value.length
    } catch (error) {
      console.error('Error fetching devotees:', error)
    } finally {
      loading.value = false
    }
  }

  const getDevoteeById = (id) => {
    return mockDevotees.value.find(devotee => devotee.id === id)
  }

  const updateDevoteeStatus = async (devoteeId, status) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const devotee = mockDevotees.value.find(d => d.id === devoteeId)
      if (devotee) {
        devotee.status = status
      }
      
      return { success: true, message: `Devotee ${status === 'active' ? 'activated' : 'deactivated'} successfully` }
    } catch (error) {
      console.error('Error updating devotee status:', error)
      return { success: false, message: 'Failed to update devotee status' }
    } finally {
      loading.value = false
    }
  }

  const deleteDevotee = async (devoteeId) => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = mockDevotees.value.findIndex(d => d.id === devoteeId)
      if (index > -1) {
        mockDevotees.value.splice(index, 1)
      }
      
      return { success: true, message: 'Devotee removed successfully' }
    } catch (error) {
      console.error('Error deleting devotee:', error)
      return { success: false, message: 'Failed to remove devotee' }
    } finally {
      loading.value = false
    }
  }

  const exportDevotees = async (format = 'excel') => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, this would generate and download the file
      const data = filteredDevotees.value.map(devotee => ({
        Name: devotee.name,
        Email: devotee.email,
        Phone: devotee.phone,
        Gotra: devotee.gotra,
        'Native Place': devotee.nativePlace,
        Status: devotee.status,
        'Joined Date': devotee.joinedDate,
        'Profile Completion': `${devotee.profileCompletion}%`,
        'Total Donations': `₹${devotee.totalDonations.toLocaleString()}`,
        'Seva Bookings': devotee.sevaBookings
      }))
      
      console.log(`Exporting ${data.length} devotees as ${format}:`, data)
      
      return { success: true, message: `Devotees exported as ${format.toUpperCase()} successfully` }
    } catch (error) {
      console.error('Error exporting devotees:', error)
      return { success: false, message: 'Failed to export devotees' }
    } finally {
      loading.value = false
    }
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
      gotra: 'all',
      nativePlace: 'all'
    }
  }

  const setSelectedDevotee = (devotee) => {
    selectedDevotee.value = devotee
  }

  const setPagination = (page, limit) => {
    pagination.value.page = page
    pagination.value.limit = limit
  }

  return {
    // State
    profile,
    dashboardData, 
    devotees,
    loading,
    searchQuery,
    filters,
    selectedDevotee,
    pagination,
    selectedTempleId, // Added
    
    // Getters
    filteredDevotees,
    totalDevotees,
    activeDevotees,
    inactiveDevotees,
    devoteeStats,
    availableGotras,
    availableNativePlaces,
    
    // Actions
    loadProfileData, // ✅ ADDED MISSING METHOD
    updateProfileStep, // ✅ ADDED MISSING METHOD
    completeProfile, // ✅ ADDED MISSING METHOD
    fetchDashboardData,
    getDashboardSummary,
    getRecentActivities,
    fetchDevotees,
    getDevoteeById,
    updateDevoteeStatus,
    deleteDevotee,
    exportDevotees,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSelectedDevotee,
    setPagination,
    setSelectedTempleId, // Added

    completedSteps,
    incompleteSteps,
    totalSteps,
    completionPercentage,
    isProfileComplete
  }
})