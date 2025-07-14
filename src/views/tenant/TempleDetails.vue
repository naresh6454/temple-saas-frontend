<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="breadcrumbItems" class="mb-6" />
      
      <!-- Conditional Rendering -->
      <div>
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <BaseLoader size="lg" />
        </div>
        
        <!-- Error state -->
        <BaseAlert
           v-else-if="error"
           type="error"
           title="Error Loading Temple"
           :message="error"
           class="mb-6"
         />
        
        <!-- Temple Details -->
        <div v-else-if="temple" class="space-y-8">
          <!-- Temple Header -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h1 class="text-2xl font-bold text-gray-900">{{ temple.name }}</h1>
              <TempleApprovalStatus :status="temple.status" />
            </div>
            
            <div class="p-6">
              <!-- Temple Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Temple Details</h3>
                  <div class="mt-2 space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Location:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.city }}, {{ temple.state }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Established:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ formatDate(temple.establishedDate) }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Primary Deity:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.primaryDeity }}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div class="mt-2 space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Email:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.email }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Phone:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.phone }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Address:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.address }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Temple Description -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p class="text-sm text-gray-700">{{ temple.description }}</p>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <!-- <button 
                  @click="$router.push(`/entity/${temple.id}/dashboard`)"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Manage Temple
                </button> -->
                <!-- <button 
                  @click="$router.push(`/tenant/entities/${temple.id}/edit`)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Temple
                </button> -->
              </div>
            </div>
          </div>
          
          <!-- Temple Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Devotees</h3>
              <p class="text-3xl font-bold text-indigo-600">{{ temple.stats?.devoteeCount || 0 }}</p>
              <p class="text-sm text-gray-500 mt-1">Total registered devotees</p>
            </div>
            
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Sevas</h3>
              <p class="text-3xl font-bold text-indigo-600">{{ temple.stats?.sevaCount || 0 }}</p>
              <p class="text-sm text-gray-500 mt-1">Active seva offerings</p>
            </div>
            
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Donations</h3>
              <p class="text-3xl font-bold text-indigo-600">₹{{ temple.stats?.donationAmount || 0 }}</p>
              <p class="text-sm text-gray-500 mt-1">Total donations received</p>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No Temple Found</h3>
          <p class="mt-1 text-gray-500">The temple you're looking for doesn't exist or has been removed.</p>
          <button 
             @click="$router.push('/tenant/entities')"
             class="mt-6 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Temples
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTempleStore } from '@/stores/temple';
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue';
import BaseLoader from '@/components/common/BaseLoader.vue';
import BaseAlert from '@/components/common/BaseAlert.vue';
import TempleApprovalStatus from '@/components/temple/TempleApprovalStatus.vue';

const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();

const loading = ref(true);
const error = ref(null);
const temple = ref(null);

// Computed properties for breadcrumb - provide direct 'to' property that matches AppBreadcrumb's expected format
const breadcrumbItems = computed(() => [
  { 
    name: 'My Temples', 
    to: '/tenant/entities'
  },
  { 
    name: temple.value?.name || 'Temple Details', 
    current: true
  }
]);

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Fetch temple data
const fetchTempleData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const templeId = route.params.id;
    const response = await templeStore.getTempleById(templeId);
    
    if (response) {
      temple.value = response;
    } else {
      error.value = 'Temple not found';
    }
  } catch (err) {
    console.error('Error fetching temple:', err);
    error.value = err.message || 'Failed to load temple details';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTempleData();
});
</script>

<style scoped>
/* No custom styles with @apply to avoid the error */
</style>