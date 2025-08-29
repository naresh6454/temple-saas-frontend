// src/stores/temple.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import templeService from '@/services/temple.service'
import { useToast } from '@/composables/useToast' // Assuming you have a toast composable

export const useTempleStore = defineStore('temple', () => {
  // State
  const temples = ref([])
  const currentTemple = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

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

  // Clear all temple data
  const clearTempleData = () => {
    temples.value = []
    currentTemple.value = null
    console.log('🧹 Temple data cleared')
  }

  // Actions
  const fetchTemples = async (tenantId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(`🏛️ Fetching temples for tenant ID ${tenantId || 'unknown'}...`)
      
      // Try multiple approaches to get temples
      let templeResults = []
      
      // First attempt - direct API call with tenant_id
      try {
        console.log('🔍 ATTEMPT 1: Direct API call with tenant_id')
        const timestamp = Date.now()
        const response = await templeService.getTemples({ tenantId: tenantId })
        if (response && Array.isArray(response) && response.length > 0) {
          console.log(`✅ ATTEMPT 1 successful: Found ${response.length} temples`)
          templeResults = response
        } else {
          console.log('⚠️ ATTEMPT 1: No temples found or invalid response format')
        }
      } catch (err) {
        console.error('❌ ATTEMPT 1 failed:', err.message)
      }
      
      // Second attempt - try direct entities endpoint if first attempt failed
      if (templeResults.length === 0) {
        try {
          console.log('🔍 ATTEMPT 2: Trying direct entities endpoint')
          const timestamp = Date.now()
          const response = await templeService.fetchEntitiesDirectly(tenantId)
          if (response && Array.isArray(response) && response.length > 0) {
            console.log(`✅ ATTEMPT 2 successful: Found ${response.length} temples`)
            templeResults = response
          } else {
            console.log('⚠️ ATTEMPT 2: No temples found or invalid response format')
          }
        } catch (err) {
          console.error('❌ ATTEMPT 2 failed:', err.message)
        }
      }
      
      // Set temples in store
      if (templeResults.length > 0) {
        temples.value = templeResults
        console.log('🏛️ Temples set in store:', temples.value)
      } else {
        temples.value = []
        console.warn('⚠️ No temples found for tenant ID', tenantId)
      }
      
      return templeResults
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch temples'
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error fetching temples:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Updated fetchTemplesForSuperAdmin method with improved multiple tenant handling
  const fetchTemplesForSuperAdmin = async (tenantIds) => {
    console.log(`🏛️ Fetching temples for SuperAdmin for tenant ID(s):`, tenantIds);
    // Clear existing temples before fetching new ones
    temples.value = [];
    loading.value = true;
    error.value = null;
    
    try {
      if (!tenantIds) {
        console.error('❌ No tenant IDs provided for fetchTemplesForSuperAdmin');
        error.value = 'No tenant IDs provided';
        return [];
      }
      
      // Handle both single tenant ID and array of tenant IDs
      if (Array.isArray(tenantIds)) {
        if (tenantIds.length === 0) {
          console.error('❌ Empty tenant IDs array provided for fetchTemplesForSuperAdmin');
          error.value = 'No tenant IDs provided';
          return [];
        }
        
        console.log(`🔄 Starting fetch for ${tenantIds.length} tenant IDs:`, tenantIds);
        
        // For multiple tenants, we need to fetch and combine temples from all tenants
        let allTemples = [];
        
        // Option 1: Try sending all tenant IDs in a single request
        try {
          console.log('🔍 ATTEMPT 1: Using combined API call for all tenants');
          const response = await templeService.getSuperAdminTemples(tenantIds);
          
          if (response && Array.isArray(response) && response.length > 0) {
            console.log(`✅ Combined call successful: Found ${response.length} temples`);
            allTemples = response;
          } else {
            console.log('⚠️ Combined call returned no temples, trying individual requests');
          }
        } catch (err) {
          console.error('❌ Combined API call failed:', err.message);
        }
        
        // Option 2: If combined call failed or returned no temples, fetch each tenant individually
        if (allTemples.length === 0) {
          console.log('🔍 ATTEMPT 2: Fetching temples for each tenant individually');
          
          const fetchPromises = tenantIds.map(tenantId => {
            return templeService.fetchEntitiesDirectly(tenantId)
              .then(temples => {
                console.log(`✅ Found ${temples.length} temples for tenant ${tenantId}`);
                return temples;
              })
              .catch(err => {
                console.error(`❌ Failed to fetch temples for tenant ${tenantId}:`, err.message);
                return []; // Return empty array for failed tenant to avoid breaking Promise.all
              });
          });
          
          // Wait for all tenant requests to complete
          const results = await Promise.all(fetchPromises);
          
          // Combine all temple results
          results.forEach(temples => {
            if (Array.isArray(temples) && temples.length > 0) {
              allTemples.push(...temples);
            }
          });
          
          console.log(`✅ Individual fetches completed: Found ${allTemples.length} temples in total`);
        }
        
        // Set temples in store
        if (allTemples.length > 0) {
          temples.value = allTemples;
          console.log(`🏛️ Set ${allTemples.length} temples in store`);
        } else {
          temples.value = [];
          console.warn('⚠️ No temples found for any of the selected tenants');
        }
        
        return temples.value;
      } else {
        // Single tenant ID case - use existing method
        console.log(`🔄 Fetching temples for single tenant ID: ${tenantIds}`);
        
        let templeResults = [];
        
        // First attempt
        try {
          console.log('🔍 Trying temple service call');
          const response = await templeService.getSuperAdminTemples(tenantIds);
          
          if (response && Array.isArray(response) && response.length > 0) {
            console.log(`✅ Found ${response.length} temples for tenant ${tenantIds}`);
            templeResults = response;
          } else {
            console.log('⚠️ No temples found or invalid response, trying direct endpoint');
          }
        } catch (err) {
          console.error('❌ Temple service call failed:', err.message);
        }
        
        // Second attempt if first failed
        if (templeResults.length === 0) {
          try {
            console.log('🔍 Trying direct entities endpoint');
            const response = await templeService.fetchEntitiesDirectly(tenantIds);
            
            if (response && Array.isArray(response) && response.length > 0) {
              console.log(`✅ Found ${response.length} temples using direct endpoint`);
              templeResults = response;
            } else {
              console.log('⚠️ Direct endpoint returned no temples');
            }
          } catch (err) {
            console.error('❌ Direct endpoint call failed:', err.message);
          }
        }
        
        // Set temples in store
        temples.value = templeResults;
        console.log(`🏛️ Set ${templeResults.length} temples in store for tenant ${tenantIds}`);
        
        return temples.value;
      }
    } catch (err) {
      console.error(`❌ Error in fetchTemplesForSuperAdmin:`, err);
      error.value = `Failed to fetch temples: ${err.message || 'Unknown error'}`;
      return [];
    } finally {
      loading.value = false;
    }
  }

  const createTemple = async (templeData) => {
    try {
      loading.value = true
      error.value = null

      // Create FormData if there are file uploads
      let formDataToSend = templeData
      if (!(templeData instanceof FormData)) {
        if (templeData.documents && templeData.documents.length > 0) {
          const formData = new FormData()
          
          // Append JSON data
          formData.append('data', JSON.stringify({
            name: templeData.name,
            description: templeData.description,
            phone: templeData.contact?.phone,
            email: templeData.contact?.email,
            addressLine1: templeData.address?.street,
            city: templeData.address?.city,
            state: templeData.address?.state,
            pincode: templeData.address?.pincode,
            country: templeData.address?.country || 'India',
            templeType: templeData.category,
            establishedDate: templeData.establishedYear ? `${templeData.establishedYear}-01-01` : null,
            contactPerson: templeData.contact?.name
          }))
          
          // Append documents
          if (templeData.documents.registration) {
            formData.append('registration', templeData.documents.registration)
          }
          if (templeData.documents.trustDeed) {
            formData.append('trustDeed', templeData.documents.trustDeed)
          }
          if (templeData.documents.property) {
            formData.append('property', templeData.documents.property)
          }
          if (templeData.documents.additional && templeData.documents.additional.length) {
            templeData.documents.additional.forEach((file, index) => {
              formData.append(`additional_${index}`, file)
            })
          }
          
          formDataToSend = formData
        }
      }

      const response = await templeService.createTemple(formDataToSend)
      
      // Add the new temple to the list
      temples.value.push(response)
      
      toast.success('Temple created successfully. It will be reviewed by the admin.')
      
      resetForm()
      return response

    } catch (err) {
      const errorMessage = err.message || 'Failed to create temple'
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error creating temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTemple = async (id, updates) => {
    try {
      loading.value = true
      error.value = null

      // Create FormData if there are file uploads
      let formDataToSend = updates
      if (!(updates instanceof FormData)) {
        if (updates.documents && (updates.documents.length > 0 || 
            updates.documents.registration || 
            updates.documents.trustDeed || 
            updates.documents.property || 
            updates.documents.additional)) {
          
          const formData = new FormData()
          
          // Append JSON data
          formData.append('data', JSON.stringify({
            name: updates.name,
            description: updates.description,
            phone: updates.contact?.phone,
            email: updates.contact?.email,
            addressLine1: updates.address?.street,
            city: updates.address?.city,
            state: updates.address?.state,
            pincode: updates.address?.pincode,
            country: updates.address?.country || 'India',
            templeType: updates.category,
            establishedDate: updates.establishedYear ? `${updates.establishedYear}-01-01` : null,
            contactPerson: updates.contact?.name
          }))
          
          // Append documents
          if (updates.documents.registration) {
            formData.append('registration', updates.documents.registration)
          }
          if (updates.documents.trustDeed) {
            formData.append('trustDeed', updates.documents.trustDeed)
          }
          if (updates.documents.property) {
            formData.append('property', updates.documents.property)
          }
          if (updates.documents.additional && updates.documents.additional.length) {
            updates.documents.additional.forEach((file, index) => {
              formData.append(`additional_${index}`, file)
            })
          }
          
          formDataToSend = formData
        }
      }

      const response = await templeService.updateTemple(id, formDataToSend)

      // Update the temple in the list
      const index = temples.value.findIndex(t => t.id === Number(id))
      if (index !== -1) {
        temples.value[index] = response
      }
      
      toast.success('Temple updated successfully')
      
      return response
    } catch (err) {
      const errorMessage = err.message || `Failed to update temple with ID: ${id}`
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error updating temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTemple = async (id) => {
    try {
      loading.value = true
      error.value = null

      await templeService.deleteTemple(id)

      // Remove deleted temple from the list
      temples.value = temples.value.filter(t => t.id !== Number(id))
      
      toast.success('Temple deleted successfully')
    } catch (err) {
      const errorMessage = err.message || `Failed to delete temple with ID: ${id}`
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error deleting temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentTemple = (temple) => {
    currentTemple.value = temple
  }

  const getCurrentTemple = () => {
    return currentTemple.value
  }

  const getTempleBySlug = (slug) => {
    return temples.value.find(temple => temple.slug === slug)
  }

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
      temple.address?.city?.toLowerCase().includes(searchTerm) ||
      temple.address?.state?.toLowerCase().includes(searchTerm) ||
      temple.presiding_deity?.toLowerCase().includes(searchTerm)
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
    getCurrentTemple,
    getTempleBySlug,
    setCurrentTempleBySlug,
    resetForm,
    updateFormField,
    searchTemples,
    clearError,
    fetchTemplesForSuperAdmin,
    clearTempleData
  }
})