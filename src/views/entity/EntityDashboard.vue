<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Temple Info -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2-16l9-9 9 9"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">{{ templeInfo.name }}</h1>
              <p class="text-sm text-gray-500">{{ templeInfo.location }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
            <button class="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19H3m6 0V5l-6 5m0 9h6"></path>
              </svg>
              <span v-if="notifications.length > 0" class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">{{ notifications.length }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">Welcome back, {{ adminName }}!</h2>
            <p class="text-indigo-100">Here's what's happening at your temple today</p>
          </div>
          <div class="hidden md:block">
            <svg class="h-16 w-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2-16l9-9 9 9"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Registered Devotees -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Registered Devotees</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.devotees.total }}</p>
              <p class="text-xs text-green-600">+{{ stats.devotees.newThisMonth }} this month</p>
            </div>
          </div>
        </div>

        <!-- Seva Bookings Today -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Seva Bookings</p>
              <div class="flex items-baseline space-x-2">
                <p class="text-2xl font-bold text-gray-900">{{ stats.sevas.today }}</p>
                <span class="text-sm text-gray-500">today</span>
              </div>
              <p class="text-xs text-blue-600">{{ stats.sevas.thisMonth }} this month</p>
            </div>
          </div>
        </div>

        <!-- Donations This Month -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Month Donations</p>
              <p class="text-2xl font-bold text-gray-900">₹{{ formatCurrency(stats.donations.thisMonth) }}</p>
              <p class="text-xs text-green-600">+{{ stats.donations.growth }}% from last month</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.events.upcoming }}</p>
              <p class="text-xs text-purple-600">{{ stats.events.thisWeek }} this week</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Recent Activity & Quick Actions -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Recent Notifications -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                <router-link 
                  to="/notifications" 
                  class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="notifications.length === 0" class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z M9 19H3m6 0V5l-6 5m0 9h6"></path>
                </svg>
                <p class="mt-4 text-sm text-gray-500">No new notifications</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="notification in notifications.slice(0, 5)" :key="notification.id" 
                     class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div class="flex-shrink-0">
                    <div :class="getNotificationIconClass(notification.type)" class="h-8 w-8 rounded-full flex items-center justify-center">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getNotificationIconPath(notification.type)"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-sm text-gray-500">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatTimeAgo(notification.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <router-link :to="`/entity/${entityId}/sevas`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Manage Sevas</p>
                    <p class="text-xs text-gray-500">Create and approve sevas</p>
                  </div>
                </router-link>

                <router-link :to="`/entity/${entityId}/events`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Create Event</p>
                    <p class="text-xs text-gray-500">Schedule temple events</p>
                  </div>
                </router-link>

                <router-link :to="`/entity/${entityId}/devotees`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">View Devotees</p>
                    <p class="text-xs text-gray-500">Manage devotee profiles</p>
                  </div>
                </router-link>

                <router-link :to="`/entity/${entityId}/communication`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Send Message</p>
                    <p class="text-xs text-gray-500">Communicate with devotees</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Upcoming Events & Top Donors -->
        <div class="space-y-8">
          <!-- Upcoming Events -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <router-link 
                  :to="`/entity/${entityId}/events`" 
                  class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="upcomingEvents.length === 0" class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="mt-4 text-sm text-gray-500">No upcoming events</p>
                <router-link :to="`/entity/${entityId}/events`" 
                           class="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Create Event
                </router-link>
              </div>
              <div v-else class="space-y-4">
                <div v-for="event in upcomingEvents.slice(0, 3)" :key="event.id" 
                     class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span class="text-xs font-semibold text-purple-600">{{ formatEventDate(event.date) }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                    <p class="text-xs text-gray-500">{{ formatFullDate(event.date) }}</p>
                    <div class="flex items-center mt-1">
                      <span class="text-xs text-green-600">{{ event.rsvpCount }} RSVPs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Donors -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Top Donors</h3>
                <router-link 
                  :to="`/entity/${entityId}/donations`" 
                  class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="topDonors.length === 0" class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <p class="mt-4 text-sm text-gray-500">No donations yet</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="(donor, index) in topDonors.slice(0, 5)" :key="donor.id" 
                     class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span class="text-xs font-bold text-white">{{ index + 1 }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ donor.name }}</p>
                    <p class="text-xs text-gray-500">{{ donor.totalDonations }} donations</p>
                  </div>
                  <div class="text-sm font-semibold text-green-600">
                    ₹{{ formatCurrency(donor.amount) }}
                  </div>
                </div>
              </div>
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

const route = useRoute()
const entityId = computed(() => route.params.id)

// Mock data - replace with actual API calls
const templeInfo = ref({
  name: 'Sri Venkateswara Temple',
  location: 'Bangalore, Karnataka'
})

const adminName = ref('Temple Admin')

const stats = ref({
  devotees: {
    total: 1247,
    newThisMonth: 23
  },
  sevas: {
    today: 8,
    thisMonth: 156
  },
  donations: {
    thisMonth: 85000,
    growth: 12
  },
  events: {
    upcoming: 3,
    thisWeek: 1
  }
})

const notifications = ref([
  {
    id: 1,
    type: 'seva',
    title: 'New Seva Booking',
    message: 'Ramesh Kumar booked Abhishekam for tomorrow',
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    type: 'donation',
    title: 'Donation Received',
    message: 'Anonymous donation of ₹5,000 received',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 3,
    type: 'event',
    title: 'Event RSVP',
    message: '15 new RSVPs for Diwali celebration',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  }
])

const upcomingEvents = ref([
  {
    id: 1,
    title: 'Diwali Celebration',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    rsvpCount: 85
  },
  {
    id: 2,
    title: 'Monthly Abhishekam',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    rsvpCount: 42
  },
  {
    id: 3,
    title: 'Spiritual Discourse',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
    rsvpCount: 67
  }
])

const topDonors = ref([
  {
    id: 1,
    name: 'Rajesh Sharma',
    amount: 25000,
    totalDonations: 12
  },
  {
    id: 2,
    name: 'Priya Devi',
    amount: 18000,
    totalDonations: 8
  },
  {
    id: 3,
    name: 'Anonymous',
    amount: 15000,
    totalDonations: 5
  },
  {
    id: 4,
    name: 'Kumar Family',
    amount: 12000,
    totalDonations: 6
  },
  {
    id: 5,
    name: 'Lakshmi Narayan',
    amount: 10000,
    totalDonations: 4
  }
])

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount)
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

const formatEventDate = (date) => {
  return date.getDate().toString()
}

const formatFullDate = (date) => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const getNotificationIconClass = (type) => {
  const classes = {
    seva: 'bg-orange-100 text-orange-600',
    donation: 'bg-green-100 text-green-600',
    event: 'bg-purple-100 text-purple-600',
    devotee: 'bg-blue-100 text-blue-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getNotificationIconPath = (type) => {
  const paths = {
    seva: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    donation: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
    event: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    devotee: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z'
  }
  return paths[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

onMounted(() => {
  // Load dashboard data
  console.log('EntityDashboard mounted for entity:', entityId.value)
})
</script>