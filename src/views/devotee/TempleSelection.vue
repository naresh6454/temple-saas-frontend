<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
    <!-- Header -->
    <div class="bg-indigo-600">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 font-heading">Find Your Spiritual Home</h1>
          <p class="text-indigo-100 text-base md:text-lg font-light font-sans">
            Begin your spiritual journey by joining an approved temple.
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Section -->
      <div class="bg-white rounded-xl shadow-lg border border-indigo-100 p-5 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label for="search" class="block text-sm font-semibold text-indigo-900 mb-2 font-side">
              Find Your Temple
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by temple name, city, or state..."
                class="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800"
                @input="performSearch"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2 font-side">State</label>
              <select
                v-model="selectedState"
                @change="performSearch"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px] appearance-none"
              >
                <option value="">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2 font-side">Type</label>
              <select
                v-model="selectedCategory"
                @change="performSearch"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px] appearance-none"
              >
                <option value="">All Types</option>
                <option value="Traditional">Traditional</option>
                <option value="Modern">Modern</option>
                <option value="Heritage">Heritage</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
        <p class="text-indigo-600 font-medium mt-4">Discovering sacred spaces...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTemples.length === 0 && !loading" class="text-center py-12 bg-white rounded-xl shadow-lg">
        <div class="max-w-md mx-auto px-6">
          <svg class="h-12 w-12 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="text-xl font-bold text-indigo-900 mb-3 font-heading">No Temples Found</h3>
          <p class="text-indigo-700 mb-6 font-side">
            We couldn't find any temples matching your criteria. Please try different search terms.
          </p>
          <button 
            @click="resetFilters" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Temple Results -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="temple in filteredTemples"
          :key="temple.id"
          class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <!-- Temple Header -->
          <div class="h-28 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
            <div class="bg-white rounded-full p-3 shadow-sm border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>

          <!-- Temple Info -->
          <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 mb-2 font-heading">{{ temple.name }}</h3>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-700 font-side">
                <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ temple.city }}, {{ temple.state }}
              </div>
              
              <div v-if="temple.category" class="flex items-center text-sm text-gray-700 font-side">
                <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="px-2 py-0.5 bg-gray-100 rounded-md text-gray-700 text-xs font-medium">{{ temple.category }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-700 font-side">
                <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <span class="font-medium">{{ temple.devoteeCount }}</span> devotees
              </div>
            </div>

            <!-- Description -->
            <p v-if="temple.description" class="text-sm text-gray-600 mb-4 line-clamp-2 font-side">
              {{ temple.description }}
            </p>

            <!-- Join Button -->
            <button
              @click="joinTemple(temple)"
              :disabled="joiningTemple === temple.id"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
            >
              <div v-if="joiningTemple === temple.id" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Joining...
              </div>
              <span v-else>Join This Temple</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-indigo-900 mb-2 font-heading">Successfully Joined!</h3>
          <p class="text-indigo-700 mb-6 font-side">
            You've successfully joined <strong>{{ selectedTemple?.name }}</strong>! 
            Start building your profile to get the most out of your temple experience.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="goToProfile"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Complete Profile
            </button>
            <button
              @click="goToDashboard"
              class="flex-1 bg-white hover:bg-gray-50 text-indigo-700 font-medium py-2 px-4 rounded-lg border border-indigo-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { showToast } = useToast()
const { user } = useAuth()

// Reactive data
const searchQuery = ref('')
const selectedState = ref('')
const selectedCategory = ref('')
const loading = ref(false)
const joiningTemple = ref(null)
const showSuccessModal = ref(false)
const selectedTemple = ref(null)

// Temple data
const temples = ref([
  {
    id: 1,
    name: 'Sri Venkateswara Temple',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Traditional',
    status: 'approved',
    devoteeCount: 1250,
    description: 'Ancient temple dedicated to Lord Venkateswara with daily sevas and festivals.'
  },
  {
    id: 2,
    name: 'Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    category: 'Heritage',
    status: 'approved',
    devoteeCount: 2300,
    description: 'Historic temple complex known for its architectural beauty and cultural significance.'
  },
  {
    id: 3,
    name: 'Guruvayur Temple',
    city: 'Guruvayur',
    state: 'Kerala',
    category: 'Traditional',
    status: 'approved',
    devoteeCount: 1800,
    description: 'Sacred temple dedicated to Lord Krishna, famous for its spiritual atmosphere.'
  },
  {
    id: 4,
    name: 'Siddhivinayak Temple',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Modern',
    status: 'approved',
    devoteeCount: 3200,
    description: 'Popular temple dedicated to Lord Ganesha with modern facilities and services.'
  },
  {
    id: 5,
    name: 'Tirumala Temple',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    category: 'Heritage',
    status: 'approved',
    devoteeCount: 5000,
    description: 'World-famous temple atop seven hills, dedicated to Lord Venkateswara.'
  },
  {
    id: 6,
    name: 'ISKCON Temple',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Modern',
    status: 'approved',
    devoteeCount: 2800,
    description: 'Beautiful modern temple dedicated to Lord Krishna with stunning architecture.'
  }
])

// Computed
const filteredTemples = computed(() => {
  let filtered = temples.value.filter(temple => temple.status === 'approved')
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple => 
      temple.name.toLowerCase().includes(query) ||
      temple.city.toLowerCase().includes(query) ||
      temple.state.toLowerCase().includes(query)
    )
  }
  
  // State filter
  if (selectedState.value) {
    filtered = filtered.filter(temple => temple.state === selectedState.value)
  }
  
  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(temple => temple.category === selectedCategory.value)
  }
  
  return filtered
})

// Methods
const performSearch = () => {
  loading.value = true
  // Simulate API call delay
  setTimeout(() => {
    loading.value = false
  }, 800)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedState.value = ''
  selectedCategory.value = ''
  performSearch()
}

const joinTemple = async (temple) => {
  joiningTemple.value = temple.id
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    selectedTemple.value = temple
    showSuccessModal.value = true
    
  } catch (error) {
    showToast('Failed to join temple. Please try again.', 'error')
  } finally {
    joiningTemple.value = null
  }
}

const goToProfile = () => {
  showSuccessModal.value = false
  router.push('/devotee/profile/create')
}

const goToDashboard = () => {
  showSuccessModal.value = false
  router.push(`/entity/${selectedTemple.value.id}/devotee/dashboard`)
}

// Lifecycle
onMounted(() => {
  // In real app, fetch temples from API
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

/* Custom font classes */
.font-heading {
  font-family: 'Roboto', sans-serif;
}

.font-side {
  font-family: sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Standard property for future compatibility */
  overflow: hidden;
}

/* Animation for loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>