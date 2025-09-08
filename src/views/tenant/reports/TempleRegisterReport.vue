<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back to SuperAdmin Reports button (when viewed from superadmin) -->
    <div v-if="fromSuperadmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <router-link 
        to="/superadmin/reports" 
        class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to SuperAdmin Reports
      </router-link>
    </div>
    
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Temple Register Report</h1>
            <p class="text-gray-600 mt-1">
              Download registration data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants Selected)
              </span>
              <span v-else-if="tenantId" class="text-indigo-600 font-medium">
                (Tenant ID: {{ tenantId }})
              </span>
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
              <span class="text-indigo-800 font-medium">{{ userStore.user?.name || 'Tenant User' }}</span>
              <span class="text-indigo-600 text-sm ml-2">{{ fromSuperadmin ? '(Super Admin)' : '(Tenant)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Temple Register</h3>
          <p class="text-gray-600 mt-1">Configure filters and download your temple registration data</p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Select Temple</label>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                @change="onTempleChange"
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Temples</option>
                <option v-for="temple in filteredTemples" :key="temple.id" :value="temple.id">
                  {{ temple.name }}
                </option>
              </select>
            </div>
            <div v-if="debugMode" class="mt-2 text-xs text-gray-500">
              Found {{ filteredTemples.length }} temples for tenant(s): {{ tenantIds.join(', ') }}
            </div>
          </div>

          <!-- Filter Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Registration Date Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Registration Date</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.value"
                  @click="setActiveFilter(filter.value)"
                  :disabled="isDownloading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeFilter === filter.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <!-- Temple Status Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Temple Status</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="status in statusFilters" 
                  :key="status.value"
                  @click="setActiveStatus(status.value)"
                  :disabled="isDownloading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeStatus === status.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Date Range (shown only when custom date range is selected) -->
          <div v-if="activeFilter === 'custom'" class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                <input 
                  type="date" 
                  v-model="startDate"
                  :disabled="isDownloading"
                  :max="endDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  :disabled="isDownloading"
                  :min="startDate"
                  :max="today"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Download Section -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="mb-4 md:mb-0">
                <h4 class="text-lg font-medium text-gray-900">Download Report</h4>
                <p class="text-sm text-gray-600">Select a format and click download</p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- Format Selection -->
                <div class="relative">
                  <select 
                    v-model="selectedFormat" 
                    :disabled="isDownloading"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>

                <!-- Download Button -->
                <button 
                  @click="downloadReport"
                  :disabled="isDownloading || !isFormValid"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ isDownloading ? 'Downloading...' : 'Download' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Applied Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Applied Filters</h3>
          
          <div class="flex flex-wrap gap-2">
            <!-- Tenant Filter (only in superadmin view with multiple tenants) -->
            <div v-if="fromSuperadmin && tenantIds.length > 1" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Tenants:</span>
              {{ tenantIds.length }} selected
            </div>
            
            <!-- Temple Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            
            <!-- Registration Date Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom' && startDate && endDate">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>
            
            <!-- Status Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Status:</span>
              {{ getStatusFilterLabel(activeStatus) }}
            </div>
            
            <!-- Format -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Format:</span>
              {{ getFormatLabel(selectedFormat) }}
            </div>
          </div>
          
          <p class="mt-4 text-sm text-gray-600">
            Your report will include data based on the filters above. Click Download to generate and download the report.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTempleStore } from '@/stores/temple';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import ReportsService from '@/services/reports.service';

// Composables
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const { showToast } = useToast();

// Reactive state
const selectedTemple = ref('all');
const activeFilter = ref('weekly');
const activeStatus = ref('all');
const selectedFormat = ref('pdf');
const startDate = ref('');
const endDate = ref('');
const isDownloading = ref(false);
const errorMessage = ref('');
const allTemples = ref([]); // Store temples from all tenants
const debugMode = ref(true); // Enable for troubleshooting

// Initialize dates
const initializeDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  endDate.value = today.toISOString().split('T')[0];
  startDate.value = weekAgo.toISOString().split('T')[0];
};

// Filter options
const timeFilters = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

const statusFilters = [
  { label: 'All Status', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

// Computed properties
const tenantId = computed(() => {
  // If coming from superadmin with tenants in URL parameter, use the first one
  if (route.query.tenants) {
    const tenantIdArray = route.query.tenants.split(',');
    return tenantIdArray[0]; // Use first tenant ID as default display
  }
  
  // Otherwise use route params or fallback methods
  return route.params.tenantId || userStore.user?.id || localStorage.getItem('current_tenant_id');
});

// Check for tenants parameter from superadmin
const fromSuperadmin = computed(() => route.query.from === 'superadmin');
const tenantIds = computed(() => {
  if (route.query.tenants) {
    return route.query.tenants.split(',').map(id => id.trim());
  }
  return [tenantId.value]; // Default to current tenant only
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const entityId = computed(() => {
  return selectedTemple.value === 'all' ? 'all' : selectedTemple.value;
});

const isFormValid = computed(() => {
  if (activeFilter.value === 'custom') {
    return startDate.value && endDate.value && new Date(startDate.value) <= new Date(endDate.value);
  }
  return true;
});

// IMPROVED: Filtered temples computed property to show ONLY approved temples from selected tenants
// with deduplication by temple ID
// IMPROVED: Filtered temples computed property - more lenient for tenant users
const filteredTemples = computed(() => {
  let templesForDropdown = [];
  
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    // For multiple tenants, use the deduplicated allTemples array
    templesForDropdown = allTemples.value;
  } else {
    // Single tenant case
    templesForDropdown = templeStore.temples;
  }
  
  // Debug: Log the temples that will be filtered
  if (debugMode.value && templesForDropdown.length > 0) {
    console.log(`⚡ Before filtering: ${templesForDropdown.length} temples found`);
  }
  
  // For tenant users, just check the approval status and skip tenant ID matching
  if (!fromSuperadmin.value) {
    return templesForDropdown.filter(temple => {
      // For tenant users, we only care about approved temples
      const status = (temple.status || '').toLowerCase();
      const isApproved = status === 'approved' || status === 'active';
      
      // Debug log
      if (debugMode.value) {
        console.log(`Temple ${temple.id} (${temple.name}): TENANT USER VIEW, status=${status}, approved=${isApproved}`);
      }
      
      return isApproved;
    });
  }
  
  // For superadmin, continue with strict tenant matching + approval status
  return templesForDropdown.filter(temple => {
    // Check if temple belongs to one of the selected tenants
    const createdBy = String(temple.created_by || temple.createdBy || '');
    const templeTenantId = String(temple.tenant_id || temple.tenantId || '');
    const belongsToSelectedTenant = tenantIds.value.some(tid => 
      createdBy === tid || templeTenantId === tid
    );
    
    // Check if temple is approved
    const status = (temple.status || '').toLowerCase();
    const isApproved = status === 'approved' || status === 'active';
    
    // Log each temple for debugging
    if (debugMode.value) {
      console.log(`Temple ${temple.id} (${temple.name}): tenant match=${belongsToSelectedTenant}, status=${status}, approved=${isApproved}`);
    }
    
    return belongsToSelectedTenant && isApproved;
  });
});

// Methods
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  clearError();
  
  // Set appropriate date range based on filter
  const today = new Date();
  const start = new Date();
  
  if (filter === 'weekly') {
    start.setDate(today.getDate() - 7);
  } else if (filter === 'monthly') {
    start.setDate(today.getDate() - 30);
  } else if (filter === 'yearly') {
    start.setDate(today.getDate() - 365);
  }
  
  if (filter !== 'custom') {
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = today.toISOString().split('T')[0];
  }
};

const setActiveStatus = (status) => {
  activeStatus.value = status;
  clearError();
};

const onTempleChange = () => {
  clearError();
};

const clearError = () => {
  errorMessage.value = '';
};

const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  
  // Check in allTemples array first for multiple tenant case
  if (allTemples.value.length > 0) {
    const temple = allTemples.value.find(t => String(t.id) === String(templeId));
    if (temple) return temple.name;
  }
  
  // Then check in templeStore.temples
  const temple = templeStore.temples.find(t => String(t.id) === String(templeId));
  return temple ? temple.name : 'Unknown Temple';
};

const getTimeFilterLabel = (filter) => {
  const found = timeFilters.find(f => f.value === filter);
  return found ? found.label : 'Unknown';
};

const getStatusFilterLabel = (status) => {
  const found = statusFilters.find(s => s.value === status);
  return found ? found.label : 'Unknown';
};

const getFormatLabel = (format) => {
  const found = formats.find(f => f.value === format);
  return found ? found.label : 'Unknown';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const buildReportParams = () => {
  // CRITICAL FIX: Always prioritize assigned tenant ID from JWT for standard users
  const assignedTenantId = localStorage.getItem('assigned_tenant_id');
  const isStandardUser = 
    userStore.user?.roleId === 5 || 
    userStore.user?.role === 'standarduser' || 
    userStore.user?.role === 'standard_user';
  const isMonitoringUser = 
    userStore.user?.roleId === 6 || 
    userStore.user?.role === 'monitoringuser' || 
    userStore.user?.role === 'monitoring_user';

  // For standard/monitoring users, always use assigned tenant ID from token
  let effectiveTenantId;
  if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
    console.log(`⚠️ OVERRIDE: Using assigned tenant ID ${assignedTenantId} instead of ${tenantId.value}`);
    effectiveTenantId = assignedTenantId;
  } else {
    effectiveTenantId = tenantId.value;
  }

  // Continue with the regular parameter building...
  const params = {
    entityId: effectiveTenantId,
    dateRange: activeFilter.value,
    format: selectedFormat.value,
    templeId: selectedTemple.value === 'all' ? 'all' : selectedTemple.value,
    isSuperAdmin: false
  };

  // Add status filter if not 'all'
  if (activeStatus.value !== 'all') {
    params.status = activeStatus.value;
  }

  // Add custom date range
  if (activeFilter.value === 'custom') {
    params.startDate = startDate.value;
    params.endDate = endDate.value;
  }

  // CRITICAL: For standard users, force the tenant ID in headers
  if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
    params.headers = {
      'X-Tenant-ID': assignedTenantId
    };
  }

  return params;
};

const downloadReport = async () => {
  if (isDownloading.value || !isFormValid.value) return;

  clearError();
  isDownloading.value = true;

  try {
    // CRITICAL FIX: Always use assigned tenant ID from token for standard users
    const assignedTenantId = localStorage.getItem('assigned_tenant_id');
    const isStandardUser = 
      userStore.user?.roleId === 5 || 
      userStore.user?.role === 'standarduser' || 
      userStore.user?.role === 'standard_user';
    const isMonitoringUser = 
      userStore.user?.roleId === 6 || 
      userStore.user?.role === 'monitoringuser' || 
      userStore.user?.role === 'monitoring_user';

    // For standard/monitoring users, always use assigned tenant ID from token
    let effectiveTenantId = tenantId.value;
    if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
      console.log(`⚠️ OVERRIDE: Using assigned tenant ID ${assignedTenantId} for download`);
      effectiveTenantId = assignedTenantId;
    }

    // Build params with the effective tenant ID
    const params = {
      entityId: effectiveTenantId,
      dateRange: activeFilter.value,
      format: selectedFormat.value,
      templeId: selectedTemple.value,
      isSuperAdmin: false
    };

    // Add status filter if not 'all'
    if (activeStatus.value !== 'all') {
      params.status = activeStatus.value;
    }

    // Add custom date range
    if (activeFilter.value === 'custom') {
      params.startDate = startDate.value;
      params.endDate = endDate.value;
    }

    // CRITICAL: Force the headers to use assigned tenant ID
    if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
      params.headers = {
        'X-Tenant-ID': assignedTenantId
      };
    }

    // Important: Create immutable copy of params
    const finalParams = Object.freeze({...params});
    
    // Debug logging - IMPORTANT: This should be AFTER all params are set
    console.log('Final download params:', JSON.stringify(finalParams));

    // Call the service method
    const result = await ReportsService.downloadTempleRegisteredReport(finalParams);
    
    // Show success message
    showToast(`Report downloaded successfully: ${result.filename}`, 'success');
    
  } catch (error) {
    console.error('Download failed:', error);
    
    // Improved error handling with more specific messages
    let errorMsg = 'Failed to download report. Please try again.';
    
    if (error.message?.includes('network error')) {
      errorMsg = 'Network error. Please check your connection and try again.';
    } else if (error.response?.status === 404) {
      errorMsg = 'Report endpoint not found. The report may not be available for this configuration.';
    } else if (error.response?.status === 403) {
      errorMsg = 'You do not have permission to download this report.';
    } else if (error.response?.status === 400) {
      errorMsg = 'Invalid report parameters. Please check your selections.';
    }
    
    errorMessage.value = errorMsg;
    showToast(`Download failed: ${errorMsg}`, 'error');
  } finally {
    isDownloading.value = false;
  }
};

// Helper function to deduplicate temples by ID
const deduplicateTemplesByID = (temples) => {
  const uniqueTemples = [];
  const seenIds = new Set();
  
  for (const temple of temples) {
    const templeId = temple.id?.toString();
    
    if (!templeId) {
      console.warn('Temple without ID:', temple);
      continue;
    }
    
    if (!seenIds.has(templeId)) {
      seenIds.add(templeId);
      uniqueTemples.push(temple);
    } else {
      console.log(`Skipping duplicate temple ID: ${templeId}, name: ${temple.name}`);
    }
  }
  
  console.log(`Deduplicated: ${temples.length} temples -> ${uniqueTemples.length} unique temples`);
  return uniqueTemples;
};

// Fetch temples for a specific tenant - UPDATED
// Update the fetchTemplesForTenant function in TempleRegisterReport.vue
const fetchTemplesForTenant = async (tenantId) => {
  try {
    // Check for assigned tenant ID from JWT token first
    const assignedTenantId = localStorage.getItem('assigned_tenant_id');
    const isStandardUser = userStore.user?.roleId === 5 || 
                           userStore.user?.role === 'standarduser' ||
                           userStore.user?.role === 'standard_user';
    const isMonitoringUser = userStore.user?.roleId === 6 || 
                             userStore.user?.role === 'monitoringuser' ||
                             userStore.user?.role === 'monitoring_user';
    
    // For standard/monitoring users, ALWAYS prioritize the assigned tenant ID from token
    if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
      console.log(`🔄 Standard/Monitoring user detected - using assigned tenant ID: ${assignedTenantId} instead of ${tenantId}`);
      // Override the passed tenantId with the assigned one from token
      tenantId = assignedTenantId;
    }
    
    console.log(`Fetching temples for tenant ID: ${tenantId}`);
    
    // Clear temple store before fetching
    if (templeStore.clearTemples) {
      templeStore.clearTemples();
    } else {
      templeStore.temples = [];
    }
    
    // CRITICAL: Force tenant ID in local storage to ensure proper API calls
    const originalTenantId = localStorage.getItem('current_tenant_id');
    localStorage.setItem('current_tenant_id', tenantId);
    localStorage.setItem('X-Tenant-ID', tenantId);
    
    // Try the direct method first
    console.log(`🔄 Trying direct method for tenant ${tenantId}`);
    try {
      await templeStore.fetchDirectByTenant(tenantId);
      if (templeStore.temples.length > 0) {
        console.log(`✅ Direct method returned ${templeStore.temples.length} temples`);
      } else {
        console.log(`⚠️ Direct method returned 0 temples, falling back to regular fetch`);
        // Fall back to regular fetch
        await templeStore.fetchTemples(tenantId);
      }
    } catch (directError) {
      console.error(`Error with direct fetch: ${directError.message}, falling back to regular fetch`);
      // Fall back to regular fetch
      await templeStore.fetchTemples(tenantId);
    }
    
    // Restore original tenant ID in localStorage
    if (originalTenantId) {
      localStorage.setItem('current_tenant_id', originalTenantId);
    } else {
      localStorage.removeItem('current_tenant_id');
    }
    localStorage.removeItem('X-Tenant-ID');
    
    console.log(`Fetched ${templeStore.temples.length} temples for tenant ${tenantId}`);
    
    // Make a copy of the temples and add the source tenant ID
    const templesWithTenantId = templeStore.temples.map(temple => ({
      ...temple,
      sourceTenantId: tenantId
    }));
    
    return templesWithTenantId;
  } catch (error) {
    console.error(`Error fetching temples for tenant ${tenantId}:`, error);
    return [];
  }
};

// Direct API fetch method - bypass store layer
const fetchTemplesDirectly = async (tenantId) => {
  console.log(`🔄 DIRECT API: Fetching temples directly for tenant ${tenantId}`);
  
  if (!tenantId) {
    console.error('❌ DIRECT API: No tenant ID provided');
    return [];
  }
  
  // CRITICAL FIX: Check for assigned tenant ID from JWT token
  const assignedTenantId = localStorage.getItem('assigned_tenant_id');
  const isStandardUser = 
    userStore.user?.roleId === 5 || 
    userStore.user?.role === 'standarduser' || 
    userStore.user?.role === 'standard_user';
  const isMonitoringUser = 
    userStore.user?.roleId === 6 || 
    userStore.user?.role === 'monitoringuser' || 
    userStore.user?.role === 'monitoring_user';
  
  // For standard/monitoring users, ALWAYS use the assigned tenant ID from token in headers
  const effectiveHeaderTenantId = 
    (isStandardUser || isMonitoringUser) && assignedTenantId 
      ? assignedTenantId 
      : tenantId;
  
  try {
    // Prepare headers with tenant ID and authorization
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'X-Tenant-ID': effectiveHeaderTenantId
    };
    
    if (effectiveHeaderTenantId !== tenantId) {
      console.log(`⚠️ OVERRIDE: Using header tenant ID ${effectiveHeaderTenantId} instead of ${tenantId}`);
    }
    
    // API endpoint with query param for tenant filtering
    const url = `/v1/entities?tenant_id=${tenantId}&_=${Date.now()}`;
    console.log(`📡 DIRECT API: Calling ${url} with X-Tenant-ID: ${effectiveHeaderTenantId}`);
    
    // Make direct API call
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ DIRECT API: Received response:`, data);
    
    // Extract temples from response
    let temples = Array.isArray(data) ? data : 
                  data.data ? data.data :
                  data.entities ? data.entities : 
                  data.items ? data.items : [];
    
    console.log(`🏛️ DIRECT API: Extracted ${temples.length} temples`);
    
    // Update the store directly
    templeStore.temples = temples;
    
    return temples;
  } catch (error) {
    console.error(`❌ DIRECT API: Error fetching temples:`, error);
    return [];
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize default dates
  initializeDates();
  
  console.log('🔍 Component mounted - trying direct API approach');
  
  // CRITICAL FIX: Always prioritize assigned tenant ID from JWT for standard users
  const assignedTenantId = localStorage.getItem('assigned_tenant_id');
  const isStandardUser = 
    userStore.user?.roleId === 5 || 
    userStore.user?.role === 'standarduser' || 
    userStore.user?.role === 'standard_user';
  const isMonitoringUser = 
    userStore.user?.roleId === 6 || 
    userStore.user?.role === 'monitoringuser' || 
    userStore.user?.role === 'monitoring_user';
  
  // For standard/monitoring users, ALWAYS use the assigned tenant ID from token
  let effectiveTenantId;
  if ((isStandardUser || isMonitoringUser) && assignedTenantId) {
    console.log(`⚠️ OVERRIDE: Standard user detected with token assigned tenant ID: ${assignedTenantId}`);
    effectiveTenantId = assignedTenantId;
    // Force the correct tenant ID in tenantIds
    tenantIds.value = [assignedTenantId];
  } else {
    effectiveTenantId = tenantIds.value[0];
  }
  
  console.log(`Current tenant ID: ${effectiveTenantId} (from token: ${assignedTenantId || 'none'})`);
  
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    // Multiple tenants case (Superadmin) - unchanged code...
    console.log(`Fetching temples for ${tenantIds.value.length} tenants: ${tenantIds.value.join(', ')}`);
    
    let collectedTemples = [];
    for (const tid of tenantIds.value) {
      const tenantTemples = await fetchTemplesDirectly(tid);
      collectedTemples.push(...tenantTemples);
    }
    
    allTemples.value = deduplicateTemplesByID(collectedTemples);
    console.log(`Final temple count for dropdown: ${filteredTemples.value.length}`);
  } 
  else {
    // Single tenant case - USE EFFECTIVE TENANT ID
    try {
      if (!effectiveTenantId) {
        console.error("❌ No effective tenant ID available!");
        errorMessage.value = "Could not determine your tenant ID. Please refresh or contact support.";
        return;
      }
      
      console.log(`🔄 Single tenant mode - fetching temples for tenant ID: ${effectiveTenantId}`);
      
      // Make direct API call with effective tenant ID
      const directResult = await fetchTemplesDirectly(effectiveTenantId);
      
      // If direct fetch returned no results, try the store methods
      if (directResult.length === 0) {
        console.warn("⚠️ Direct fetch returned no temples. Trying store methods...");
        await templeStore.fetchDirectByTenant(effectiveTenantId);
      }
      
      console.log(`Final temple count after all attempts: ${filteredTemples.value.length}`);
      
      if (filteredTemples.value.length === 0) {
        console.error("❌ All temple fetch methods failed!");
        errorMessage.value = "Could not load temples for your tenant. Please try again later.";
      }
    } catch (error) {
      console.error('Error loading temple data:', error);
      errorMessage.value = 'Failed to load temple data. Some features may not work correctly.';
    }
  }
});
</script>