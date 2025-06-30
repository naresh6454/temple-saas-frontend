<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Seva Management</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage seva bookings, approvals, and scheduling for {{ templeName }}
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showCreateForm = true"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Seva
            </button>
            <button
              @click="exportSevas"
              class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="px-6 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Sevas</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search by name, devotee, or type..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="filters.dateRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="archana">Archana</option>
              <option value="abhishekam">Abhishekam</option>
              <option value="homam">Homam</option>
              <option value="pooja">Special Pooja</option>
            </select>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            Showing {{ filteredSevas.length }} of {{ sevas.length }} sevas
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Seva List Component -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <SevaList
          :sevas="filteredSevas"
          :loading="loading"
          @edit="editSeva"
          @approve="approveSeva"
          @reject="rejectSeva"
          @delete="deleteSeva"
          @view-details="viewSevaDetails"
        />
      </div>
    </div>

    <!-- Create/Edit Seva Modal -->
    <div
      v-if="showCreateForm || editingSeva"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingSeva ? 'Edit Seva' : 'Create New Seva' }}
          </h2>
          <button
            @click="closeForm"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <SevaForm
          :seva="editingSeva"
          @save="saveSeva"
          @cancel="closeForm"
        />
      </div>
    </div>

    <!-- Seva Details Modal -->
    <div
      v-if="selectedSeva"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Seva Details</h2>
          <button
            @click="selectedSeva = null"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <SevaCard
          :seva="selectedSeva"
          :show-actions="false"
          class="m-6"
        />
        
        <SevaApproval
          v-if="selectedSeva.status === 'pending'"
          :seva="selectedSeva"
          @approve="approveSeva"
          @reject="rejectSeva"
          class="mx-6 mb-6"
        />
      </div>
    </div>

    <!-- Toast Notifications -->
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="fixed top-4 right-4 z-50 transform transition-all duration-300"
      :class="toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
    >
      <div
        class="px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-sm"
        :class="{
          'bg-green-50 border-green-400 text-green-800': toast.type === 'success',
          'bg-red-50 border-red-400 text-red-800': toast.type === 'error',
          'bg-yellow-50 border-yellow-400 text-yellow-800': toast.type === 'warning',
          'bg-blue-50 border-blue-400 text-blue-800': toast.type === 'info'
        }"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SevaList from '@/components/seva/SevaList.vue'
import SevaForm from '@/components/seva/SevaForm.vue'
import SevaCard from '@/components/seva/SevaCard.vue'
import SevaApproval from '@/components/seva/SevaApproval.vue'

const route = useRoute()
const entityId = route.params.id

// Reactive data
const loading = ref(false)
const showCreateForm = ref(false)
const editingSeva = ref(null)
const selectedSeva = ref(null)
const sevas = ref([])
const templeName = ref('Sri Venkateswara Temple')
const toasts = ref([])

// Filters
const filters = ref({
  search: '',
  status: '',
  dateRange: '',
  type: ''
})

// Mock data - replace with actual API calls
const mockSevas = [
  {
    id: 1,
    name: 'Abhishekam',
    type: 'abhishekam',
    devotee: 'Rajesh Kumar',
    devoteeId: 'D001',
    amount: 500,
    date: '2025-06-20',
    time: '06:00 AM',
    status: 'pending',
    description: 'Special abhishekam for Lord Venkateswara',
    createdAt: '2025-06-16T10:00:00Z',
    phone: '+91 9876543210',
    email: 'rajesh@example.com'
  },
  {
    id: 2,
    name: 'Archana',
    type: 'archana',
    devotee: 'Priya Sharma',
    devoteeId: 'D002',
    amount: 100,
    date: '2025-06-18',
    time: '07:30 AM',
    status: 'approved',
    description: 'Daily archana service',
    createdAt: '2025-06-15T14:30:00Z',
    phone: '+91 9876543211',
    email: 'priya@example.com'
  },
  {
    id: 3,
    name: 'Homam',
    type: 'homam',
    devotee: 'Suresh Reddy',
    devoteeId: 'D003',
    amount: 2500,
    date: '2025-06-25',
    time: '05:00 AM',
    status: 'rejected',
    description: 'Ganapathi Homam for prosperity',
    createdAt: '2025-06-14T09:15:00Z',
    phone: '+91 9876543212',
    email: 'suresh@example.com',
    rejectionReason: 'Date not available due to festival'
  }
]

// Computed properties
const stats = computed(() => {
  const total = sevas.value.length
  const approved = sevas.value.filter(s => s.status === 'approved').length
  const pending = sevas.value.filter(s => s.status === 'pending').length
  const rejected = sevas.value.filter(s => s.status === 'rejected').length
  
  return { total, approved, pending, rejected }
})

const filteredSevas = computed(() => {
  let filtered = sevas.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(seva => 
      seva.name.toLowerCase().includes(search) ||
      seva.devotee.toLowerCase().includes(search) ||
      seva.type.toLowerCase().includes(search) ||
      seva.devoteeId.toLowerCase().includes(search)
    )
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(seva => seva.status === filters.value.status)
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(seva => seva.type === filters.value.type)
  }

  // Date range filter
  if (filters.value.dateRange) {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    switch (filters.value.dateRange) {
      case 'today':
        filtered = filtered.filter(seva => seva.date === todayStr)
        break
      case 'week':
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(seva => {
          const sevaDate = new Date(seva.date)
          return sevaDate >= today && sevaDate <= weekFromNow
        })
        break
      case 'month':
        const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
        filtered = filtered.filter(seva => {
          const sevaDate = new Date(seva.date)
          return sevaDate >= today && sevaDate <= monthFromNow
        })
        break
    }
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Methods
const loadSevas = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    sevas.value = mockSevas
  } catch (error) {
    showToast('Failed to load sevas', 'error')
  } finally {
    loading.value = false
  }
}

const editSeva = (seva) => {
  editingSeva.value = { ...seva }
}

const saveSeva = async (sevaData) => {
  try {
    if (editingSeva.value) {
      // Update existing seva
      const index = sevas.value.findIndex(s => s.id === editingSeva.value.id)
      if (index !== -1) {
        sevas.value[index] = { ...sevaData, id: editingSeva.value.id }
      }
      showToast('Seva updated successfully', 'success')
    } else {
      // Create new seva
      const newSeva = {
        ...sevaData,
        id: Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      sevas.value.unshift(newSeva)
      showToast('Seva created successfully', 'success')
    }
    closeForm()
  } catch (error) {
    showToast('Failed to save seva', 'error')
  }
}

const approveSeva = async (seva) => {
  try {
    const index = sevas.value.findIndex(s => s.id === seva.id)
    if (index !== -1) {
      sevas.value[index].status = 'approved'
      showToast(`Seva "${seva.name}" approved successfully`, 'success')
    }
    selectedSeva.value = null
  } catch (error) {
    showToast('Failed to approve seva', 'error')
  }
}

const rejectSeva = async (seva, reason) => {
  try {
    const index = sevas.value.findIndex(s => s.id === seva.id)
    if (index !== -1) {
      sevas.value[index].status = 'rejected'
      sevas.value[index].rejectionReason = reason
      showToast(`Seva "${seva.name}" rejected`, 'warning')
    }
    selectedSeva.value = null
  } catch (error) {
    showToast('Failed to reject seva', 'error')
  }
}

const deleteSeva = async (seva) => {
  if (confirm(`Are you sure you want to delete the seva "${seva.name}"?`)) {
    try {
      sevas.value = sevas.value.filter(s => s.id !== seva.id)
      showToast('Seva deleted successfully', 'success')
    } catch (error) {
      showToast('Failed to delete seva', 'error')
    }
  }
}

const viewSevaDetails = (seva) => {
  selectedSeva.value = seva
}

const closeForm = () => {
  showCreateForm.value = false
  editingSeva.value = null
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    dateRange: '',
    type: ''
  }
}

const exportSevas = () => {
  // Implement export functionality
  showToast('Export feature coming soon', 'info')
}

const showToast = (message, type = 'info') => {
  const toast = {
    id: Date.now(),
    message,
    type,
    show: false
  }
  
  toasts.value.push(toast)
  
  // Show toast with animation
  setTimeout(() => {
    toast.show = true
  }, 100)
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    toast.show = false
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== toast.id)
    }, 300)
  }, 5000)
}

// Lifecycle
onMounted(() => {
  loadSevas()
})

// Watch filters for real-time filtering
watch(filters, () => {
  // Optionally debounce API calls here
}, { deep: true })
</script>

<style scoped>
/* Additional custom styles if needed */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>