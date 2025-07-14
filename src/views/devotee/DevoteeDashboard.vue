<!-- src/views/devotee/DevoteeDashboard.vue -->
<template>
    <!-- Welcome Banner -->
    <WelcomeBanner 
      :user="currentUser" 
      :temple="currentTemple"
      role="devotee"
      class="mb-8"
      v-if="currentUser && currentTemple"
    />

    <!-- Profile Completion Alert -->
    <div v-if="profileCompletionPercentage < 100" class="mb-6">
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-amber-800">Complete Your Profile</h3>
            <p class="text-sm text-amber-700 mt-1">
              Your profile is {{ profileCompletionPercentage }}% complete. 
              <router-link 
                :to="`/entity/${route.params.id}/devotee/profile/edit`" 
                class="font-medium text-amber-800 hover:text-amber-900 underline"
              >
                Complete now
              </router-link>
            </p>
          </div>
          <div class="ml-4">
            <div class="w-16 h-2 bg-amber-200 rounded-full">
              <div 
                class="h-2 bg-amber-500 rounded-full transition-all duration-300"
                :style="{ width: `${profileCompletionPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Loading dashboard...</span>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardWidget 
          title="Profile Completion"
          :value="`${profileCompletionPercentage}%`"
          icon="user-circle"
          :color="profileCompletionPercentage === 100 ? 'green' : 'amber'"
        />
        <DashboardWidget 
          title="Seva Bookings"
          :value="stats.totalSevaBookings"
          icon="calendar"
          color="indigo"
          :subtitle="`${stats.upcomingSevas} upcoming`"
        />
        <DashboardWidget 
          title="Total Donations"
          :value="`₹${stats.totalDonations.toLocaleString()}`"
          icon="heart"
          color="rose"
          :subtitle="`${stats.donationCount} donations`"
        />
        <DashboardWidget 
          title="Events Attended"
          :value="stats.eventsAttended"
          icon="calendar-days"
          color="emerald"
          :subtitle="`${stats.upcomingEvents} upcoming`"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Upcoming Activities -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Upcoming Sevas -->
          <BaseCard class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Upcoming Sevas</h3>
              <router-link 
                :to="`/entity/${route.params.id}/devotee/seva-booking`"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Book Seva
              </router-link>
            </div>
            
            <div v-if="upcomingSevas && upcomingSevas.length > 0" class="space-y-3">
              <div 
                v-for="seva in upcomingSevas" 
                :key="seva.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ seva.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(seva.date) }} at {{ seva.time }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No upcoming sevas</h3>
              <p class="mt-1 text-sm text-gray-500">Book your first seva to get started.</p>
              <div class="mt-6">
                <router-link 
                  :to="`/entity/${route.params.id}/devotee/seva-booking`"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Book Seva
                </router-link>
              </div>
            </div>
          </BaseCard>

          <!-- Recent Donations -->
          <BaseCard class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Recent Donations</h3>
              <router-link 
                :to="`/entity/${route.params.id}/devotee/donations`"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </router-link>
            </div>
            
            <div v-if="recentDonations && recentDonations.length > 0" class="space-y-3">
              <div 
                v-for="donation in recentDonations" 
                :key="donation.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ donation.purpose }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(donation.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">₹{{ donation.amount.toLocaleString() }}</p>
                  <p class="text-xs text-gray-500">{{ donation.method }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
              <p class="mt-1 text-sm text-gray-500">Make your first donation to support the temple.</p>
              <div class="mt-6">
                <BaseButton 
                  @click="goToDonations"
                  variant="primary"
                  size="sm"
                >
                  Donate Now
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Right Column - Events & Notifications -->
        <div class="space-y-6">
          <!-- Upcoming Events -->
          <BaseCard class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <router-link 
                :to="`/entity/${route.params.id}/devotee/events`"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All</router-link>
            </div>
            
            <div v-if="upcomingEvents && upcomingEvents.length > 0" class="space-y-4">
              <div 
                v-for="event in upcomingEvents" 
                :key="event.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold">{{ formatEventDate(event.date) }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(event.date) }}</p>
                    <div class="mt-2 flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {{ event.attendees }} attending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6">
              <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="mt-2 text-sm text-gray-500">No upcoming events</p>
            </div>
          </BaseCard>

          <!-- Notifications -->
          <BaseCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            
            <div v-if="notifications && notifications.length > 0" class="space-y-3">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.date) }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6">
              <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM5 12V7a5 5 0 0110 0v5l-5 5-5-5z"/>
              </svg>
              <p class="mt-2 text-sm text-gray-500">No new notifications</p>
            </div>
          </BaseCard>

          <!-- Quick Actions -->
          <BaseCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <BaseButton 
                @click="goToDonations"
                variant="primary" 
                class="w-full justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Donate Now
              </BaseButton>
              
              <router-link 
                :to="`/entity/${route.params.id}/devotee/seva-booking`"
                class="inline-flex items-center justify-center w-full px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Book Seva
              </router-link>
              
              <router-link 
                :to="`/entity/${route.params.id}/devotee/profile/edit`"
                class="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Edit Profile
              </router-link>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Quick Donation Modal -->
    <BaseModal 
      v-model="showDonationModal" 
      title="Make a Donation"
      size="md"
      v-if="currentTemple"
    >
      <DonationForm 
        :temple="currentTemple"
        @success="handleDonationSuccess"
        @cancel="showDonationModal = false"
      />
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDevoteeStore } from '@/stores/devotee'
import { useTempleStore } from '@/stores/temple'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import DashboardWidget from '@/components/dashboard/DashboardWidget.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import DonationForm from '@/components/donation/DonationForm.vue'

// Define props to handle the 'id' attribute that's being passed
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const devoteeStore = useDevoteeStore()
const templeStore = useTempleStore()

// Reactive data
const showDonationModal = ref(false)
const loading = ref(true)

// Computed properties with null checks
const currentUser = computed(() => authStore.user)
const currentTemple = computed(() => {
  const temple = templeStore.temples?.find(t => t.id === route.params.id) || templeStore.currentTemple
  return temple
})

const profileCompletionPercentage = computed(() => {
  return devoteeStore.profileCompletionPercentage || 0
})

const stats = computed(() => ({
  totalSevaBookings: devoteeStore.totalSevaBookings || 0,
  upcomingSevas: devoteeStore.upcomingSevas?.length || 0,
  totalDonations: devoteeStore.totalDonations || 0,
  donationCount: devoteeStore.donations?.length || 0,
  eventsAttended: devoteeStore.eventsAttended || 0,
  upcomingEvents: devoteeStore.upcomingEvents?.length || 0
}))

const upcomingSevas = computed(() => {
  return devoteeStore.upcomingSevas?.slice(0, 3) || []
})

const recentDonations = computed(() => {
  return devoteeStore.recentDonations?.slice(0, 3) || []
})

const upcomingEvents = computed(() => {
  return devoteeStore.upcomingEvents?.slice(0, 3) || []
})

const notifications = computed(() => {
  return devoteeStore.notifications?.slice(0, 5) || []
})

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatEventDate = (date) => {
  if (!date) return '?'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric'
    }).format(new Date(date))
  } catch (error) {
    return '?'
  }
}

// Add the navigation method for donations
const goToDonations = () => {
  // Get the temple ID from one of these sources
  const templeId = route.params.id || 
                  route.params.entityId || 
                  (currentTemple.value?.id) || 
                  sessionStorage.getItem('currentTempleId') || 
                  props.id || // Use the id prop if available
                  '1' // Fallback default
  
  // Navigate to the donations page with the proper ID
  router.push({
    name: 'DevoteeDonationHistory',
    params: { id: templeId }
  })
}

const handleDonationSuccess = () => {
  showDonationModal.value = false
  // Refresh data
  devoteeStore.fetchDashboardData?.(route.params.id)
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    
    // Initialize stores if they have data loading methods
    const promises = []
    
    // Determine which ID to use
    const templeId = route.params.id || props.id
    
    if (devoteeStore.fetchDashboardData) {
      promises.push(devoteeStore.fetchDashboardData(templeId))
    }
    
    // Use a different method name that exists in your temple store
    if (templeStore.fetchTemples) {
      promises.push(templeStore.fetchTemples())
    } else if (templeStore.loadTemple) {
      promises.push(templeStore.loadTemple(templeId))
    } else if (templeStore.getTemple) {
      promises.push(templeStore.getTemple(templeId))
    }
    
    await Promise.all(promises)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>