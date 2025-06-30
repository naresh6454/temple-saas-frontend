<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Devotee Management</h1>
          <p class="text-gray-600">Manage your temple's registered devotees</p>
        </div>
        <!-- <div class="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <button class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
          <button class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Devotee
          </button>
        </div> -->
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <!-- Total Devotees -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border-l-4 border-indigo-500">
        <div class="p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-600 mb-1">Total Devotees</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ formatNumber(stats.totalDevotees) }}</p>
              <div class="flex items-center mt-2">
                <svg v-if="stats.devoteeGrowth > 0" class="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <svg v-else-if="stats.devoteeGrowth < 0" class="h-4 w-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
                <span 
                  :class="[
                    'text-sm font-medium',
                    stats.devoteeGrowth > 0 ? 'text-green-600' : 
                    stats.devoteeGrowth < 0 ? 'text-red-600' : 'text-gray-600'
                  ]"
                >
                  {{ stats.devoteeGrowth > 0 ? '+' : '' }}{{ stats.devoteeGrowth }}%
                </span>
                <span class="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>
            <div class="p-3 bg-indigo-100 rounded-lg flex-shrink-0 ml-3">
              <svg class="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Devotees -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500">
        <div class="p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-600 mb-1">Active Devotees</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ formatNumber(stats.activeDevotees) }}</p>
              <div class="mt-3">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${activePercentage}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-600 mt-1 block">{{ activePercentage }}% active rate</span>
              </div>
            </div>
            <div class="p-3 bg-green-100 rounded-lg flex-shrink-0 ml-3">
              <svg class="h-6 w-6 sm:h-7 sm:w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Completion -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500">
        <div class="p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-600 mb-1">Avg. Profile Completion</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ stats.avgProfileCompletion }}%</p>
              <div class="flex items-center mt-3">
                <div class="flex space-x-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'w-2 h-2 rounded-full transition-all duration-300',
                      i <= Math.ceil(stats.avgProfileCompletion / 20) 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200'
                    ]"
                  ></div>
                </div>
                <span class="text-sm text-gray-600 ml-2">completion rate</span>
              </div>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg flex-shrink-0 ml-3">
              <svg class="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border-l-4 border-purple-500">
        <div class="p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ formatNumber(stats.monthlyRegistrations) }}</p>
              <div class="flex items-center mt-3">
                <svg class="h-4 w-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm text-gray-600">new registrations</span>
              </div>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg flex-shrink-0 ml-3">
              <svg class="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Statistics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Demographics Chart -->
      <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Demographics</h3>
          <select
            v-model="selectedDemographic"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="gotra">By Gotra</option>
            <option value="location">By Location</option>
            <option value="age">By Age Group</option>
          </select>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="(item, index) in demographicData" 
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex items-center flex-1 min-w-0">
              <div 
                class="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              ></div>
              <span class="text-sm font-medium text-gray-700 truncate">{{ item.label }}</span>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <span class="text-sm text-gray-600">{{ item.count }}</span>
              <span class="text-xs text-gray-500">({{ item.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div class="space-y-4">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div 
              :class="[
                'p-2 rounded-full flex-shrink-0',
                activity.type === 'registration' ? 'bg-green-100' :
                activity.type === 'profile_update' ? 'bg-blue-100' :
                activity.type === 'seva_booking' ? 'bg-purple-100' : 'bg-gray-100'
              ]"
            >
              <svg 
                v-if="activity.type === 'registration'" 
                class="h-4 w-4 text-green-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              <svg 
                v-else-if="activity.type === 'profile_update'" 
                class="h-4 w-4 text-blue-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              <svg 
                v-else-if="activity.type === 'seva_booking'" 
                class="h-4 w-4 text-purple-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <svg v-else class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatRelativeTime(activity.timestamp) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
            View All Activities →
          </button>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <!-- Engagement Rate -->
        <div class="text-center">
          <div class="relative inline-flex items-center justify-center w-20 h-20 mb-3">
            <svg class="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                class="text-gray-200"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                class="text-indigo-500 transition-all duration-300"
                :stroke-dasharray="`${2 * Math.PI * 32}`"
                :stroke-dashoffset="`${2 * Math.PI * 32 * (1 - stats.engagementRate / 100)}`"
              />
            </svg>
            <span class="absolute text-lg font-bold text-gray-900">{{ stats.engagementRate }}%</span>
          </div>
          <p class="text-sm font-medium text-gray-700">Engagement Rate</p>
          <p class="text-xs text-gray-500">Active in last 30 days</p>
        </div>

        <!-- Retention Rate -->
        <div class="text-center">
          <div class="relative inline-flex items-center justify-center w-20 h-20 mb-3">
            <svg class="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                class="text-gray-200"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                class="text-green-500 transition-all duration-300"
                :stroke-dasharray="`${2 * Math.PI * 32}`"
                :stroke-dashoffset="`${2 * Math.PI * 32 * (1 - stats.retentionRate / 100)}`"
              />
            </svg>
            <span class="absolute text-lg font-bold text-gray-900">{{ stats.retentionRate }}%</span>
          </div>
          <p class="text-sm font-medium text-gray-700">Retention Rate</p>
          <p class="text-xs text-gray-500">6-month retention</p>
        </div>

        <!-- Average Donations -->
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 mb-2">₹{{ formatNumber(stats.avgDonation) }}</div>
          <p class="text-sm font-medium text-gray-700">Avg. Donation</p>
          <p class="text-xs text-gray-500">Per devotee this year</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const selectedDemographic = ref('gotra')

const stats = ref({
  totalDevotees: 2847,
  activeDevotees: 2341,
  avgProfileCompletion: 78,
  monthlyRegistrations: 124,
  devoteeGrowth: 12.5,
  engagementRate: 85,
  retentionRate: 92,
  avgDonation: 2500
})

const demographicData = ref([
  { label: 'Bharadwaja', count: 482, percentage: 16.9, color: '#4F46E5' },
  { label: 'Kashyapa', count: 365, percentage: 12.8, color: '#7C3AED' },
  { label: 'Atri', count: 298, percentage: 10.5, color: '#EC4899' },
  { label: 'Vishwamitra', count: 267, percentage: 9.4, color: '#EF4444' },
  { label: 'Others', count: 1435, percentage: 50.4, color: '#6B7280' }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'registration',
    description: 'New devotee Ravi Kumar registered',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    type: 'profile_update',
    description: 'Priya Sharma completed her family lineage',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    type: 'seva_booking',
    description: 'Suresh Reddy booked Abhisheka seva',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: 4,
    type: 'registration',
    description: 'New devotee Lakshmi Devi registered',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  }
])

// Computed properties
const activePercentage = computed(() => {
  return Math.round((stats.value.activeDevotees / stats.value.totalDevotees) * 100)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num)
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

// Lifecycle
onMounted(() => {
  // Load statistics data
  loadStatistics()
})

const loadStatistics = async () => {
  // This would typically be an API call
  // For now, using mock data
  console.log('Loading devotee statistics...')
}
</script>