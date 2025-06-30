import api from './api.js'

class VolunteerService {
  constructor() {
    this.baseURL = '/api/volunteers'
    this.entityBaseURL = '/api/entities'
  }

  // Get all volunteers for a specific entity/temple
  async getVolunteersByEntity(entityId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || '',
        joinedFrom: params.joinedFrom || '',
        joinedTo: params.joinedTo || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString()

      const response = await api.get(`${this.entityBaseURL}/${entityId}/volunteers?${queryParams}`)
      return {
        success: true,
        data: response.data.volunteers || [],
        meta: response.data.meta || {},
        message: 'Volunteers fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteers',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer details by ID
  async getVolunteerById(volunteerId) {
    try {
      const response = await api.get(`${this.baseURL}/${volunteerId}`)
      return {
        success: true,
        data: response.data.volunteer,
        message: 'Volunteer details fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer details',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer's temple/entity information
  async getVolunteerEntity(volunteerId) {
    try {
      const response = await api.get(`${this.baseURL}/${volunteerId}/entity`)
      return {
        success: true,
        data: response.data.entity,
        message: 'Volunteer entity details fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer entity',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer assignments/sevas
  async getVolunteerAssignments(volunteerId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status || '',
        dateFrom: params.dateFrom || '',
        dateTo: params.dateTo || '',
        sevaType: params.sevaType || ''
      }).toString()

      const response = await api.get(`${this.baseURL}/${volunteerId}/assignments?${queryParams}`)
      return {
        success: true,
        data: response.data.assignments || [],
        meta: response.data.meta || {},
        message: 'Volunteer assignments fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer assignments',
        error: error.response?.data || error.message
      }
    }
  }

  // Assign volunteer to seva (Entity Admin action)
  async assignVolunteerToSeva(entityId, assignmentData) {
    try {
      const response = await api.post(`${this.entityBaseURL}/${entityId}/volunteer-assignments`, {
        volunteerId: assignmentData.volunteerId,
        sevaId: assignmentData.sevaId,
        assignedDate: assignmentData.assignedDate,
        notes: assignmentData.notes || '',
        priority: assignmentData.priority || 'medium'
      })
      return {
        success: true,
        data: response.data.assignment,
        message: 'Volunteer assigned to seva successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign volunteer to seva',
        error: error.response?.data || error.message
      }
    }
  }

  // Update volunteer assignment status
  async updateAssignmentStatus(assignmentId, status, notes = '') {
    try {
      const response = await api.patch(`${this.baseURL}/assignments/${assignmentId}/status`, {
        status,
        notes
      })
      return {
        success: true,
        data: response.data.assignment,
        message: 'Assignment status updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update assignment status',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer's schedule/calendar
  async getVolunteerSchedule(volunteerId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        month: params.month || new Date().getMonth() + 1,
        year: params.year || new Date().getFullYear(),
        view: params.view || 'month' // month, week, day
      }).toString()

      const response = await api.get(`${this.baseURL}/${volunteerId}/schedule?${queryParams}`)
      return {
        success: true,
        data: response.data.schedule || [],
        meta: response.data.meta || {},
        message: 'Volunteer schedule fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer schedule',
        error: response?.data || error.message
      }
    }
  }

  // Get volunteer's event assignments
  async getVolunteerEvents(volunteerId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        upcoming: params.upcoming || true,
        status: params.status || ''
      }).toString()

      const response = await api.get(`${this.baseURL}/${volunteerId}/events?${queryParams}`)
      return {
        success: true,
        data: response.data.events || [],
        meta: response.data.meta || {},
        message: 'Volunteer events fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer events',
        error: error.response?.data || error.message
      }
    }
  }

  // Update volunteer availability
  async updateVolunteerAvailability(volunteerId, availabilityData) {
    try {
      const response = await api.patch(`${this.baseURL}/${volunteerId}/availability`, availabilityData)
      return {
        success: true,
        data: response.data.volunteer,
        message: 'Volunteer availability updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update volunteer availability',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer statistics for entity admin
  async getVolunteerStats(entityId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        period: params.period || 'month', // week, month, quarter, year
        startDate: params.startDate || '',
        endDate: params.endDate || ''
      }).toString()

      const response = await api.get(`${this.entityBaseURL}/${entityId}/volunteer-stats?${queryParams}`)
      return {
        success: true,
        data: response.data.stats,
        message: 'Volunteer statistics fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer statistics',
        error: error.response?.data || error.message
      }
    }
  }

  // Send notification to volunteers (bulk)
  async sendVolunteerNotification(entityId, notificationData) {
    try {
      const response = await api.post(`${this.entityBaseURL}/${entityId}/volunteer-notifications`, {
        volunteerIds: notificationData.volunteerIds,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info', // info, assignment, event, reminder
        priority: notificationData.priority || 'medium',
        scheduledAt: notificationData.scheduledAt || null
      })
      return {
        success: true,
        data: response.data.notification,
        message: 'Notification sent to volunteers successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send volunteer notification',
        error: error.response?.data || error.message
      }
    }
  }

  // Export volunteer data (for entity admin)
  async exportVolunteers(entityId, format = 'excel', filters = {}) {
    try {
      const response = await api.get(`${this.entityBaseURL}/${entityId}/volunteers/export`, {
        params: {
          format,
          ...filters
        },
        responseType: 'blob'
      })
      
      return {
        success: true,
        data: response.data,
        message: 'Volunteer data exported successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export volunteer data',
        error: error.response?.data || error.message
      }
    }
  }

  // Update volunteer status (activate/deactivate)
  async updateVolunteerStatus(volunteerId, status, reason = '') {
    try {
      const response = await api.patch(`${this.baseURL}/${volunteerId}/status`, {
        status,
        reason
      })
      return {
        success: true,
        data: response.data.volunteer,
        message: `Volunteer ${status} successfully`
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update volunteer status',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer's notification history
  async getVolunteerNotifications(volunteerId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        type: params.type || '',
        read: params.read || '',
        dateFrom: params.dateFrom || '',
        dateTo: params.dateTo || ''
      }).toString()

      const response = await api.get(`${this.baseURL}/${volunteerId}/notifications?${queryParams}`)
      return {
        success: true,
        data: response.data.notifications || [],
        meta: response.data.meta || {},
        message: 'Volunteer notifications fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer notifications',
        error: error.response?.data || error.message
      }
    }
  }

  // Mark volunteer notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`${this.baseURL}/notifications/${notificationId}/read`)
      return {
        success: true,
        data: response.data.notification,
        message: 'Notification marked as read'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
        error: error.response?.data || error.message
      }
    }
  }

  // Get volunteer dashboard data
  async getVolunteerDashboard(volunteerId) {
    try {
      const response = await api.get(`${this.baseURL}/${volunteerId}/dashboard`)
      return {
        success: true,
        data: response.data.dashboard,
        message: 'Volunteer dashboard data fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch volunteer dashboard data',
        error: error.response?.data || error.message
      }
    }
  }
}

export default new VolunteerService()