import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import eventService from '@/services/event.service'
import { useToast } from '@/composables/useToast' // Assuming you have a toast composable

export const useEventStore = defineStore('event', () => {
  // State
  const events = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedEvent = ref(null)
  const filters = ref({
    category: 'all',
    status: 'all',
    dateRange: 'upcoming',
    rsvpStatus: 'all'
  })
  const toast = useToast()

  // Getters
  const upcomingEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.value
      .filter(event => event.eventDate >= today && event.status !== 'cancelled')
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  })

  const pastEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.value
      .filter(event => event.eventDate < today)
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
  })

  const filteredEvents = computed(() => {
    let filtered = events.value

    // Category filter
    if (filters.value.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.value.category)
    }

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(event => {
        if (filters.value.status === 'upcoming') {
          const today = new Date().toISOString().split('T')[0]
          return event.eventDate >= today
        } else if (filters.value.status === 'past') {
          const today = new Date().toISOString().split('T')[0]
          return event.eventDate < today
        }
        return event.status === filters.value.status
      })
    }

    return filtered.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  })

  const eventStats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const upcoming = events.value.filter(e => e.eventDate >= today)
    
    return {
      total: events.value.length,
      upcoming: upcoming.length,
      thisMonth: events.value.filter(e => {
        const eventDate = new Date(e.eventDate)
        const now = new Date()
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
      }).length,
      totalRSVPs: events.value.reduce((sum, e) => sum + (e.currentAttendees || 0), 0)
    }
  })

  // Actions
  const fetchEvents = async (templeId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await eventService.getEvents()
      events.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch events'
      toast.error(error.value)
      console.error('Error fetching events:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUpcomingEvents = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await eventService.getUpcomingEvents()
      // We might want to update the main events array with this data too
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch upcoming events'
      toast.error(error.value)
      console.error('Error fetching upcoming events:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchEventById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await eventService.getEventById(id)
      selectedEvent.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || `Failed to fetch event with ID: ${id}`
      toast.error(error.value)
      console.error('Error fetching event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (eventData) => {
    loading.value = true
    error.value = null
    
    try {
      // Process the date and time into the format expected by backend
      let dataToSend = eventData
      
      if (!(eventData instanceof FormData)) {
        // Create a new object with the correct structure
        const processedData = {
          title: eventData.title,
          description: eventData.description,
          eventDate: new Date(eventData.date + 'T' + eventData.time),
          location: eventData.location || "Temple Premises",
          maxAttendees: eventData.capacity,
          registrationRequired: !!eventData.rsvpRequired,
          isActive: true
        }
        
        // Create FormData if we have an image to upload
        if (eventData.image) {
          const formData = new FormData()
          formData.append('data', JSON.stringify(processedData))
          formData.append('image', eventData.image)
          dataToSend = formData
        } else {
          dataToSend = processedData
        }
      }
      
      const response = await eventService.createEvent(dataToSend)
      
      // Add the new event to the list
      events.value.push(response.data)
      
      toast.success('Event created successfully')
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create event'
      toast.error(error.value)
      console.error('Error creating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      // Process the date and time into the format expected by backend
      let dataToSend = updates
      
      if (!(updates instanceof FormData)) {
        // Create a new object with the correct structure
        const processedData = {
          title: updates.title,
          description: updates.description,
          eventDate: updates.date && updates.time ? 
                    new Date(updates.date + 'T' + updates.time) : undefined,
          location: updates.location,
          maxAttendees: updates.capacity,
          registrationRequired: !!updates.rsvpRequired,
          isActive: updates.status !== 'cancelled'
        }
        
        // Create FormData if we have an image to upload
        if (updates.image) {
          const formData = new FormData()
          formData.append('data', JSON.stringify(processedData))
          formData.append('image', updates.image)
          dataToSend = formData
        } else {
          dataToSend = processedData
        }
      }
      
      const response = await eventService.updateEvent(id, dataToSend)
      
      // Update the event in the list
      const index = events.value.findIndex(e => e.id === Number(id))
      if (index !== -1) {
        events.value[index] = response.data
      }
      
      toast.success('Event updated successfully')
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || `Failed to update event with ID: ${id}`
      toast.error(error.value)
      console.error('Error updating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await eventService.deleteEvent(id)
      
      // Remove event from the list
      events.value = events.value.filter(e => e.id !== Number(id))
      
      toast.success('Event deleted successfully')
    } catch (err) {
      error.value = err.response?.data?.error || `Failed to delete event with ID: ${id}`
      toast.error(error.value)
      console.error('Error deleting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      category: 'all',
      status: 'all',
      dateRange: 'upcoming',
      rsvpStatus: 'all'
    }
  }

  const setSelectedEvent = (event) => {
    selectedEvent.value = event
  }

  const getEventById = (id) => {
    return events.value.find(event => event.id === id)
  }

  return {
    // State
    events,
    loading,
    error,
    selectedEvent,
    filters,
    
    // Getters
    upcomingEvents,
    pastEvents,
    filteredEvents,
    eventStats,
    
    // Actions
    fetchEvents,
    fetchUpcomingEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    setFilters,
    clearFilters,
    setSelectedEvent,
    getEventById
  }
})