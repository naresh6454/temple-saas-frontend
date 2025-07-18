import { api } from './api'

const templeService = {
  async getTemples() {
    try {
      console.log('📡 Making API call to fetch available temples')

      const response = await api.get('/api/v1/entities')
      console.log('📥 Temple API response received:', response)

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

      const normalizedTemples = templeData.map(temple => this.normalizeTempleData(temple))
      console.log('✅ Normalized temples:', normalizedTemples)

      return normalizedTemples
    } catch (error) {
      console.error('❌ Error fetching temples:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async createTemple(templeData) {
    try {
      console.log('📡 Creating new temple entity')
      console.log('📋 Raw form data received:', templeData)

      const mainDeity = templeData.MainDeity || templeData.mainDeity || templeData['main_deity'] || ''
      const establishedYear = parseInt(templeData.EstablishedYear || templeData.establishedYear || templeData['established_year'] || '')

      const payload = {
        name: templeData.Name || templeData.name || "",
        main_deity: mainDeity,
        temple_type: templeData.TempleType || templeData.templeType || templeData['temple_type'] || "",
        established_year: establishedYear,
        phone: templeData.Phone || templeData.phone || "",
        email: templeData.Email || templeData.email || "",
        description: templeData.Description || templeData.description || '',
        street_address: templeData.StreetAddress || templeData.addressLine1 || '',
        city: templeData.City || templeData.city || "",
        district: templeData.District || templeData.district || "",
        state: templeData.State || templeData.state || "",
        pincode: templeData.Pincode || templeData.pincode || "",
        landmark: templeData.Landmark || templeData.landmark || '',
        map_link: templeData.MapLink || templeData.googleMapsLink || '',
        accepted_terms: true,
        status: 'pending'
      }

      console.log('🔍 FIELD VALIDATION CHECK:')
      console.log(`name: "${payload.name}" - ${payload.name ? '✅' : '❌'}`)
      console.log(`main_deity: "${payload.main_deity}" - ${payload.main_deity ? '✅' : '❌'}`)
      console.log(`temple_type: "${payload.temple_type}" - ${payload.temple_type ? '✅' : '❌'}`)
      console.log(`established_year: ${payload.established_year} - ${payload.established_year ? '✅' : '❌'}`)
      console.log(`phone: "${payload.phone}" - ${payload.phone ? '✅' : '❌'}`)
      console.log(`email: "${payload.email}" - ${payload.email ? '✅' : '❌'}`)
      console.log(`city: "${payload.city}" - ${payload.city ? '✅' : '❌'}`)
      console.log(`district: "${payload.district}" - ${payload.district ? '✅' : '❌'}`)
      console.log(`state: "${payload.state}" - ${payload.state ? '✅' : '❌'}`)
      console.log(`pincode: "${payload.pincode}" - ${payload.pincode ? '✅' : '❌'}`)

      const missingFields = []
      if (!payload.name) missingFields.push('Temple Name')
      if (!payload.main_deity) missingFields.push('Main Deity')
      if (!payload.temple_type) missingFields.push('Temple Type')
      if (!payload.established_year) missingFields.push('Established Year')
      if (!payload.phone) missingFields.push('Phone')
      if (!payload.email) missingFields.push('Email')
      if (!payload.city) missingFields.push('City')
      if (!payload.district) missingFields.push('District')
      if (!payload.state) missingFields.push('State')
      if (!payload.pincode) missingFields.push('Pincode')

      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}. Please fill in all required fields.`
        console.error('❌ VALIDATION ERROR:', errorMessage)
        throw new Error(errorMessage)
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(payload.email)) {
        throw new Error('Please enter a valid email address.')
      }

      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(payload.phone.replace(/[^0-9]/g, ''))) {
        throw new Error('Please enter a valid 10-digit phone number.')
      }

      console.log('✅ All required fields present!')
      console.log('📦 Payload being sent to API:', payload)

      const response = await api.post('/api/v1/entities', payload)
      console.log('📥 Create temple response:', response)

      return response
    } catch (error) {
      console.error('❌ Error creating temple:', error)
      console.error('Error details:', error.message || error.response?.data)
      throw error
    }
  },

  async getTempleById(id) {
    try {
      console.log(`📡 Fetching temple with ID: ${id}`)

      const response = await api.get(`/api/v1/entities/${id}`)
      console.log('📥 Temple by ID response:', response)

      return this.normalizeTempleData(response)
    } catch (error) {
      console.error(`❌ Error fetching temple ID ${id}:`, error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async updateTemple(id, updates) {
    try {
      console.log(`📡 Updating temple with ID: ${id}`)

      const mainDeity = updates.MainDeity || updates.mainDeity || updates['main_deity'] || ''
      const establishedYear = parseInt(updates.EstablishedYear || updates.establishedYear || updates['established_year'] || '')

      const payload = {
        name: updates.Name || updates.name || "",
        main_deity: mainDeity,
        temple_type: updates.TempleType || updates.templeType || updates['temple_type'] || "",
        established_year: establishedYear,
        phone: updates.Phone || updates.phone || "",
        email: updates.Email || updates.email || "",
        description: updates.Description || updates.description || '',
        street_address: updates.StreetAddress || updates.addressLine1 || '',
        city: updates.City || updates.city || "",
        district: updates.District || updates.district || "",
        state: updates.State || updates.state || "",
        pincode: updates.Pincode || updates.pincode || "",
        landmark: updates.Landmark || updates.landmark || '',
        map_link: updates.MapLink || updates.googleMapsLink || ''
      }

      const missingFields = []
      if (!payload.name) missingFields.push('Temple Name')
      if (!payload.main_deity) missingFields.push('Main Deity')
      if (!payload.temple_type) missingFields.push('Temple Type')
      if (!payload.established_year) missingFields.push('Established Year')
      if (!payload.phone) missingFields.push('Phone')
      if (!payload.email) missingFields.push('Email')
      if (!payload.city) missingFields.push('City')
      if (!payload.district) missingFields.push('District')
      if (!payload.state) missingFields.push('State')
      if (!payload.pincode) missingFields.push('Pincode')

      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}. Please fill in all required fields.`
        console.error('❌ VALIDATION ERROR:', errorMessage)
        throw new Error(errorMessage)
      }

      const response = await api.put(`/api/v1/entities/${id}`, payload)
      console.log('📥 Update temple response:', response)

      return response
    } catch (error) {
      console.error(`❌ Error updating temple ID ${id}:`, error)
      console.error('Error details:', error.message || error.response?.data)
      throw error
    }
  },

  async deleteTemple(id) {
    try {
      console.log(`📡 Deleting temple with ID: ${id}`)

      await api.delete(`/api/v1/entities/${id}`)
      console.log('✅ Temple deleted successfully')
    } catch (error) {
      console.error(`❌ Error deleting temple ID ${id}:`, error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async joinTemple(templeId, role = 'volunteer') {
    try {
      console.log(`📡 Joining temple ID ${templeId} as ${role}`)

      const response = await api.post('/api/v1/memberships', {
        entity_id: templeId
      })

      console.log('📥 Join temple response:', response)
      return response
    } catch (error) {
      console.error(`❌ Error joining temple ID ${templeId}:`, error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  normalizeTempleData(temple) {
    if (!temple) return null

    return {
      id: temple.id || 0,
      name: temple.name || 'Unknown Temple',
      description: temple.description || '',
      templeType: temple.temple_type || '',
      category: temple.temple_type || '',

      addressLine1: temple.street_address || '',
      city: temple.city || '',
      state: temple.state || '',
      district: temple.district || '',
      pincode: temple.pincode || '',
      country: 'India',

      phone: temple.phone || '',
      email: temple.email || '',

      status: temple.status || 'pending',
      devoteeCount: temple.devotee_count || 0,
      volunteersCount: temple.volunteers_count || 0,

      image: temple.image_url || null,

      mainDeity: temple.main_deity || '',
      establishedYear: temple.established_year || null,

      createdAt: temple.created_at || null,
      updatedAt: temple.updated_at || null,

      address: {
        street: temple.street_address || '',
        city: temple.city || '',
        state: temple.state || '',
        district: temple.district || '',
        pincode: temple.pincode || '',
        country: 'India'
      },

      contact: {
        phone: temple.phone || '',
        email: temple.email || '',
        website: temple.website || ''
      }
    }
  },

  async searchTemples(query) {
    try {
      console.log(`📡 Searching temples with query: ${query}`)

      const response = await api.get(`/api/v1/entities?search=${encodeURIComponent(query)}`)

      const normalizedTemples = Array.isArray(response)
        ? response.map(temple => this.normalizeTempleData(temple))
        : []

      return normalizedTemples
    } catch (error) {
      console.error('❌ Error searching temples:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  }
}

export default templeService
