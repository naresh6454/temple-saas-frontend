<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Select Your Temple</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Search and join an approved temple to start your spiritual journey with us
      </p>
    </div>

    <!-- Search Component -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <TempleSearch 
        :temples="filteredTemples"
        :loading="loading"
        @search="handleSearch"
        @filter-change="handleFilterChange"
      />
    </div>

    <!-- Results Section -->
    <div v-if="!loading">
      <!-- Temple Grid -->
      <div v-if="filteredTemples.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="temple in filteredTemples"
          :key="temple.id"
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <!-- Temple Image -->
          <div class="h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 relative overflow-hidden">
            <img
              v-if="temple.image"
              :src="temple.image"
              :alt="temple.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-2 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <p class="text-indigo-600 font-medium">{{ temple.name }}</p>
              </div>
            </div>
            
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                ✓ Approved
              </span>
            </div>
          </div>

          <!-- Temple Info -->
          <div class="p-6">
            <!-- Temple Name -->
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ temple.name }}</h3>
            
            <!-- Location -->
            <div class="flex items-start text-gray-600 mb-3">
              <MapPinIcon class="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
              <div class="text-sm">
                <p>{{ temple.address }}</p>
                <p>{{ temple.city }}, {{ temple.state }} {{ temple.pincode }}</p>
              </div>
            </div>

            <!-- Contact Info -->
            <div v-if="temple.phone" class="flex items-center text-gray-600 mb-3">
              <PhoneIcon class="h-4 w-4 mr-2" />
              <span class="text-sm">{{ temple.phone }}</span>
            </div>

            <!-- Category -->
            <div v-if="temple.category" class="flex items-center mb-4">
              <span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-lg">
                {{ temple.category }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="temple.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ temple.description }}
            </p>

            <!-- Join Button -->
            <button
              @click="joinTemple(temple)"
              :disabled="joiningTempleId === temple.id"
              class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              <span v-if="joiningTempleId === temple.id" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </span>
              <span v-else>Join This Temple</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <SearchIcon class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Temples Found</h3>
        <p class="text-gray-600 mb-4 max-w-md mx-auto">
          No approved temples match your search criteria. Please try adjusting your search terms or filters.
        </p>
        <button
          @click="clearSearch"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          Reset Search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="h-48 bg-gray-200 animate-pulse"></div>
        <div class="p-6">
          <div class="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
          <div class="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapPinIcon, PhoneIcon, SearchIcon, RefreshCwIcon } from 'lucide-vue-next'
import TempleSearch from './TempleSearch.vue'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

// Router and composables
const router = useRouter()
const { showToast } = useToast()
const { user } = useAuth()

// Reactive data
const loading = ref(false)
const joiningTempleId = ref(null)
const searchQuery = ref('')
const filters = ref({
  state: '',
  district: '',
  category: ''
})

// Mock temple data (replace with API call)
const temples = ref([
  {
    id: 1,
    name: 'Sri Venkateshwara Temple',
    address: '123 Temple Street, Jayanagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560041',
    phone: '+91 98765 43210',
    category: 'Vishnu Temple',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'A beautiful temple dedicated to Lord Venkateshwara, known for its peaceful atmosphere and traditional architecture.'
  },
  {
    id: 2,
    name: 'Mahalakshmi Temple',
    address: '456 Heritage Road, Malleswaram',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560003',
    phone: '+91 98765 43211',
    category: 'Devi Temple',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Ancient temple of Goddess Lakshmi with rich cultural heritage and regular festivals.'
  },
  {
    id: 3,
    name: 'Ganesha Temple',
    address: '789 Main Street, Basavanagudi',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560004',
    phone: '+91 98765 43212',
    category: 'Ganesha Temple',
    status: 'approved',
    description: 'Famous Ganesha temple with a large devotee community and weekly celebrations.'
  },
  {
    id: 4,
    name: 'Shiva Temple',
    address: '321 Temple Complex, Rajajinagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560010',
    phone: '+91 98765 43213',
    category: 'Shiva Temple',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Sacred Shiva temple with meditation halls and spiritual learning programs.'
  },
  {
    id: 5,
    name: 'Hanuman Temple',
    address: '654 Devotion Street, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    phone: '+91 98765 43214',
    category: 'Hanuman Temple',
    status: 'approved',
    description: 'Vibrant Hanuman temple known for its Tuesday prayers and community service.'
  },
  {
    id: 6,
    name: 'Meenakshi Temple',
    address: '987 Culture Street, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    phone: '+91 98765 43215',
    category: 'Devi Temple',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1595941280178-81c5b0ee9097?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Magnificent temple dedicated to Goddess Meenakshi with stunning architecture.'
  }
])

// Computed properties
const filteredTemples = computed(() => {
  let filtered = temples.value.filter(temple => temple.status === 'approved')

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple =>
      temple.name.toLowerCase().includes(query) ||
      temple.city.toLowerCase().includes(query) ||
      temple.state.toLowerCase().includes(query) ||
      temple.address.toLowerCase().includes(query)
    )
  }

  // Apply filters
  if (filters.value.state) {
    filtered = filtered.filter(temple => temple.state === filters.value.state)
  }

  if (filters.value.district) {
    filtered = filtered.filter(temple => temple.city === filters.value.district)
  }

  if (filters.value.category) {
    filtered = filtered.filter(temple => temple.category === filters.value.category)
  }

  return filtered
})

// Methods
const handleSearch = (searchData) => {
  searchQuery.value = searchData.query
  filters.value = { ...searchData.filters }
}

const handleFilterChange = (searchData) => {
  searchQuery.value = searchData.query
  filters.value = { ...searchData.filters }
}

const clearSearch = () => {
  searchQuery.value = ''
  filters.value = {
    state: '',
    district: '',
    category: ''
  }
}

const joinTemple = async (temple) => {
  try {
    joiningTempleId.value = temple.id
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success toast
    showToast({
      type: 'success',
      title: 'Temple Joined Successfully!',
      message: `You've successfully joined ${temple.name}!`
    })

    // Send email notification (simulate)
    console.log(`Email sent: You've joined ${temple.name}! Start building your profile.`)

    // Redirect to profile creation
    router.push({
      name: 'devotee-profile-creation',
      params: { entityId: temple.id }
    })

  } catch (error) {
    console.error('Error joining temple:', error)
    showToast({
      type: 'error',
      title: 'Failed to Join Temple',
      message: 'Please try again later or contact support.'
    })
  } finally {
    joiningTempleId.value = null
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  // Simulate loading temples
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  /* Modern or future support */
  line-clamp: 2;

  overflow: hidden;
}
</style>
