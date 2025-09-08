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
  }

  // Actions
  const fetchTemples = async (tenantId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(`🏛️ Fetching temples for tenant ID ${tenantId || 'unknown'}...`)
      
      // Add headers for tenant ID if provided
      const options = {}
      if (tenantId) {
        options.headers = {
          'X-Tenant-ID': tenantId
        }
      }
      
      // Add cache busting to ensure fresh data
      const timestamp = Date.now()
      const response = await templeService.getTemples(options, timestamp)
      
      console.log('🏛️ Temple service response:', response)
      
      // The new API structure returns data directly, not response.data
      temples.value = response || []
      console.log('🏛️ Temples set in store:', temples.value)
      
      return response
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch temples'
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error fetching temples:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // This is just the updated method to add to the temple.js store
// This is the updated fetchTemplesForSuperAdmin method for temple.js store
const fetchTemplesForSuperAdmin = async (tenantId) => {
  console.log(`🏛️ Fetching temples for SuperAdmin for tenant ID ${tenantId}...`);
  // Clear existing temples before fetching new ones
  temples.value = [];
  loading.value = true;
  error.value = null;
  
  try {
    if (!tenantId) {
      console.warn('No tenant ID provided for fetchTemplesForSuperAdmin');
      return [];
    }
    
    console.log(`🔄 Starting fresh fetch for tenant ID ${tenantId}`);
    
    // Store the tenant ID in localStorage to ensure it's available for filtering
    localStorage.setItem('current_tenant_id', tenantId);
    
    // Set headers for the API request to include tenant ID
    const options = {
      tenantId: tenantId,
      superAdmin: true,
      headers: {
        'X-Tenant-ID': tenantId
      },
      timestamp: Date.now() // Add timestamp for cache busting
    };
    
    // Use the existing getTemples method with all necessary parameters
    const response = await templeService.getTemples(options);
    
    if (response && Array.isArray(response)) {
      // Double-check filtering on the client side to ensure only tenant-specific temples
      const filteredResponse = response.filter(temple => 
        (temple.created_by && temple.created_by.toString() === tenantId.toString()) ||
        (temple.tenant_id && temple.tenant_id.toString() === tenantId.toString()) ||
        (temple.creator_id && temple.creator_id.toString() === tenantId.toString())
      );
      
      temples.value = filteredResponse;
      console.log(`🏛️ Temple service response for SuperAdmin: ${filteredResponse.length} temples for tenant ${tenantId}`);
    } else {
      temples.value = [];
      console.warn(`No temples returned for tenant ID ${tenantId}`);
    }
    
    return temples.value;
  } catch (err) {
    console.error(`❌ Error fetching temples for SuperAdmin:`, err);
    error.value = `Failed to fetch temples: ${err.message || 'Unknown error'}`;
    return [];
  } finally {
    loading.value = false;
  }
}

// Add this as a new method to your temple.js store
const fetchSuperAdminTemplesStrict = async (tenantId) => {
  console.log(`🔒 STRICT STORE: Fetching temples for tenant ID ${tenantId}`);
  temples.value = [];
  loading.value = true;
  error.value = null;
  
  try {
    if (!tenantId) {
      console.warn('🚫 STRICT STORE: No tenant ID provided');
      return [];
    }
    
    const response = await templeService.getSuperAdminTemplesStrict(tenantId);
    
    // Set the temples directly
    temples.value = response;
    console.log(`🔒 STRICT STORE: Set ${temples.value.length} temples in store`);
    
    return temples.value;
  } catch (err) {
    console.error(`❌ STRICT STORE: Error:`, err);
    error.value = `Failed to fetch temples: ${err.message || 'Unknown error'}`;
    return [];
  } finally {
    loading.value = false;
  }
}

// Add to temple.js store
const fetchDirectByTenant = async (tenantId) => {
  console.log(`🔄 STORE DIRECT: Fetching temples for tenant ${tenantId}`);
  
  // Clear existing data
  temples.value = [];
  loading.value = true;
  error.value = null;
  
  try {
    const result = await templeService.getTemplesDirectByTenant(tenantId);
    temples.value = result;
    console.log(`🔄 STORE DIRECT: Set ${result.length} temples in store`);
    return result;
  } catch (err) {
    console.error(`🔄 STORE DIRECT: Error:`, err);
    error.value = err.message || 'Unknown error';
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
    
    // Create a proper temple object to add to the list
    // Even if the API doesn't return the complete temple data
    const newTemple = {
      id: response.id || response.ID || Date.now(), // Fallback ID if not returned
      name: formDataToSend.name || '',
      description: formDataToSend.description || '',
      status: 'pending', // Explicitly set status to pending
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Include other fields from the form data
      main_deity: formDataToSend.main_deity || '',
      temple_type: formDataToSend.temple_type || formDataToSend.category || '',
      phone: formDataToSend.phone || '',
      email: formDataToSend.email || '',
      city: formDataToSend.city || '',
      state: formDataToSend.state || '',
      district: formDataToSend.district || '',
      pincode: formDataToSend.pincode || '',
      street_address: formDataToSend.street_address || ''
    }
    
    // Add the new temple to the list
    temples.value.push(newTemple)
    
    toast.success('Temple created successfully. It will be reviewed by the admin.')
    
    resetForm()
    
    // Remove the fetchTemples() call that was causing the issue
    // This prevents overriding our local addition
    
    // Clear any cached data in localStorage that might be related to temples
    try {
      localStorage.removeItem('dashboard_local_data')
      localStorage.removeItem('dashboard_counts')
      localStorage.removeItem('dashboard_seva_names')
    } catch (e) {
      console.warn('Could not clear localStorage cache:', e)
    }
    
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

  // Add this method to temple.store.js
const fetchTemplesForAssignedTenant = async (tenantId) => {
  try {
    console.log(`Fetching temples for assigned tenant ID: ${tenantId}`);
    
    // Set headers for API call
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'X-Tenant-ID': tenantId
    };
    
    // Try multiple endpoints to handle different API patterns
    const endpoints = [
      `/v1/tenant/${tenantId}/entities`,
      `/v1/tenant/entities?tenant_id=${tenantId}`,
      `/v1/entities?tenant_id=${tenantId}`
    ];
    
    let temples = [];
    let success = false;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          temples = data.entities || data.data || data;
          success = true;
          console.log(`Success with endpoint ${endpoint}, found ${temples.length} temples`);
          break;
        }
      } catch (error) {
        console.warn(`Failed with endpoint ${endpoint}: ${error.message}`);
      }
    }
    
    if (!success) {
      console.error('All endpoints failed for assigned tenant temples');
      return [];
    }
    
    // Update store state
    temples.value = temples;
    return temples;
  } catch (error) {
    console.error(`Error fetching temples for assigned tenant: ${error}`);
    return [];
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
    fetchDirectByTenant,
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