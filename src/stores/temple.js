// src/stores/temple.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTempleStore = defineStore('temple', () => {
  // State
  const temples = ref([])
  const currentTemple = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Temple creation/edit form state
  const templeForm = ref({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    category: '',
    establishedYear: '',
    presiding_deity: '',
    timings: {
      morning_open: '',
      morning_close: '',
      evening_open: '',
      evening_close: ''
    },
    facilities: [],
    documents: [],
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    rejection_reason: '',
    admin_notes: ''
  })

  // Computed
  const approvedTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'APPROVED')
  )

  const pendingTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'PENDING')
  )

  const rejectedTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'REJECTED')
  )

  const templeCounts = computed(() => ({
    total: temples.value.length,
    approved: approvedTemples.value.length,
    pending: pendingTemples.value.length,
    rejected: rejectedTemples.value.length
  }))

  // Actions
  const fetchTemples = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Mock API call - replace with actual API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                slug: 'temple1',
                name: 'Sri Venkateswara Temple',
                description: 'Famous Tirupati temple known for Lord Venkateswara',
                status: 'APPROVED',
                address: {
                  street: 'Tirumala Hills',
                  city: 'Tirupati',
                  state: 'Andhra Pradesh',
                  pincode: '517504',
                  country: 'India'
                },
                contact: {
                  phone: '+91-8772-277777',
                  email: 'info@tirumala.org',
                  website: 'https://tirumala.org'
                },
                category: 'Vishnu Temple',
                establishedYear: '300 AD',
                presiding_deity: 'Lord Venkateswara',
                created_at: '2024-01-15T10:30:00Z',
                approved_at: '2024-01-20T14:15:00Z'
              },
              {
                id: 2,
                slug: 'temple2',
                name: 'Sri Raghavendra Swamy Temple',
                description: 'Dedicated to Sri Raghavendra Swamy',
                status: 'PENDING',
                address: {
                  street: 'Temple Street',
                  city: 'Mantralayam',
                  state: 'Andhra Pradesh',
                  pincode: '518345',
                  country: 'India'
                },
                contact: {
                  phone: '+91-8512-279999',
                  email: 'info@mantralayam.org',
                  website: ''
                },
                category: 'Spiritual Center',
                establishedYear: '1671',
                presiding_deity: 'Sri Raghavendra Swamy',
                created_at: '2024-02-01T09:15:00Z'
              }
            ]
          })
        }, 1000)
      })
      
      temples.value = response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch temples'
    } finally {
      loading.value = false
    }
  }

  const createTemple = async (templeData) => {
    try {
      loading.value = true
      error.value = null

      // ✅ Trim and validate temple name
      const trimmedName = templeData.name?.trim()
      if (!trimmedName || trimmedName.length < 3) {
        throw new Error('Temple name must be at least 3 characters')
      }

      // ✅ Mock API call
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!trimmedName || trimmedName.length < 3) {
            reject(new Error('Temple name must be at least 3 characters'))
            return
          }

          const newTemple = {
            id: Date.now(),
            slug: `temple${Date.now()}`,
            ...templeData,
            name: trimmedName, // use trimmed name
            status: 'PENDING',
            created_at: new Date().toISOString()
          }

          resolve({ data: newTemple })
        }, 1500)
      })

      temples.value.push(response.data)
      resetForm()
      return response.data

    } catch (err) {
      error.value = err.message || 'Failed to create temple'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTemple = async (id, updates) => {
    try {
      loading.value = true
      error.value = null

      // Mock API call
      const response = await new Promise(resolve => {
        setTimeout(() => {
          const updatedTemple = {
            ...temples.value.find(t => t.id === id),
            ...updates,
            updated_at: new Date().toISOString()
          }
          resolve({ data: updatedTemple })
        }, 1000)
      })

      const index = temples.value.findIndex(t => t.id === id)
      if (index !== -1) {
        temples.value[index] = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to update temple'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTemple = async (id) => {
    try {
      loading.value = true
      error.value = null

      // Mock API call
      await new Promise(resolve => {
        setTimeout(resolve, 800)
      })

      temples.value = temples.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err.message || 'Failed to delete temple'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentTemple = (temple) => {
    currentTemple.value = temple
  }

  // ✅ ADD MISSING METHOD: getCurrentTemple
  const getCurrentTemple = () => {
    return currentTemple.value
  }

  // ✅ ADD METHOD: Get temple by slug (useful for routing)
  const getTempleBySlug = (slug) => {
    return temples.value.find(temple => temple.slug === slug)
  }

  // ✅ ADD METHOD: Set current temple by slug
  const setCurrentTempleBySlug = (slug) => {
    const temple = getTempleBySlug(slug)
    if (temple) {
      currentTemple.value = temple
      return temple
    }
    return null
  }

  const resetForm = () => {
    templeForm.value = {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      category: '',
      establishedYear: '',
      presiding_deity: '',
      timings: {
        morning_open: '',
        morning_close: '',
        evening_open: '',
        evening_close: ''
      },
      facilities: [],
      documents: [],
      status: 'PENDING',
      rejection_reason: '',
      admin_notes: ''
    }
  }

  const updateFormField = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      templeForm.value[parent][child] = value
    } else {
      templeForm.value[field] = value
    }
  }

  const searchTemples = (query) => {
    if (!query.trim()) return temples.value
    
    const searchTerm = query.toLowerCase()
    return temples.value.filter(temple => 
      temple.name.toLowerCase().includes(searchTerm) ||
      temple.address.city.toLowerCase().includes(searchTerm) ||
      temple.address.state.toLowerCase().includes(searchTerm) ||
      temple.presiding_deity.toLowerCase().includes(searchTerm)
    )
  }

  const getTempleById = computed(() => (id) => {
    return temples.value.find(temple => temple.id === parseInt(id))
  })

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    temples,
    currentTemple,
    loading,
    error,
    templeForm,
    
    // Computed
    approvedTemples,
    pendingTemples,
    rejectedTemples,
    templeCounts,
    getTempleById,
    
    // Actions
    fetchTemples,
    createTemple,
    updateTemple,
    deleteTemple,
    setCurrentTemple,
    getCurrentTemple, // ✅ ADDED
    getTempleBySlug, // ✅ ADDED
    setCurrentTempleBySlug, // ✅ ADDED
    resetForm,
    updateFormField,
    searchTemples,
    clearError
  }
})