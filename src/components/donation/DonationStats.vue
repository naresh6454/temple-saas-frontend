<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900">Donation Statistics</h3>
          <p class="text-sm text-gray-500">{{ currentPeriod }} overview</p>
        </div>
      </div>
      
      <!-- Period Selector -->
      <div class="flex bg-gray-100 rounded-xl p-1">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            selectedPeriod === period.value
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Donations -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-700">Total Donations</p>
            <p class="text-2xl font-bold text-green-900">₹{{ formatCurrency(stats.totalAmount) }}</p>
            <div class="flex items-center gap-1 mt-2">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-green-600 font-medium">+{{ stats.totalGrowth }}%</span>
            </div>
          </div>
          <div class="p-3 bg-green-200 rounded-xl">
            <svg class="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Donors -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-700">Total Donors</p>
            <p class="text-2xl font-bold text-blue-900">{{ stats.totalDonors }}</p>
            <div class="flex items-center gap-1 mt-2">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-blue-600 font-medium">+{{ stats.donorGrowth }}%</span>
            </div>
          </div>
          <div class="p-3 bg-blue-200 rounded-xl">
            <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Average Donation -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-700">Average Donation</p>
            <p class="text-2xl font-bold text-purple-900">₹{{ formatCurrency(stats.averageDonation) }}</p>
            <div class="flex items-center gap-1 mt-2">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-purple-600 font-medium">+{{ stats.avgGrowth }}%</span>
            </div>
          </div>
          <div class="p-3 bg-purple-200 rounded-xl">
            <svg class="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Pending Receipts -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-700">Pending Receipts</p>
            <p class="text-2xl font-bold text-orange-900">{{ stats.pendingReceipts }}</p>
            <div class="flex items-center gap-1 mt-2">
              <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-orange-600 font-medium">Needs attention</span>
            </div>
          </div>
          <div class="p-3 bg-orange-200 rounded-xl">
            <svg class="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Donors Section -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold text-gray-900">Top Donors This {{ currentPeriod }}</h4>
        <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
          View All
        </button>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="(donor, index) in stats.topDonors"
          :key="donor.id"
          class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-sm">
              {{ index + 1 }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ donor.name }}</p>
              <p class="text-sm text-gray-500">{{ donor.donationCount }} donations</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-gray-900">₹{{ formatCurrency(donor.totalAmount) }}</p>
            <p class="text-sm text-gray-500">Average: ₹{{ formatCurrency(donor.averageAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3 mt-6">
      <button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-md">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report
      </button>
      <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors duration-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2h-4" />
        </svg>
        Generate Receipts
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  entityId: {
    type: String,
    required: true
  },
  refreshTrigger: {
    type: Number,
    default: 0
  }
})

// Reactive data
const selectedPeriod = ref('month')
const stats = ref({
  totalAmount: 0,
  totalGrowth: 0,
  totalDonors: 0,
  donorGrowth: 0,
  averageDonation: 0,
  avgGrowth: 0,
  pendingReceipts: 0,
  topDonors: []
})

// Constants
const periods = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' }
]

// Computed
const currentPeriod = computed(() => {
  return periods.find(p => p.value === selectedPeriod.value)?.label || 'Month'
})

// Methods
const formatCurrency = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return (amount / 10000000).toFixed(1) + 'Cr'
  } else if (amount >= 100000) { // 1 lakh
    return (amount / 100000).toFixed(1) + 'L'
  } else if (amount >= 1000) { // 1 thousand
    return (amount / 1000).toFixed(1) + 'K'
  }
  return amount.toLocaleString('en-IN')
}

const fetchStats = async () => {
  try {
    // Mock data - replace with actual API call
    stats.value = {
      totalAmount: 2450000,
      totalGrowth: 12.5,
      totalDonors: 345,
      donorGrowth: 8.3,
      averageDonation: 7100,
      avgGrowth: 5.7,
      pendingReceipts: 23,
      topDonors: [
        {
          id: 1,
          name: 'Rajesh Kumar',
          totalAmount: 150000,
          donationCount: 12,
          averageAmount: 12500
        },
        {
          id: 2,
          name: 'Priya Singh',
          totalAmount: 125000,
          donationCount: 8,
          averageAmount: 15625
        },
        {
          id: 3,
          name: 'Amit Sharma',
          totalAmount: 100000,
          donationCount: 15,
          averageAmount: 6667
        },
        {
          id: 4,
          name: 'Sunita Patel',
          totalAmount: 85000,
          donationCount: 6,
          averageAmount: 14167
        },
        {
          id: 5,
          name: 'Vikram Reddy',
          totalAmount: 75000,
          donationCount: 10,
          averageAmount: 7500
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching donation stats:', error)
  }
}

// Watchers
watch(selectedPeriod, () => {
  fetchStats()
})

watch(() => props.refreshTrigger, () => {
  fetchStats()
})

// Lifecycle
onMounted(() => {
  fetchStats()
})
</script>