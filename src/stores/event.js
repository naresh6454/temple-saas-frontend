import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Mock data
  const mockEvents = [
    {
      id: 1,
      title: 'Diwali Celebration 2024',
      description: 'Grand Diwali celebration with special puja, cultural programs, and community feast.',
      category: 'festival',
      date: '2024-11-12',
      startTime: '18:00',
      endTime: '22:00',
      location: 'Main Temple Hall',
      maxAttendees: 500,
      currentAttendees: 245,
      status: 'published',
      image: '/images/events/diwali.jpg',
      organizer: 'Temple Committee',
      rsvpRequired: true,
      rsvpDeadline: '2024-11-10',
      attachedSevas: [1, 2],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Monthly Satsang',
      description: 'Monthly spiritual discourse and bhajan session with renowned saints.',
      category: 'spiritual',
      date: '2024-02-15',
      startTime: '19:00',
      endTime: '21:00',
      location: 'Satsang Hall',
      maxAttendees: 200,
      currentAttendees: 89,
      status: 'published',
      image: '/images/events/satsang.jpg',
      organizer: 'Bhajan Committee',
      rsvpRequired: true,
      rsvpDeadline: '2024-02-13',
      attachedSevas: [],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-25'
    },
    {
      id: 3,
      title: 'Temple Renovation Fundraiser',
      description: 'Special fundraising event for temple renovation with cultural performances.',
      category: 'community',
      date: '2024-03-20',
      startTime: '17:00',
      endTime: '20:00',
      location: 'Temple Courtyard',
      maxAttendees: 300,
      currentAttendees: 156,
      status: 'draft',
      image: '/images/events/fundraiser.jpg',
      organizer: 'Management Committee',
      rsvpRequired: false,
      rsvpDeadline: null,
      attachedSevas: [3],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-30'
    },
    {
      id: 4,
      title: 'Yoga & Meditation Workshop',
      description: 'Weekly yoga and meditation sessions for spiritual wellness.',
      category: 'wellness',
      date: '2024-02-08',
      startTime: '06:00',
      endTime: '07:30',
      location: 'Meditation Hall',
      maxAttendees: 50,
      currentAttendees: 32,
      status: 'published',
      image: '/images/events/yoga.jpg',
      organizer: 'Wellness Committee',
      rsvpRequired: true,
      rsvpDeadline: '2024-02-06',
      attachedSevas: [],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
    }
  ]

  // Getters
  const upcomingEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.value
      .filter(event => event.date >= today && event.status === 'published')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  const pastEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.value
      .filter(event => event.date < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const filteredEvents = computed(() => {
    let filtered = events.value

    // Category filter
    if (filters.value.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.value.category)
    }

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.value.status)
    }

    // Date range filter
    const today = new Date().toISOString().split('T')[0]
    if (filters.value.dateRange === 'upcoming') {
      filtered = filtered.filter(event => event.date >= today)
    } else if (filters.value.dateRange === 'past') {
      filtered = filtered.filter(event => event.date < today)
    }

    // RSVP status filter
    if (filters.value.rsvpStatus !== 'all') {
      if (filters.value.rsvpStatus === 'available') {
        filtered = filtered.filter(event => event.currentAttendees < event.maxAttendees)
      } else if (filters.value.rsvpStatus === 'full') {
        filtered = filtered.filter(event => event.currentAttendees >= event.maxAttendees)
      }
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  const eventStats = computed(() => {
    const published = events.value.filter(e => e.status === 'published')
    const upcoming = upcomingEvents.value
    const totalAttendees = events.value.reduce((sum, e) => sum + e.currentAttendees, 0)
    
    return {
      total: events.value.length,
      published: published.length,
      upcoming: upcoming.length,
      totalAttendees,
      averageAttendance: events.value.length > 0 ? Math.round(totalAttendees / events.value.length) : 0
    }
  })

  const getEventsByCategory = computed(() => {
    const categories = {}
    events.value.forEach(event => {
      if (!categories[event.category]) {
        categories[event.category] = []
      }
      categories[event.category].push(event)
    })
    return categories
  })

  // Actions
  const fetchEvents = async (templeId) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      events.value = mockEvents
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (eventData) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newEvent = {
        ...eventData,
        id: Date.now(),
        currentAttendees: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      events.value.push(newEvent)
      return newEvent
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = {
          ...events.value[index],
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const rsvpToEvent = async (eventId, devoteeId) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const event = events.value.find(e => e.id === eventId)
      if (event && event.currentAttendees < event.maxAttendees) {
        event.currentAttendees += 1
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelRSVP = async (eventId, devoteeId) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const event = events.value.find(e => e.id === eventId)
      if (event && event.currentAttendees > 0) {
        event.currentAttendees -= 1
      }
    } catch (err) {
      error.value = err.message
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
    getEventsByCategory,
    
    // Actions
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpToEvent,
    cancelRSVP,
    setFilters,
    clearFilters,
    setSelectedEvent,
    getEventById
  }
})