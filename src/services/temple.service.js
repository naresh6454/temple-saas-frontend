import { api } from './api' // Import the structured api object

export default {
  /**
   * Get all temples
   */
  async getTemples() {
    try {
      console.log('Making API call to:', '/api/v1/entities')
      const response = await api.get('/api/v1/entities')
      console.log('API response received:', response)
      
      // Normalize data structure for frontend components
      const normalizedTemples = Array.isArray(response) ? response.map(this.normalizeTempleData) : [];
      
      // Debug log the normalized temples
      console.log('Normalized temples:', normalizedTemples)
      
      return normalizedTemples
    } catch (error) {
      console.error('Raw API error:', error)
      throw this.handleError(error)
    }
  },

  /**
   * Get temple by ID
   */
  async getTempleById(id) {
    try {
      const response = await api.get(`/api/v1/entities/${id}`)
      console.log('Temple by ID response:', response)
      
      // Normalize single temple data
      const normalizedTemple = this.normalizeTempleData(response)
      
      return normalizedTemple
    } catch (error) {
      throw this.handleError(error)
    }
  },
  
  /**
   * Normalize temple data from backend to frontend structure
   */
  normalizeTempleData(temple) {
    if (!temple) return null;
    
    // Log the raw temple data from backend
    console.log('Normalizing temple:', temple)
    console.log('Original status:', temple.Status || temple.status)
    
    // Handle potential null or undefined values with fallbacks
    const normalizedTemple = {
      id: temple.ID || temple.id || 0,
      name: temple.Name || temple.name || '',
      description: temple.Description || temple.description || '',
      templeType: temple.TempleType || temple.temple_type || '',
      addressLine1: temple.StreetAddress || temple.street_address || '',
      city: temple.City || temple.city || '',
      state: temple.State || temple.state || '',
      district: temple.District || temple.district || '',
      pincode: temple.Pincode || temple.pincode || '',
      country: temple.Country || temple.country || 'India',
      phone: temple.Phone || temple.phone || '',
      email: temple.Email || temple.email || '',
      // IMPORTANT: Use the original case for status - don't convert to uppercase
      status: temple.Status || temple.status || 'pending',
      createdAt: temple.CreatedAt || temple.created_at || null,
      updatedAt: temple.UpdatedAt || temple.updated_at || null,
      main_deity: temple.MainDeity || temple.main_deity || '',
      establishedYear: temple.EstablishedYear || temple.established_year || null,
      
      // Add address structure expected by components
      address: {
        street: temple.StreetAddress || temple.street_address || '',
        city: temple.City || temple.city || '',
        state: temple.State || temple.state || '',
        district: temple.District || temple.district || '',
        pincode: temple.Pincode || temple.pincode || '',
        country: temple.Country || temple.country || 'India'
      },
      
      // Add contact structure expected by components
      contact: {
        phone: temple.Phone || temple.phone || '',
        email: temple.Email || temple.email || '',
        website: temple.Website || temple.website || ''
      }
    }
    
    console.log('Normalized temple:', normalizedTemple)
    return normalizedTemple
  },
  
  /**
   * Create new temple - FIXED FOR BACKEND COMPATIBILITY
   */
  async createTemple(templeData) {
    try {
      console.log('🔍 Raw temple data received:', templeData)
      
      // Check if templeData is FormData or plain object
      if (templeData instanceof FormData) {
        console.log('📁 Converting FormData to JSON for temple creation')
        
        // Extract data from FormData
        let name = templeData.get('name') || ''
        let description = templeData.get('description') || ''
        let email = templeData.get('email') || ''
        let phone = templeData.get('phone') || ''
        let addressLine1 = templeData.get('addressLine1') || templeData.get('address_line1') || ''
        let city = templeData.get('city') || ''
        let state = templeData.get('state') || ''
        let district = templeData.get('district') || ''
        let pincode = templeData.get('pincode') || ''
        let mainDeity = templeData.get('mainDeity') || templeData.get('deity') || templeData.get('presiding_deity') || templeData.get('main_deity') || ''
        let templeType = templeData.get('templeType') || templeData.get('temple_type') || templeData.get('type') || templeData.get('category') || ''
        
        // Handle establishedYear properly
        let establishedYear = null
        const yearValue = templeData.get('establishedYear') || templeData.get('established_year') || templeData.get('establishedDate')
        
        if (yearValue) {
          if (typeof yearValue === 'string' && yearValue.includes('-')) {
            establishedYear = parseInt(yearValue.split('-')[0])
          } else {
            establishedYear = parseInt(String(yearValue).replace(/[^0-9]/g, ''))
          }
        }
        
        // REQUIRED FIELDS: Make sure we have the required fields
        if (!name) {
          console.error("Missing required field: name")
          throw new Error("Temple name is required")
        }
        
        if (!mainDeity) {
          console.error("Missing required field: mainDeity")
          throw new Error("Temple deity is required")
        }
        
        if (!phone) {
          console.error("Missing required field: phone")
          throw new Error("Phone number is required")
        }
        
        if (!email) {
          console.error("Missing required field: email")
          throw new Error("Email is required")
        }
        
        // Create a JSON payload with snake_case field names to match backend struct json tags
        const payload = {
          name: name,
          description: description,
          email: email,
          phone: phone,
          street_address: addressLine1,
          city: city,
          state: state,
          district: district,
          pincode: pincode,
          temple_type: templeType,
          status: "pending",  // CRITICAL: Add status field explicitly
          main_deity: mainDeity,
          established_year: establishedYear 
        }
        
        // Log what we're sending
        console.log('📤 Sending JSON payload with snake_case fields:', JSON.stringify(payload, null, 2))
        
        // Send the data as JSON
        const response = await api.post('/api/v1/entities', payload)
        return this.normalizeTempleData(response)
        
      } else {
        // Handle the case where templeData is a plain object
        console.log('📋 Using JSON object approach for temple creation')
        
        // Extract all possible field values from different possible object structures
        let name = templeData.name || ''
        let description = templeData.description || ''
        let email = templeData.email || templeData.contact?.email || ''
        let phone = templeData.phone ? 
                    String(templeData.phone).replace(/[^0-9]/g, '') : 
                    (templeData.contact?.phone ? 
                    String(templeData.contact.phone).replace(/[^0-9]/g, '') : '')
        let addressLine1 = templeData.addressLine1 || templeData.address?.street || ''
        let city = templeData.city || templeData.address?.city || ''
        let state = templeData.state || templeData.address?.state || ''
        let district = templeData.district || templeData.address?.district || ''
        let pincode = templeData.pincode || templeData.address?.pincode ? 
                      String(templeData.pincode || templeData.address?.pincode).replace(/[^0-9]/g, '') : ''
        
        // Get deity information from multiple possible fields
        let mainDeity = templeData.mainDeity || templeData.deity || templeData.presiding_deity || templeData.main_deity || ''
        
        // Get temple type from multiple possible fields
        let templeType = templeData.templeType || templeData.temple_type || templeData.category || templeData.type || ''
        
        // Handle establishedYear properly
        let establishedYear = null
        
        // Try multiple possible fields for the year
        if (templeData.establishedYear) {
          establishedYear = parseInt(String(templeData.establishedYear).replace(/[^0-9]/g, ''))
        } else if (templeData.established_year) {
          establishedYear = parseInt(String(templeData.established_year).replace(/[^0-9]/g, ''))
        } else if (templeData.establishedDate) {
          if (typeof templeData.establishedDate === 'string' && templeData.establishedDate.includes('-')) {
            establishedYear = parseInt(templeData.establishedDate.split('-')[0])
          } else {
            establishedYear = parseInt(String(templeData.establishedDate).replace(/[^0-9]/g, ''))
          }
        }
        
        // REQUIRED FIELDS: Make sure we have the required fields
        if (!name) {
          console.error("Missing required field: name")
          throw new Error("Temple name is required")
        }
        
        if (!mainDeity) {
          console.error("Missing required field: mainDeity")
          throw new Error("Temple deity is required")
        }
        
        if (!phone) {
          console.error("Missing required field: phone")
          throw new Error("Phone number is required")
        }
        
        if (!email) {
          console.error("Missing required field: email")
          throw new Error("Email is required")
        }
        
        // CRITICAL FIX: Create payload with snake_case field names to match backend struct json tags
        const payload = {
          name: name,
          description: description,
          email: email,
          phone: phone,
          street_address: addressLine1,
          city: city,
          state: state,
          district: district,
          pincode: pincode,
          temple_type: templeType,
          main_deity: mainDeity,
          status: "pending",  // CRITICAL: Add status field explicitly
          established_year: establishedYear
        }
        
        // Log the payload
        console.log('📤 Sending JSON payload with snake_case fields:', JSON.stringify(payload, null, 2))
        
        const response = await api.post('/api/v1/entities', payload)
        return this.normalizeTempleData(response)
      }
    } catch (error) {
      console.error('💥 Temple creation failed:')
      console.error('✅ error.message:', error.message)
      
      // Log as much error detail as possible
      if (error.response?.data) {
        console.error('🎯 BACKEND ERROR DETAILS (error.response.data):')
        console.error(JSON.stringify(error.response.data, null, 2))
      } else if (error.data) {
        console.error('🎯 BACKEND ERROR DETAILS (error.data):')
        console.error(JSON.stringify(error.data, null, 2))
      }
      
      // Try to extract and log the raw response text
      try {
        if (error.response?.request?.responseText) {
          console.error('🔍 Raw response text:', error.response.request.responseText)
        }
      } catch (e) {
        console.error('Could not extract raw response:', e)
      }
      
      throw this.handleError(error)
    }
  },

  /**
   * Update temple - with snake_case field names
   */
  async updateTemple(id, templeData) {
    try {
      // Similar approach as createTemple, but for updates
      
      if (templeData instanceof FormData) {
        // Extract data fields
        let name = templeData.get('name') || ''
        let description = templeData.get('description') || ''
        let email = templeData.get('email') || ''
        let phone = templeData.get('phone') || ''
        let addressLine1 = templeData.get('addressLine1') || templeData.get('address_line1') || ''
        let city = templeData.get('city') || ''
        let state = templeData.get('state') || ''
        let district = templeData.get('district') || ''
        let pincode = templeData.get('pincode') || ''
        let templeType = templeData.get('templeType') || templeData.get('temple_type') || templeData.get('type') || templeData.get('category') || ''
        let mainDeity = templeData.get('mainDeity') || templeData.get('deity') || templeData.get('presiding_deity') || ''
        
        // Handle establishedYear
        let establishedYear = null
        const yearValue = templeData.get('establishedYear') || templeData.get('established_year') || templeData.get('establishedDate')
        
        if (yearValue) {
          if (typeof yearValue === 'string' && yearValue.includes('-')) {
            establishedYear = parseInt(yearValue.split('-')[0])
          } else {
            establishedYear = parseInt(String(yearValue).replace(/[^0-9]/g, ''))
          }
        }
        
        // Create payload with snake_case field names
        const payload = {
          name: name,
          description: description,
          email: email,
          phone: phone,
          street_address: addressLine1,
          city: city,
          state: state,
          district: district,
          pincode: pincode,
          temple_type: templeType,
          main_deity: mainDeity,
          established_year: establishedYear
        }
        
        console.log('📤 Sending JSON update payload with snake_case fields:', JSON.stringify(payload, null, 2))
        
        const response = await api.put(`/api/v1/entities/${id}`, payload)
        return this.normalizeTempleData(response)
        
      } else {
        // For JSON objects, use snake_case field names
        const payload = {
          name: templeData.name || '',
          description: templeData.description || '',
          email: templeData.email || templeData.contact?.email || '',
          phone: templeData.phone ? 
                 String(templeData.phone).replace(/[^0-9]/g, '') : 
                 (templeData.contact?.phone ? 
                 String(templeData.contact.phone).replace(/[^0-9]/g, '') : ''),
          street_address: templeData.addressLine1 || templeData.address?.street || '',
          city: templeData.city || templeData.address?.city || '',
          state: templeData.state || templeData.address?.state || '',
          district: templeData.district || templeData.address?.district || '',
          pincode: templeData.pincode || templeData.address?.pincode ? 
                   String(templeData.pincode || templeData.address?.pincode).replace(/[^0-9]/g, '') : '',
          temple_type: templeData.templeType || templeData.temple_type || templeData.category || templeData.type || '',
          main_deity: templeData.mainDeity || templeData.deity || templeData.presiding_deity || templeData.main_deity || '',
          established_year: templeData.establishedYear ? 
                          parseInt(String(templeData.establishedYear).replace(/[^0-9]/g, '')) : 
                          (templeData.establishedDate ? 
                           parseInt(String(templeData.establishedDate).split('-')[0]) : null)
        }
        
        console.log('📤 Sending JSON update payload with snake_case fields:', JSON.stringify(payload, null, 2))
        
        const response = await api.put(`/api/v1/entities/${id}`, payload)
        return this.normalizeTempleData(response)
      }
    } catch (error) {
      console.error('💥 Temple update failed:', error.message)
      throw this.handleError(error)
    }
  },

  /**
   * Delete temple
   */
  async deleteTemple(id) {
    try {
      const response = await api.delete(`/api/v1/entities/${id}`)
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    console.error('API Error details:', error)

    if (error && typeof error === 'object') {
      if (error.response?.data) {
        const backendError = error.response.data

        if (backendError.message) return new Error(`Backend error: ${backendError.message}`)
        if (backendError.error) return new Error(`Backend error: ${backendError.error}`)
        if (Array.isArray(backendError.errors)) {
          return new Error(`Validation errors: ${backendError.errors.join(', ')}`)
        }
        if (typeof backendError === 'string') {
          return new Error(`Backend error: ${backendError}`)
        }

        return new Error(`Request failed with status ${error.response.status}: ${JSON.stringify(backendError)}`)
      }

      if (error.message) return new Error(error.message)
    }

    if (typeof error === 'string') return new Error(error)

    return new Error('Network error - please check your connection')
  }
}