<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My Temples</h2>
        <p class="text-gray-600 mt-1">Manage all your temple registrations</p>
      </div>
      <router-link
        to="/tenant/entities/create"
        class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create New Temple
      </router-link>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search temples by name, city..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div class="flex gap-3">
          <select
            v-model="statusFilter"
            class="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            @click="clearFilters"
            class="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTemples.length === 0 && !loading" class="text-center py-12">
      <div class="bg-white rounded-2xl shadow-md p-12 border border-gray-100">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No temples found</h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery || statusFilter ? 'No temples match your search criteria.' : 'Start by creating your first temple.' }}
        </p>
        <router-link
          v-if="!searchQuery && !statusFilter"
          to="/tenant/entities/create"
          class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Temple
        </router-link>
      </div>
    </div>

    <!-- Temple Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TempleCard
        v-for="temple in filteredTemples"
        :key="temple.id"
        :temple="temple"
        @view="handleViewTemple"
        @edit="handleEditTemple"
        @delete="handleDeleteTemple"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <nav class="flex items-center space-x-2">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="[
            'px-3 py-2 rounded-lg transition-all duration-200',
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          ]"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import TempleCard from './TempleCard.vue'

const router = useRouter()
const { showToast } = useToast()

// Reactive data
const temples = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 9

// Mock data - replace with actual API call
const mockTemples = [
  {
    id: 1,
    name: 'Sri Venkateswara Temple',
    location: 'Tirupati, Andhra Pradesh',
    status: 'APPROVED',
    createdAt: '2024-01-15',
    devoteeCount: 1250,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Jagannath Temple',
    location: 'Puri, Odisha',
    status: 'PENDING',
    createdAt: '2024-02-20',
    devoteeCount: 0,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Meenakshi Temple',
    location: 'Madurai, Tamil Nadu',
    status: 'REJECTED',
    createdAt: '2024-01-10',
    devoteeCount: 0,
    rejectionReason: 'Incomplete documentation provided',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop'
  }
]

// Computed properties
const filteredTemples = computed(() => {
  let filtered = temples.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple =>
      temple.name.toLowerCase().includes(query) ||
      temple.location.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(temple => temple.status === statusFilter.value)
  }

  // Paginate
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = temples.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple =>
      temple.name.toLowerCase().includes(query) ||
      temple.location.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(temple => temple.status === statusFilter.value)
  }

  return Math.ceil(filtered.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const loadTemples = async () => {
  try {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    temples.value = mockTemples
  } catch (error) {
    showToast('Failed to load temples', 'error')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

const handleViewTemple = (temple) => {
  if (temple.status === 'APPROVED') {
    router.push(`/entity/${temple.id}/dashboard`)
  } else {
    showToast('Temple must be approved to access dashboard', 'warning')
  }
}

const handleEditTemple = (temple) => {
  router.push(`/tenant/entities/${temple.id}/edit`)
}

const handleDeleteTemple = async (temple) => {
  if (confirm(`Are you sure you want to delete ${temple.name}?`)) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      temples.value = temples.value.filter(t => t.id !== temple.id)
      showToast('Temple deleted successfully', 'success')
    } catch (error) {
      showToast('Failed to delete temple', 'error')
    }
  }
}

// Lifecycle
onMounted(() => {
  loadTemples()
})
</script>