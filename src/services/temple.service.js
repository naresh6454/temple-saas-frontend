import { api } from './api'

const templeService = {
  /**
   * Get all available temples for devotees and volunteers
   * Using the correct endpoint from the backend
   */
  async getTemples() {
    try {
      console.log('📡 Making API call to fetch available temples')
      
      // Use the correct endpoint from routes.go
      const response = await api.get('/api/v1/entities')
      console.log('📥 Temple API response received:', response)
      
      // Process and normalize the temple data
      if (!response) {
        console.error('🚨 API returned unexpected format:', response)
        throw new Error('API returned data in unexpected format')
      }
      
      // Handle different possible response structures
      let templeData = response
      if (!Array.isArray(response)) {
        if (response.data && Array.isArray(response.data)) {
          templeData = response.data
        } else if (response.temples && Array.isArray(response.temples)) {
          templeData = response.temples
        } else if (response.entities && Array.isArray(response.entities)) {
          templeData = response.entities
        } else if (response.items && Array.isArray(response.items)) {
          templeData = response.items
        }
      }
      
      if (!Array.isArray(templeData)) {
        console.error('🚨 Could not extract array from response:', response)
        throw new Error('API returned data in unexpected format')
      }
      
      // Normalize the data for frontend components
      const normalizedTemples = templeData.map(temple => this.normalizeTempleData(temple))
      console.log('✅ Normalized temples:', normalizedTemples)
      
      return normalizedTemples
    } catch (error) {
      console.error('❌ Error fetching temples:', error)
      throw error
    }
  },
  
  /**
   * Get temple by ID
   */
  async getTempleById(id) {
    try {
      console.log(`📡 Fetching temple with ID: ${id}`)
      // Use correct endpoint with /api prefix
      const response = await api.get(`/api/v1/entities/${id}`)
      console.log('📥 Temple by ID response:', response)
      
      // Normalize single temple data
      const normalizedTemple = this.normalizeTempleData(response)
      return normalizedTemple
    } catch (error) {
      console.error(`❌ Error fetching temple ID ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Join a temple as a volunteer or devotee
   * Using the memberships endpoint from the backend
   */
  async joinTemple(templeId, role = 'volunteer') {
    try {
      console.log(`📡 Joining temple ID ${templeId} as ${role}`)
      // Use the correct memberships endpoint
      const response = await api.post('/api/v1/memberships', {
        entity_id: templeId
      })
      
      console.log('📥 Join temple response:', response)
      return response
    } catch (error) {
      console.error(`❌ Error joining temple ID ${templeId}:`, error)
      throw error
    }
  },
  
  /**
   * Normalize temple data from backend to frontend structure
   */
  normalizeTempleData(temple) {
    if (!temple) return null
    
    // Create a normalized temple object with fallbacks for all properties
    const normalizedTemple = {
      id: temple.ID || temple.id || 0,
      name: temple.Name || temple.name || 'Unknown Temple',
      description: temple.Description || temple.description || '',
      templeType: temple.TempleType || temple.temple_type || temple.type || '',
      category: temple.TempleType || temple.temple_type || temple.category || '',
      
      // Location
      addressLine1: temple.StreetAddress || temple.street_address || temple.address || '',
      city: temple.City || temple.city || '',
      state: temple.State || temple.state || '',
      district: temple.District || temple.district || '',
      pincode: temple.Pincode || temple.pincode || temple.zip_code || '',
      country: temple.Country || temple.country || 'India',
      
      // Contact
      phone: temple.Phone || temple.phone || temple.contact_number || '',
      email: temple.Email || temple.email || '',
      
      // Status and counts
      status: temple.Status || temple.status || 'pending',
      devoteeCount: temple.DevoteeCount || temple.devotee_count || 0,
      volunteersCount: temple.VolunteersCount || temple.volunteers_count || 0,
      
      // Image
      image: temple.ImageURL || temple.image_url || temple.photo_url || temple.image || null,
      
      // Additional Info
      mainDeity: temple.MainDeity || temple.main_deity || '',
      establishedYear: temple.EstablishedYear || temple.established_year || null,
      
      // Timestamps
      createdAt: temple.CreatedAt || temple.created_at || null,
      updatedAt: temple.UpdatedAt || temple.updated_at || null,
      
      // Structured data for components
      address: {
        street: temple.StreetAddress || temple.street_address || '',
        city: temple.City || temple.city || '',
        state: temple.State || temple.state || '',
        district: temple.District || temple.district || '',
        pincode: temple.Pincode || temple.pincode || '',
        country: temple.Country || temple.country || 'India'
      },
      
      contact: {
        phone: temple.Phone || temple.phone || temple.contact_number || '',
        email: temple.Email || temple.email || '',
        website: temple.Website || temple.website || ''
      }
    }
    
    return normalizedTemple
  },
  
  /**
   * Search temples by query - this endpoint is not explicitly defined in your backend
   * but could be implemented in the future
   */
  async searchTemples(query) {
    try {
      console.log(`📡 Searching temples with query: ${query}`)
      // Use the GET all endpoint with query params
      const response = await api.get(`/api/v1/entities?search=${encodeURIComponent(query)}`)
      
      const normalizedTemples = Array.isArray(response) 
        ? response.map(temple => this.normalizeTempleData(temple))
        : []
        
      return normalizedTemples
    } catch (error) {
      console.error('❌ Error searching temples:', error)
      throw error
    }
  }
}

export default templeService