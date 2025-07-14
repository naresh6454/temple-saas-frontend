// src/services/event.service.js
import axios from 'axios';

// Get the API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('temple_auth_token');
};

// Create axios instance with auth headers
const createAuthHeader = () => {
  return {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  };
};

// Create multipart form data header with auth
const createMultipartHeader = () => {
  return {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  };
};

export default {
  /**
   * Get all events
   */
  async getEvents() {
    try {
      const response = await axios.get(`${API_URL}/events`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents() {
    try {
      const response = await axios.get(`${API_URL}/events/upcoming`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  
  /**
   * Get event by ID
   */
  async getEventById(id) {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create new event
   */
  async createEvent(eventData) {
    try {
      // Check if we're dealing with FormData or plain object
      let response;
      if (eventData instanceof FormData) {
        response = await axios.post(`${API_URL}/events`, eventData, createMultipartHeader());
      } else {
        // Format event data for the API
        const apiData = {
          title: eventData.title,
          description: eventData.description || '',
          eventDate: eventData.date && eventData.time ? 
                     this.combineDateTime(eventData.date, eventData.time) : 
                     new Date().toISOString(),
          location: eventData.location || 'Temple Premises',
          maxAttendees: eventData.capacity || 0,
          registrationRequired: !!eventData.rsvpRequired,
          isActive: true
        };
        
        response = await axios.post(`${API_URL}/events`, apiData, createAuthHeader());
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update event
   */
  async updateEvent(id, eventData) {
    try {
      // Check if we're dealing with FormData or plain object
      let response;
      if (eventData instanceof FormData) {
        response = await axios.put(`${API_URL}/events/${id}`, eventData, createMultipartHeader());
      } else {
        // Format event data for the API
        const apiData = {
          title: eventData.title,
          description: eventData.description || '',
          eventDate: eventData.date && eventData.time ? 
                     this.combineDateTime(eventData.date, eventData.time) : 
                     undefined,
          location: eventData.location,
          maxAttendees: eventData.capacity,
          registrationRequired: !!eventData.rsvpRequired,
          isActive: eventData.status !== 'cancelled'
        };
        
        response = await axios.put(`${API_URL}/events/${id}`, apiData, createAuthHeader());
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete event
   */
  async deleteEvent(id) {
    try {
      const response = await axios.delete(`${API_URL}/events/${id}`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Register for an event (RSVP)
   */
  async registerForEvent(eventId) {
    try {
      const response = await axios.post(`${API_URL}/events/${eventId}/rsvp`, {}, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Cancel event registration (RSVP)
   */
  async cancelRegistration(eventId) {
    try {
      const response = await axios.delete(`${API_URL}/events/${eventId}/rsvp`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get event RSVPs
   */
  async getEventRSVPs(eventId) {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}/rsvps`, createAuthHeader());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Helper method to combine date and time into ISO string
   */
  combineDateTime(dateStr, timeStr) {
    try {
      // Format: 2023-09-15 + 14:30 => 2023-09-15T14:30:00Z
      const dateTimeStr = `${dateStr}T${timeStr}:00`;
      return new Date(dateTimeStr).toISOString();
    } catch (e) {
      console.error('Error formatting date/time:', e);
      return new Date().toISOString(); // Fallback to current date/time
    }
  },
  
  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
};