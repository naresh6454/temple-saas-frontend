<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Events & Festivals</h1>
            <p class="mt-1 text-sm text-gray-600">
              Create and manage temple events, festivals, and special occasions
            </p>
          </div>
          <button
            @click="showCreateEventModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Create Event
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ eventStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">{{ eventStats.thisMonth }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total RSVPs</p>
              <p class="text-2xl font-bold text-gray-900">{{ eventStats.totalRSVPs }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Upcoming</p>
              <p class="text-2xl font-bold text-gray-900">{{ eventStats.upcoming }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- View Toggle and Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="currentView = 'list'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              currentView === 'list'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            List View
          </button>
          <button
            @click="currentView = 'calendar'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              currentView === 'calendar'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Calendar View
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <select
            v-model="filters.status"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            v-model="filters.category"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="festival">Festival</option>
            <option value="pooja">Pooja</option>
            <option value="celebration">Celebration</option>
            <option value="workshop">Workshop</option>
          </select>

          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search events..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            >
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <!-- List View -->
        <div v-if="currentView === 'list'">
          <EventList
            :temple-id="templeId"
            :events="filteredEvents"
            :loading="loading"
            @edit="handleEditEvent"
            @delete="handleDeleteEvent"
            @view-rsvp="handleViewRSVP"
            @notify-devotees="handleNotifyDevotees"
          />
        </div>

        <!-- Calendar View -->
        <div v-else-if="currentView === 'calendar'" class="p-6">
          <EventCalendar
            :events="filteredEvents"
            @event-click="handleViewEvent"
            @date-click="handleDateClick"
          />
        </div>
      </div>
    </div>

    <!-- Create/Edit Event Modal -->
    <div
      v-if="showCreateEventModal || showEditEventModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeModals"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <EventForm
          :event="selectedEvent"
          :is-editing="showEditEventModal"
          @save="handleSaveEvent"
          @cancel="closeModals"
        />
      </div>
    </div>

    <!-- RSVP Management Modal -->
    <div
      v-if="showRSVPModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showRSVPModal = false"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <EventRSVP
          :event="selectedEvent"
          @close="showRSVPModal = false"
        />
      </div>
    </div>

    <!-- Notification Modal -->
    <div
      v-if="showNotificationModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showNotificationModal = false"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-lg w-full"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Notify Devotees</h3>
            <button
              @click="showNotificationModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="notificationSettings.sms"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  >
                  <span class="ml-2 text-sm text-gray-700">SMS</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="notificationSettings.whatsapp"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  >
                  <span class="ml-2 text-sm text-gray-700">WhatsApp</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="notificationSettings.email"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  >
                  <span class="ml-2 text-sm text-gray-700">Email</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <textarea
                v-model="notificationMessage"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your message to devotees..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                @click="showNotificationModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                @click="sendNotifications"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Send Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import EventList from '@/components/event/EventList.vue'
import EventCalendar from '@/components/event/EventCalendar.vue'
import EventForm from '@/components/event/EventForm.vue'
import EventRSVP from '@/components/event/EventRSVP.vue'
import { useEventStore } from '@/stores/event'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const eventStore = useEventStore()
const toast = useToast()

// Get templeId from route params or provide a default
const templeId = computed(() => route.params.templeId || route.query.templeId || 'default-temple')

// Reactive data
const loading = ref(false)
const currentView = ref('list')
const showCreateEventModal = ref(false)
const showEditEventModal = ref(false)
const showRSVPModal = ref(false)
const showNotificationModal = ref(false)
const selectedEvent = ref(null)

// Filters
const filters = ref({
  search: '',
  status: '',
  category: ''
})

// Notification settings
const notificationSettings = ref({
  sms: true,
  whatsapp: true,
  email: true
})
const notificationMessage = ref('')

// Mock data for demonstration
const events = ref([
  {
    id: 1,
    title: 'Diwali Celebration',
    description: 'Grand Diwali celebration with special pooja and cultural programs',
    date: '2024-11-01',
    time: '06:00 PM',
    category: 'festival',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rsvpCount: 245,
    sevas: ['Lakshmi Pooja', 'Aarti', 'Prasadam Distribution'],
    location: 'Main Temple Hall'
  },
  {
    id: 2,
    title: 'Weekly Satsang',
    description: 'Weekly spiritual discourse and devotional singing',
    date: '2024-10-28',
    time: '07:00 PM',
    category: 'workshop',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rsvpCount: 89,
    sevas: ['Bhajan', 'Discourse'],
    location: 'Assembly Hall'
  },
  {
    id: 3,
    title: 'Ganesha Chaturthi',
    description: 'Lord Ganesha festival celebration with special rituals',
    date: '2024-09-15',
    time: '05:30 AM',
    category: 'festival',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1567442458633-c60b7ee3e843?w=400',
    rsvpCount: 356,
    sevas: ['Ganesh Pooja', 'Modak Distribution', 'Cultural Programs'],
    location: 'Temple Courtyard'
  }
])

// Computed properties
const eventStats = computed(() => ({
  total: events.value.length,
  thisMonth: events.value.filter(event => {
    const eventDate = new Date(event.date)
    const now = new Date()
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
  }).length,
  totalRSVPs: events.value.reduce((sum, event) => sum + event.rsvpCount, 0),
  upcoming: events.value.filter(event => event.status === 'upcoming').length
}))

const filteredEvents = computed(() => {
  let filtered = events.value

  if (filters.value.search) {
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(event => event.status === filters.value.status)
  }

  if (filters.value.category) {
    filtered = filtered.filter(event => event.category === filters.value.category)
  }

  return filtered
})

// Methods
const handleEditEvent = (event) => {
  selectedEvent.value = { ...event }
  showEditEventModal.value = true
}

const handleDeleteEvent = (eventId) => {
  if (confirm('Are you sure you want to delete this event?')) {
    const index = events.value.findIndex(e => e.id === eventId)
    if (index !== -1) {
      events.value.splice(index, 1)
      toast.success('Event deleted successfully')
    }
  }
}

const handleViewRSVP = (event) => {
  selectedEvent.value = event
  showRSVPModal.value = true
}

const handleNotifyDevotees = (event) => {
  selectedEvent.value = event
  notificationMessage.value = `Reminder: ${event.title} is scheduled for ${event.date} at ${event.time}. Don't miss this special occasion!`
  showNotificationModal.value = true
}

const handleViewEvent = (event) => {
  selectedEvent.value = event
  // Could open a detailed view or edit modal
}

const handleDateClick = (date) => {
  // Create new event for selected date
  selectedEvent.value = {
    date: date.toISOString().split('T')[0],
    time: '06:00 PM'
  }
  showCreateEventModal.value = true
}

const handleSaveEvent = (eventData) => {
  if (showEditEventModal.value) {
    // Update existing event
    const index = events.value.findIndex(e => e.id === eventData.id)
    if (index !== -1) {
      events.value[index] = { ...eventData }
      toast.success('Event updated successfully')
    }
  } else {
    // Create new event
    const newEvent = {
      ...eventData,
      id: Date.now(),
      rsvpCount: 0,
      status: 'upcoming'
    }
    events.value.unshift(newEvent)
    toast.success('Event created successfully')
  }
  closeModals()
}

const sendNotifications = () => {
  const types = []
  if (notificationSettings.value.sms) types.push('SMS')
  if (notificationSettings.value.whatsapp) types.push('WhatsApp')
  if (notificationSettings.value.email) types.push('Email')

  if (types.length === 0) {
    toast.error('Please select at least one notification type')
    return
  }

  if (!notificationMessage.value.trim()) {
    toast.error('Please enter a message')
    return
  }

  // Simulate sending notifications
  toast.success(`Notifications sent via ${types.join(', ')} to ${selectedEvent.value.rsvpCount} devotees`)
  showNotificationModal.value = false
}

const closeModals = () => {
  showCreateEventModal.value = false
  showEditEventModal.value = false
  selectedEvent.value = null
}

onMounted(() => {
  // Load events data
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>