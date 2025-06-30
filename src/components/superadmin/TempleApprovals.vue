<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Temple Approvals</h2>
        <p class="text-gray-600">Review and manage temple registration requests</p>
      </div>
      <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
        <!-- Filter Dropdown -->
        <select 
          v-model="selectedStatus" 
          @change="filterTemples"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="filterTemples"
            type="text"
            placeholder="Search temples..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-yellow-800">Pending</p>
            <p class="text-2xl font-bold text-yellow-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-green-800">Approved</p>
            <p class="text-2xl font-bold text-green-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 rounded-lg p-4 border border-red-200">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-red-800">Rejected</p>
            <p class="text-2xl font-bold text-red-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>

      <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
        <div class="flex items-center">
          <div class="p-2 bg-indigo-100 rounded-lg">
            <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-indigo-800">Total</p>
            <p class="text-2xl font-bold text-indigo-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTemples.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No temples found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Try adjusting your search terms' : 'No temple registrations match your current filter' }}
      </p>
    </div>

    <!-- Temple Cards -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="temple in filteredTemples"
        :key="temple.id"
        class="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        <!-- Temple Header -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ temple.name }}</h3>
              <p class="text-sm text-gray-600 flex items-center">
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ temple.city }}, {{ temple.state }}
              </p>
            </div>
            <span 
              :class="getStatusBadgeClass(temple.status)"
              class="px-3 py-1 rounded-full text-xs font-medium"
            >
              {{ temple.status.charAt(0).toUpperCase() + temple.status.slice(1) }}
            </span>
          </div>

          <!-- Temple Details -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium">Admin:</span>
              <span class="ml-1">{{ temple.adminName }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{{ temple.email }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ temple.phone }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-4zM9 11h6" />
              </svg>
              <span>{{ formatDate(temple.submittedAt) }}</span>
            </div>
          </div>

          <!-- Rejection Note (if any) -->
          <div v-if="temple.status === 'rejected' && temple.rejectionNote" class="mb-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p class="text-sm text-red-700">{{ temple.rejectionNote }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              @click="viewTempleDetails(temple)"
              class="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-sm font-medium"
            >
              View Details
            </button>
            
            <button
              v-if="temple.status === 'pending'"
              @click="approveTemple(temple)"
              :disabled="processingId === temple.id"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            >
              <span v-if="processingId === temple.id" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Approve</span>
            </button>
            
            <button
              v-if="temple.status === 'pending'"
              @click="rejectTemple(temple)"
              :disabled="processingId === temple.id"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rejection Modal -->
  <div v-if="showRejectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Reject Temple Registration</h3>
      <p class="text-sm text-gray-600 mb-4">
        Please provide a reason for rejecting <strong>{{ selectedTemple?.name }}</strong>'s registration:
      </p>
      
      <textarea
        v-model="rejectionNote"
        placeholder="Enter rejection reason..."
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
      ></textarea>
      
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="closeRejectionModal"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          @click="confirmRejection"
          :disabled="!rejectionNote.trim() || processingId === selectedTemple?.id"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span v-if="processingId === selectedTemple?.id">Processing...</span>
          <span v-else>Reject Temple</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Temple Details Modal -->
  <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Temple Details</h3>
          <button
            @click="closeDetailsModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedTemple" class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Temple Name</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.adminName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Address</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.address }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.city }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.state }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <p class="text-sm text-gray-900">{{ selectedTemple.pincode }}</p>
              </div>
            </div>
          </div>

          <!-- Documents -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Submitted Documents</h4>
            <div class="space-y-2">
              <div v-for="doc in selectedTemple.documents" :key="doc.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-900">{{ doc.name }}</span>
                </div>
                <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>

          <!-- Status History -->
          <div v-if="selectedTemple.statusHistory?.length">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Status History</h4>
            <div class="space-y-2">
              <div v-for="history in selectedTemple.statusHistory" :key="history.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ history.status }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(history.date) }}</p>
                </div>
                <span v-if="history.note" class="text-xs text-gray-600">{{ history.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// State
const loading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('all')
const processingId = ref(null)
const showRejectionModal = ref(false)
const showDetailsModal = ref(false)
const selectedTemple = ref(null)
const rejectionNote = ref('')

// Mock data - replace with actual API calls
const temples = ref([
  {
    id: 1,
    name: 'Sri Venkateshwara Temple',
    adminName: 'Ramesh Kumar',
    email: 'ramesh@svtemple.com',
    phone: '+91 98765 43210',
    address: '123 Temple Street, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    status: 'pending',
    submittedAt: '2024-12-15T10:30:00Z',
    documents: [
      { id: 1, name: 'Temple Registration Certificate', type: 'pdf' },
      { id: 2, name: 'Trust Deed', type: 'pdf' },
      { id: 3, name: 'Tax Exemption Certificate', type: 'pdf' }
    ],
    statusHistory: [
      { id: 1, status: 'Submitted', date: '2024-12-15T10:30:00Z', note: 'Initial submission' }
    ]
  },
  {
    id: 2,
    name: 'Hanuman Mandir',
    adminName: 'Suresh Patel',
    email: 'suresh@hanuman.org',
    phone: '+91 87654 32109',
    address: '456 Mandir Road, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    status: 'approved',
    submittedAt: '2024-12-10T14:20:00Z',
    documents: [
      { id: 3, name: 'Temple Registration Certificate', type: 'pdf' },
      { id: 4, name: 'Trust Deed', type: 'pdf' }
    ],
    statusHistory: [
      { id: 2, status: 'Submitted', date: '2024-12-10T14:20:00Z', note: 'Initial submission' },
      { id: 3, status: 'Approved', date: '2024-12-12T09:15:00Z', note: 'All documents verified' }
    ]
  },
  {
    id: 3,
    name: 'Lakshmi Narasimha Temple',
    adminName: 'Govind Rao',
    email: 'govind@lntemple.in',
    phone: '+91 76543 21098',
    address: '789 Temple Circle, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560041',
    status: 'rejected',
    submittedAt: '2024-12-08T16:45:00Z',
    rejectionNote: 'Incomplete documentation. Please submit valid trust deed and tax exemption certificate.',
    documents: [
      { id: 5, name: 'Temple Registration Certificate', type: 'pdf' }
    ],
    statusHistory: [
      { id: 4, status: 'Submitted', date: '2024-12-08T16:45:00Z', note: 'Initial submission' },
      { id: 5, status: 'Rejected', date: '2024-12-11T11:30:00Z', note: 'Incomplete documentation' }
    ]
  }
])

// Computed
const filteredTemples = computed(() => {
  let filtered = temples.value

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(temple => temple.status === selectedStatus.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple => 
      temple.name.toLowerCase().includes(query) ||
      temple.adminName.toLowerCase().includes(query) ||
      temple.city.toLowerCase().includes(query) ||
      temple.state.toLowerCase().includes(query)
    )
  }

  return filtered
})

const stats = computed(() => {
  return {
    pending: temples.value.filter(t => t.status === 'pending').length,
    approved: temples.value.filter(t => t.status === 'approved').length,
    rejected: temples.value.filter(t => t.status === 'rejected').length,
    total: temples.value.length
  }
})

// Methods
const filterTemples = () => {
  // Trigger reactive update
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    approved: 'bg-green-100 text-green-800 border border-green-200',
    rejected: 'bg-red-100 text-red-800 border border-red-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewTempleDetails = (temple) => {
  selectedTemple.value = temple
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedTemple.value = null
}

const approveTemple = async (temple) => {
  processingId.value = temple.id
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update temple status
    const templeIndex = temples.value.findIndex(t => t.id === temple.id)
    if (templeIndex !== -1) {
      temples.value[templeIndex].status = 'approved'
      temples.value[templeIndex].statusHistory.push({
        id: Date.now(),
        status: 'Approved',
        date: new Date().toISOString(),
        note: 'Approved by Super Admin'
      })
    }
    
    // Show success toast (assuming toast composable exists)
    console.log(`Temple "${temple.name}" approved successfully`)
    
  } catch (error) {
    console.error('Error approving temple:', error)
  } finally {
    processingId.value = null
  }
}

const rejectTemple = (temple) => {
  selectedTemple.value = temple
  showRejectionModal.value = true
}

const closeRejectionModal = () => {
  showRejectionModal.value = false
  selectedTemple.value = null
  rejectionNote.value = ''
}

const confirmRejection = async () => {
  if (!rejectionNote.value.trim() || !selectedTemple.value) return
  
  processingId.value = selectedTemple.value.id
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update temple status
    const templeIndex = temples.value.findIndex(t => t.id === selectedTemple.value.id)
    if (templeIndex !== -1) {
      temples.value[templeIndex].status = 'rejected'
      temples.value[templeIndex].rejectionNote = rejectionNote.value
      temples.value[templeIndex].statusHistory.push({
        id: Date.now(),
        status: 'Rejected',
        date: new Date().toISOString(),
        note: rejectionNote.value
      })
    }
    
    // Show success toast
    console.log(`Temple "${selectedTemple.value.name}" rejected successfully`)
    
    // Close modal
    closeRejectionModal()
    
  } catch (error) {
    console.error('Error rejecting temple:', error)
  } finally {
    processingId.value = null
  }
}

// Lifecycle
onMounted(async () => {
  // Simulate loading data
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
});
</script>