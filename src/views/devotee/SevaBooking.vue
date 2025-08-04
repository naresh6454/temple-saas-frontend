<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Book Seva</h1>
              <p class="mt-2 text-sm text-gray-600">Choose from available sevas and book your preferred time slots</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-sm text-gray-500">Current Temple</p>
                <p class="font-semibold text-indigo-600">{{ templeInfo.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters and Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Search Sevas</label>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by seva name..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
      <select
        v-model="selectedCategory"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="">Select Seva Type</option>
        <option value="daily">Daily Seva</option>
        <option value="special">Special Seva</option>
        <option value="festival">Festival Seva</option>
        <option value="personal">Personal Seva</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
      <select
        v-model="priceRange"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="">All Prices</option>
        <option value="0-500">₹0 - ₹500</option>
        <option value="500-1000">₹500 - ₹1,000</option>
        <option value="1000-5000">₹1,000 - ₹5,000</option>
        <option value="5000+">₹5,000+</option>
      </select>
    </div>
  </div>
</div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- No Sevas Available -->
      <div v-else-if="filteredSevas.length === 0" class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Sevas Available</h3>
        <p class="text-gray-500 mb-4">No sevas match your current filters or none have been added by the temple yet.</p>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <!-- Seva Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="seva in filteredSevas"
          :key="seva.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Seva Image -->
          <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
            <img
              v-if="seva.image"
              :src="seva.image"
              :alt="seva.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
            <div class="absolute top-4 right-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  seva.seva_type === 'daily' ? 'bg-green-100 text-green-800' :
                  seva.seva_type === 'special' ? 'bg-blue-100 text-blue-800' :
                  seva.seva_type === 'festival' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ seva.seva_type }}
              </span>
            </div>
          </div>

          <!-- Seva Content -->
          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ seva.name }}</h3>
              <div class="text-right">
                <p class="text-xl font-bold text-indigo-600">₹{{ seva.price.toLocaleString() }}</p>
                <p v-if="seva.originalPrice && seva.originalPrice > seva.price" class="text-sm text-gray-500 line-through">
                  ₹{{ seva.originalPrice.toLocaleString() }}
                </p>
              </div>
            </div>

            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ seva.description }}</p>

            <!-- Seva Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Duration: {{ seva.duration }} minutes
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Available: {{ seva.max_bookings_per_day - (bookingCounts[seva.id] || 0) }} slots
              </div>
              <div v-if="seva.date" class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Date: {{ formatDate(seva.date) }}
              </div>
              <div v-if="seva.start_time && seva.end_time" class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Time: {{ seva.start_time }} - {{ seva.end_time }}
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="openBookingModal(seva)"
              :disabled="(seva.max_bookings_per_day - (bookingCounts[seva.id] || 0)) === 0"
              :class="[
                'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                (seva.max_bookings_per_day - (bookingCounts[seva.id] || 0)) > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              {{ (seva.max_bookings_per_day - (bookingCounts[seva.id] || 0)) > 0 ? 'Book Now' : 'Fully Booked' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div
      v-if="showBookingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeBookingModal"
    >
      <div
        class="bg-white rounded-xl max-w-md w-full p-6"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Book {{ selectedSeva.name }}</h3>
          <button
            @click="closeBookingModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="bookSeva" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
            <input
              v-model="bookingForm.booking_date"
              type="date"
              :min="today"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
            <select
              v-model="bookingForm.booking_time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select time slot</option>
              <option v-for="slot in availableTimeSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
            <textarea
              v-model="bookingForm.special_requests"
              rows="3"
              placeholder="Any special requests or notes..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            ></textarea>
          </div>

          <!-- Price Summary -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-900">Total Amount:</span>
              <span class="text-xl font-bold text-indigo-600">₹{{ selectedSeva.price?.toLocaleString() }}</span>
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeBookingModal"
              class="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="bookingLoading"
              class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {{ bookingLoading ? 'Booking...' : 'Confirm Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSevaStore } from '@/stores/seva'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const sevaStore = useSevaStore()
const toast = useToast()

// Reactive data
const loading = ref(true)
const bookingLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedDate = ref('')
const priceRange = ref('')
const showBookingModal = ref(false)
const selectedSeva = ref({})
const bookingCounts = ref({}) // To track available slots

// Temple info
const templeInfo = ref({
  name: 'Temple Name',
  location: 'Location'
})

// Booking form
const bookingForm = ref({
  seva_id: null,
  booking_date: '',
  booking_time: '',
  special_requests: '',
  amount_paid: 0,
  payment_status: 'pending'
})

// Available time slots - This could be fetched from the backend based on selected seva
const availableTimeSlots = ref([
  '6:00 AM',
  '7:00 AM',
  '10:00 AM',
  '6:00 PM',
  '7:00 PM'
])

// Computed properties
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const filteredSevas = computed(() => {
  let filtered = sevaStore.sevas
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(seva =>
      seva.name?.toLowerCase().includes(query) ||
      seva.description?.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(seva => seva.seva_type === selectedCategory.value)
  }
  
  if (priceRange.value) {
    filtered = filtered.filter(seva => {
      const price = seva.price
      switch (priceRange.value) {
        case '0-500': return price <= 500
        case '500-1000': return price > 500 && price <= 1000
        case '1000-5000': return price > 1000 && price <= 5000
        case '5000+': return price > 5000
        default: return true
      }
    })
  }
  
  return filtered
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  // Format: YYYY-MM-DD to DD MMM YYYY
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedDate.value = ''
  priceRange.value = ''
}

const openBookingModal = (seva) => {
  selectedSeva.value = seva
  bookingForm.value = {
    seva_id: seva.id,
    booking_date: today.value,
    booking_time: '',
    special_requests: '',
    amount_paid: seva.price,
    payment_status: 'pending'
  }
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedSeva.value = {}
}

const bookSeva = async () => {
  bookingLoading.value = true
  
  try {
    // Format the request payload to match backend expectations
    const payload = {
      seva_id: selectedSeva.value.id,
      booking_date: bookingForm.value.booking_date,
      booking_time: bookingForm.value.booking_time,
      special_requests: bookingForm.value.special_requests,
      amount_paid: selectedSeva.value.price,
      payment_status: 'pending'
    }
    
    // Call the API through the store
    const response = await fetch('/api/v1/sevas/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      toast.success('Seva booked successfully!')
      closeBookingModal()
      
      // Optionally refresh the sevas to update available slots
      fetchSevas()
      
      // Optionally redirect to booking history or dashboard
      // router.push(`/entity/${route.params.id}/devotee/dashboard`)
    } else {
      toast.error(data.error || 'Failed to book seva')
    }
  } catch (error) {
    console.error('Booking failed:', error)
    toast.error('Booking failed. Please try again.')
  } finally {
    bookingLoading.value = false
  }
}

const fetchSevas = async () => {
  loading.value = true
  try {
    // Apply current filters when fetching
    const params = {
      search: searchQuery.value,
      seva_type: selectedCategory.value
    }
    
    await sevaStore.fetchSevas(params)
    
    // Only update booking counts if sevas were loaded successfully
    if (sevaStore.sevas.length > 0) {
      sevaStore.sevas.forEach(seva => {
        bookingCounts.value[seva.id] = Math.floor(Math.random() * seva.max_bookings_per_day)
      })
    }
    
  } catch (error) {
    console.error('Failed to load sevas:', error)
    
    // Display more specific error message
    if (error.includes('Availability: unsupported relations')) {
      toast.error('Database schema issue. Please contact the administrator.')
    } else {
      toast.error('Failed to load sevas. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchSevas()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  /* Future standard support */
  line-clamp: 2;

  overflow: hidden;
}
</style>