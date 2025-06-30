// src/services/event.service.js
import { api } from './api.js'

/**
 * Event Service for Temple Management System
 * Handles all event-related API operations including CRUD, RSVP management,
 * and communication features for temple events and festivals
 */
class EventService {
  // Base endpoint for events
  baseUrl = '/api/v1/events'

  /**
   * Get all events for a specific entity (temple)
   * @param {string} entityId - Temple ID
   * @param {Object} params - Query parameters for filtering/pagination
   * @returns {Promise} API response with events list
   */
  async getEvents(entityId, params = {}) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || 'all',
          category: params.category || 'all',
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
          sortBy: params.sortBy || 'event_date',
          sortOrder: params.sortOrder || 'asc'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  }

  /**
   * Get upcoming events for devotee dashboard
   * @param {string} entityId - Temple ID
   * @param {number} limit - Number of events to fetch
   * @returns {Promise} API response with upcoming events
   */
  async getUpcomingEvents(entityId, limit = 5) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/upcoming`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  }

  /**
   * Get single event by ID
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response with event details
   */
  async getEventById(entityId, eventId) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  }

  /**
   * Create new event
   * @param {string} entityId - Temple ID
   * @param {Object} eventData - Event creation data
   * @returns {Promise} API response with created event
   */
  async createEvent(entityId, eventData) {
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.eventDate,
        event_time: eventData.eventTime,
        end_date: eventData.endDate || null,
        end_time: eventData.endTime || null,
        location: eventData.location || '',
        category: eventData.category || 'festival',
        max_attendees: eventData.maxAttendees || null,
        registration_required: eventData.registrationRequired || false,
        registration_deadline: eventData.registrationDeadline || null,
        entry_fee: eventData.entryFee || 0,
        status: eventData.status || 'active',
        image_url: eventData.imageUrl || '',
        attachments: eventData.attachments || [],
        sevas_attached: eventData.sevasAttached || [],
        contact_person: eventData.contactPerson || '',
        contact_phone: eventData.contactPhone || '',
        contact_email: eventData.contactEmail || '',
        special_instructions: eventData.specialInstructions || '',
        dress_code: eventData.dressCode || '',
        parking_info: eventData.parkingInfo || '',
        facilities: eventData.facilities || [],
        meta_data: eventData.metaData || {}
      }

      const response = await api.post(`/api/v1/entities/${entityId}/events`, payload)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  /**
   * Update existing event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise} API response with updated event
   */
  async updateEvent(entityId, eventId, eventData) {
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.eventDate,
        event_time: eventData.eventTime,
        end_date: eventData.endDate || null,
        end_time: eventData.endTime || null,
        location: eventData.location || '',
        category: eventData.category,
        max_attendees: eventData.maxAttendees || null,
        registration_required: eventData.registrationRequired,
        registration_deadline: eventData.registrationDeadline || null,
        entry_fee: eventData.entryFee || 0,
        status: eventData.status,
        image_url: eventData.imageUrl || '',
        attachments: eventData.attachments || [],
        sevas_attached: eventData.sevasAttached || [],
        contact_person: eventData.contactPerson || '',
        contact_phone: eventData.contactPhone || '',
        contact_email: eventData.contactEmail || '',
        special_instructions: eventData.specialInstructions || '',
        dress_code: eventData.dressCode || '',
        parking_info: eventData.parkingInfo || '',
        facilities: eventData.facilities || [],
        meta_data: eventData.metaData || {}
      }

      const response = await api.put(`/api/v1/entities/${entityId}/events/${eventId}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  /**
   * Delete event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response
   */
  async deleteEvent(entityId, eventId) {
    try {
      const response = await api.delete(`/api/v1/entities/${entityId}/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  /**
   * Toggle event status (active/inactive)
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {string} status - New status ('active' or 'inactive')
   * @returns {Promise} API response
   */
  async toggleEventStatus(entityId, eventId, status) {
    try {
      const response = await api.patch(`/api/v1/entities/${entityId}/events/${eventId}/status`, {
        status
      })
      return response.data
    } catch (error) {
      console.error('Error toggling event status:', error)
      throw error
    }
  }

  // ===== RSVP MANAGEMENT =====

  /**
   * Get event RSVPs
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with RSVP list
   */
  async getEventRSVPs(entityId, eventId, params = {}) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}/rsvps`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          status: params.status || 'all',
          search: params.search || ''
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching event RSVPs:', error)
      throw error
    }
  }

  /**
   * Create/Update RSVP for an event (Devotee action)
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Object} rsvpData - RSVP data
   * @returns {Promise} API response
   */
  async submitRSVP(entityId, eventId, rsvpData) {
    try {
      const payload = {
        status: rsvpData.status, // 'attending', 'not_attending', 'maybe'
        attendee_count: rsvpData.attendeeCount || 1,
        special_requirements: rsvpData.specialRequirements || '',
        dietary_restrictions: rsvpData.dietaryRestrictions || '',
        notes: rsvpData.notes || '',
        family_members: rsvpData.familyMembers || []
      }

      const response = await api.post(`/api/v1/entities/${entityId}/events/${eventId}/rsvp`, payload)
      return response.data
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      throw error
    }
  }

  /**
   * Get devotee's RSVP status for an event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response with RSVP status
   */
  async getMyRSVP(entityId, eventId) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}/my-rsvp`)
      return response.data
    } catch (error) {
      console.error('Error fetching RSVP status:', error)
      throw error
    }
  }

  /**
   * Update RSVP status (Admin action)
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {string} rsvpId - RSVP ID
   * @param {Object} updateData - Update data
   * @returns {Promise} API response
   */
  async updateRSVPStatus(entityId, eventId, rsvpId, updateData) {
    try {
      const response = await api.patch(
        `/api/v1/entities/${entityId}/events/${eventId}/rsvps/${rsvpId}`,
        updateData
      )
      return response.data
    } catch (error) {
      console.error('Error updating RSVP status:', error)
      throw error
    }
  }

  // ===== COMMUNICATION & NOTIFICATIONS =====

  /**
   * Send event notifications to devotees
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Object} notificationData - Notification settings
   * @returns {Promise} API response
   */
  async sendEventNotifications(entityId, eventId, notificationData) {
    try {
      const payload = {
        recipients: notificationData.recipients || 'all', // 'all', 'rsvp_yes', 'rsvp_pending', 'custom'
        custom_devotees: notificationData.customDevotees || [],
        channels: notificationData.channels || ['email'], // ['email', 'sms', 'whatsapp']
        message_type: notificationData.messageType || 'reminder',
        custom_message: notificationData.customMessage || '',
        send_immediately: notificationData.sendImmediately || false,
        scheduled_time: notificationData.scheduledTime || null
      }

      const response = await api.post(
        `/api/v1/entities/${entityId}/events/${eventId}/notifications`,
        payload
      )
      return response.data
    } catch (error) {
      console.error('Error sending event notifications:', error)
      throw error
    }
  }

  /**
   * Get notification history for an event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response with notification history
   */
  async getNotificationHistory(entityId, eventId) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}/notifications`)
      return response.data
    } catch (error) {
      console.error('Error fetching notification history:', error)
      throw error
    }
  }

  // ===== STATISTICS & REPORTS =====

  /**
   * Get event statistics
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response with event stats
   */
  async getEventStats(entityId, eventId) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching event stats:', error)
      throw error
    }
  }

  /**
   * Get events dashboard statistics
   * @param {string} entityId - Temple ID
   * @param {Object} params - Date range and filters
   * @returns {Promise} API response with dashboard stats
   */
  async getEventsDashboardStats(entityId, params = {}) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/dashboard-stats`, {
        params: {
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
          period: params.period || 'month' // 'week', 'month', 'quarter', 'year'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching events dashboard stats:', error)
      throw error
    }
  }

  /**
   * Export events data
   * @param {string} entityId - Temple ID
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export file
   */
  async exportEvents(entityId, params = {}) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/export`, {
        params: {
          format: params.format || 'excel', // 'excel', 'pdf', 'csv'
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
          status: params.status || 'all',
          includeRSVPs: params.includeRSVPs || false
        },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting events:', error)
      throw error
    }
  }

  // ===== CALENDAR INTEGRATION =====

  /**
   * Get events in calendar format
   * @param {string} entityId - Temple ID
   * @param {Object} params - Date range parameters
   * @returns {Promise} API response with calendar events
   */
  async getCalendarEvents(entityId, params = {}) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/calendar`, {
        params: {
          start: params.start || '',
          end: params.end || '',
          view: params.view || 'month' // 'month', 'week', 'day'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  /**
   * Generate event calendar link (Google Calendar, Outlook, etc.)
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {string} provider - Calendar provider ('google', 'outlook', 'apple')
   * @returns {Promise} API response with calendar link
   */
  async generateCalendarLink(entityId, eventId, provider = 'google') {
    try {
      const response = await api.post(
        `/api/v1/entities/${entityId}/events/${eventId}/calendar-link`,
        { provider }
      )
      return response.data
    } catch (error) {
      console.error('Error generating calendar link:', error)
      throw error
    }
  }

  // ===== SEVA INTEGRATION =====

  /**
   * Attach sevas to event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Array} sevaIds - Array of seva IDs to attach
   * @returns {Promise} API response
   */
  async attachSevas(entityId, eventId, sevaIds) {
    try {
      const response = await api.post(
        `/api/v1/entities/${entityId}/events/${eventId}/sevas`,
        { seva_ids: sevaIds }
      )
      return response.data
    } catch (error) {
      console.error('Error attaching sevas to event:', error)
      throw error
    }
  }

  /**
   * Remove sevas from event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @param {Array} sevaIds - Array of seva IDs to remove
   * @returns {Promise} API response
   */
  async detachSevas(entityId, eventId, sevaIds) {
    try {
      const response = await api.delete(`/api/v1/entities/${entityId}/events/${eventId}/sevas`, {
        data: { seva_ids: sevaIds }
      })
      return response.data
    } catch (error) {
      console.error('Error detaching sevas from event:', error)
      throw error
    }
  }

  /**
   * Get attached sevas for an event
   * @param {string} entityId - Temple ID
   * @param {string} eventId - Event ID
   * @returns {Promise} API response with attached sevas
   */
  async getEventSevas(entityId, eventId) {
    try {
      const response = await api.get(`/api/v1/entities/${entityId}/events/${eventId}/sevas`)
      return response.data
    } catch (error) {
      console.error('Error fetching event sevas:', error)
      throw error
    }
  }

  // ===== SEARCH & FILTERS =====

  /**
   * Search events with advanced filters
   * @param {string} entityId - Temple ID
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} API response with search results
   */
  async searchEvents(entityId, searchParams) {
    try {
      const response = await api.post(`/api/v1/entities/${entityId}/events/search`, {
        query: searchParams.query || '',
        filters: {
          categories: searchParams.categories || [],
          dateRange: searchParams.dateRange || null,
          status: searchParams.status || 'all',
          registrationRequired: searchParams.registrationRequired || null,
          hasSevas: searchParams.hasSevas || null,
          priceRange: searchParams.priceRange || null
        },
        sorting: {
          field: searchParams.sortBy || 'event_date',
          order: searchParams.sortOrder || 'asc'
        },
        pagination: {
          page: searchParams.page || 1,
          limit: searchParams.limit || 10
        }
      })
      return response.data
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  }
}

// Export singleton instance
export const eventService = new EventService()
export default eventService