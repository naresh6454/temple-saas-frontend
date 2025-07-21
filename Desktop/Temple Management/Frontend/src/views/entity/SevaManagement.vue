<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Seva Management</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage seva bookings, approvals, and scheduling
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
            <!-- <button
              @click="exportSevas"
              class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button> -->
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
              <p class="text-2xl font-bold text-gray-900">{{ sevaList.length }}</p>
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
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => s.status === 'approved').length }}
              </p>
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
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => s.status === 'pending').length }}
              </p>
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
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => s.status === 'rejected').length }}
              </p>
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
                v-model="searchFilter"
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
              v-model="statusFilter"
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
              v-model="dateRangeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
            <select
              v-model="typeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="daily">Daily Sevas</option>
              <option value="special">Special Sevas</option>
              <option value="festival">Festival Sevas</option>
              <option value="personal">Personal Sevas</option>
            </select>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            Showing {{ filteredSevas.length }} of {{ sevaList.length }} sevas
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
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <!-- Table Section -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Devotee
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seva Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="seva in filteredSevas"
                  :key="seva.id"
                  class="hover:bg-gray-50 transition-colors duration-150"
                >
                  <!-- Devotee Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-indigo-700">
                          {{ getInitials(seva.devotee?.name) }}
                        </span>
                      </div>  
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ seva.devotee?.name || 'Not Assigned' }}</div>
                        <div class="text-sm text-gray-500">{{ seva.devotee?.phone || 'No Contact' }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Seva Details Column -->
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ seva.name || 'Unnamed Seva' }}</div>
                    <div class="text-sm text-gray-500">{{ seva.type || 'Not Categorized' }}</div>
                    <div class="text-xs text-gray-400 mt-1" v-if="seva.notes">
                      {{ seva.notes }}
                    </div>
                  </td>

                  <!-- Date & Time Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(seva.date) }}</div>
                    <div class="text-sm text-gray-500">{{ seva.time || 'No Time' }}</div>
                  </td>

                  <!-- Amount Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      ₹{{ seva.amount.toLocaleString() }}
                    </div>
                  </td>

                  <!-- Status Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="getStatusClass(seva.status)" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      <span :class="getStatusDotClass(seva.status)" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                      {{ seva.status.charAt(0).toUpperCase() + seva.status.slice(1) }}
                    </span>
                  </td>

                  <!-- Actions Column -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                      <!-- View Button -->
                      <button
                        @click="viewSevaDetails(seva)"
                        class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        title="View Details"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>

                      <!-- Edit Button -->
                      <button
                        @click="editSeva(seva)"
                        class="text-yellow-600 hover:text-yellow-900 transition-colors duration-150"
                        title="Edit"
                      >
                        <!-- <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg> -->
                      </button>

                      <!-- Approve/Reject for Pending -->
                      <template v-if="seva.status === 'pending'">
                        <button
                          @click="approveSeva(seva)"
                          class="text-green-600 hover:text-green-900 transition-colors duration-150"
                          title="Approve"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button
                          @click="rejectSeva(seva)"
                          class="text-red-600 hover:text-red-900 transition-colors duration-150"
                          title="Reject"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </template>

                      <!-- Complete Button for Approved -->
                      <button
                        v-if="seva.status === 'approved'"
                        @click="completeSeva(seva)"
                        class="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        title="Mark Complete"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>

                      <!-- Delete Button -->
                      <button
                        @click="deleteSeva(seva)"
                        class="text-red-600 hover:text-red-900 transition-colors duration-150"
                        title="Delete"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredSevas.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No sevas found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new seva.</p>
            <div class="mt-6">
              <button
                @click="showCreateForm = true"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add New Seva
              </button>
            </div>
          </div>
        </div>
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
        
        <!-- Simple Seva Form -->
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seva Name*</label>
              <input
                v-model="sevaForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seva Type*</label>
              <select
                v-model="sevaForm.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>Select Seva Type</option>
                <option value="daily">Daily Seva</option>
                <option value="special">Special Seva</option>
                <option value="festival">Festival Seva</option>
                <option value="personal">Personal Seva</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="sevaForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                <input
                  v-model="sevaForm.amount"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                <input
                  v-model="sevaForm.date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                v-model="sevaForm.time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeForm"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveSeva"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {{ editingSeva ? 'Update Seva' : 'Create Seva' }}
            </button>
          </div>
        </div>
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
        
        <div class="p-6">
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ selectedSeva.name }}</h3>
              <span 
                :class="getStatusClass(selectedSeva.status)" 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                <span :class="getStatusDotClass(selectedSeva.status)" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                {{ selectedSeva.status.charAt(0).toUpperCase() + selectedSeva.status.slice(1) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Seva Type</p>
                <p class="text-base text-gray-900">{{ selectedSeva.type || 'Not specified' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Amount</p>
                <p class="text-base text-gray-900">₹{{ selectedSeva.amount.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Date</p>
                <p class="text-base text-gray-900">{{ formatDate(selectedSeva.date) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Time</p>
                <p class="text-base text-gray-900">{{ selectedSeva.time || 'Not specified' }}</p>
              </div>
            </div>
            
            <div v-if="selectedSeva.notes" class="mb-4">
              <p class="text-sm font-medium text-gray-500">Notes</p>
              <p class="text-base text-gray-900">{{ selectedSeva.notes }}</p>
            </div>
            
            <div class="border-t border-gray-200 pt-4">
              <p class="text-sm font-medium text-gray-500">Devotee Information</p>
              <div class="flex items-center mt-2">
                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-indigo-700">
                    {{ getInitials(selectedSeva.devotee?.name) }}
                  </span>
                </div>
                <div class="ml-3">
                  <p class="text-base font-medium text-gray-900">{{ selectedSeva.devotee?.name || 'Not Assigned' }}</p>
                  <p class="text-sm text-gray-500">{{ selectedSeva.devotee?.phone || 'No Contact' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div v-if="selectedSeva.status === 'pending'" class="flex justify-end space-x-3">
            <button
              @click="rejectSeva(selectedSeva)"
              class="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              Reject Seva
            </button>
            <button
              @click="approveSeva(selectedSeva)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve Seva
            </button>
          </div>
        </div>
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
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useSevaStore } from '@/stores/seva'

// Get entity ID from route
const route = useRoute()
const entityId = route.params.id

// Initialize stores
const sevaStore = useSevaStore()

// Local state
const loading = ref(false)
const showCreateForm = ref(false)
const editingSeva = ref(null)
const selectedSeva = ref(null)
const toasts = ref([])
const nextToastId = ref(1)
const sevaList = ref([
  {
    id: 1,
    name: 'Abhishekam',
    type: 'special',
    devotee: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210'
    },
    date: '2024-12-25',
    time: '06:00 AM',
    amount: 1100,
    status: 'pending',
    notes: 'Special request for Lord Ganesha'
  },
  {
    id: 2,
    name: 'Archana',
    type: 'daily',
    devotee: {
      name: 'Priya Sharma',
      phone: '+91 87654 32109'
    },
    date: '2024-12-24',
    time: '07:30 AM',
    amount: 51,
    status: 'approved',
    notes: ''
  },
  {
    id: 3,
    name: 'Satyanarayana Pooja',
    type: 'festival',
    devotee: {
      name: 'Venkatesh Rao',
      phone: '+91 76543 21098'
    },
    date: '2024-12-26',
    time: '10:00 AM',
    amount: 2100,
    status: 'completed',
    notes: 'Full moon day special'
  },
  {
    id: 4,
    name: 'Kalyanam',
    type: 'personal',
    devotee: {
      name: 'Lakshmi Devi',
      phone: '+91 65432 10987'
    },
    date: '2024-12-27',
    time: '11:30 AM',
    amount: 5100,
    status: 'rejected',
    notes: 'Anniversary celebration'
  }
])

// Filters - directly on component
const searchFilter = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRangeFilter = ref('')

// Computed filtered sevas
const filteredSevas = computed(() => {
  let filtered = [...sevaList.value]
  
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase()
    filtered = filtered.filter(seva => 
      (seva.name || '').toLowerCase().includes(search) ||
      (seva.devotee?.name || '').toLowerCase().includes(search) ||
      (seva.type || '').toLowerCase().includes(search)
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(seva => seva.status === statusFilter.value)
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(seva => seva.type === typeFilter.value)
  }
  
  // Add date range filtering
  if (dateRangeFilter.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const getSevaDate = (seva) => {
      if (!seva.date) return null
      return new Date(seva.date)
    }
    
    if (dateRangeFilter.value === 'today') {
      filtered = filtered.filter(seva => {
        const sevaDate = getSevaDate(seva)
        if (!sevaDate) return false
        return sevaDate.getTime() === today.getTime()
      })
    } else if (dateRangeFilter.value === 'week') {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      filtered = filtered.filter(seva => {
        const sevaDate = getSevaDate(seva)
        if (!sevaDate) return false
        return sevaDate >= weekStart && sevaDate <= weekEnd
      })
    } else if (dateRangeFilter.value === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      filtered = filtered.filter(seva => {
        const sevaDate = getSevaDate(seva)
        if (!sevaDate) return false
        return sevaDate >= monthStart && sevaDate <= monthEnd
      })
    }
  }
  
  return filtered
})

// Form data for create/edit
const sevaForm = ref({
  name: '',
  type: '',
  notes: '',
  amount: 0,
  date: '',
  time: '',
  status: 'pending'
})

// Toast function
const showToast = (message, type = 'info') => {
  const id = nextToastId.value++
  const toast = { id, message, type, show: true }
  toasts.value.push(toast)
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index].show = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }, 3000)
  
  return id
}

// Helper functions
const getInitials = (name) => {
  if (!name) return 'NA'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return 'No Date'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-yellow-400',
    approved: 'bg-green-400',
    rejected: 'bg-red-400',
    completed: 'bg-blue-400'
  }
  return classes[status] || 'bg-gray-400'
}

// API Integration Functions
const loadSevas = async () => {
  console.log('Loading sevas for entity ID:', entityId)
  try {
    loading.value = true
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Use the hardcoded data for development
      console.log('Development mode: Using hardcoded data')
      // sevaList is already initialized with sample data
    } else {
      // In production, use the store to fetch data
      await sevaStore.fetchSevas(entityId)
      sevaList.value = sevaStore.sevas
    }
  } catch (error) {
    console.error('Error loading sevas:', error)
    showToast('Failed to load sevas. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Action handlers
const approveSeva = async (seva) => {
  console.log('Approving seva:', seva.name)
  
  try {
    // In development mode, just update local state
    if (process.env.NODE_ENV === 'development') {
      const index = sevaList.value.findIndex(s => s.id === seva.id)
      if (index !== -1) {
        sevaList.value[index].status = 'approved'
        showToast(`Seva "${seva.name}" approved successfully`, 'success')
      }
    } else {
      // In production, call the API
      await sevaStore.updateSevaStatus(seva.id, 'approved')
      await loadSevas() // Reload the list
      showToast(`Seva "${seva.name}" approved successfully`, 'success')
    }
    
    // Close detail view if open
    if (selectedSeva.value && selectedSeva.value.id === seva.id) {
      selectedSeva.value = null
    }
  } catch (error) {
    console.error('Error approving seva:', error)
    showToast('Failed to approve seva. Please try again.', 'error')
  }
}

const rejectSeva = async (seva) => {
  console.log('Rejecting seva:', seva.name)
  
  try {
    // In development mode, just update local state
    if (process.env.NODE_ENV === 'development') {
      const index = sevaList.value.findIndex(s => s.id === seva.id)
      if (index !== -1) {
        sevaList.value[index].status = 'rejected'
        showToast(`Seva "${seva.name}" rejected`, 'warning')
      }
    } else {
      // In production, call the API
      await sevaStore.updateSevaStatus(seva.id, 'rejected')
      await loadSevas() // Reload the list
      showToast(`Seva "${seva.name}" rejected`, 'warning')
    }
    
    // Close detail view if open
    if (selectedSeva.value && selectedSeva.value.id === seva.id) {
      selectedSeva.value = null
    }
  } catch (error) {
    console.error('Error rejecting seva:', error)
    showToast('Failed to reject seva. Please try again.', 'error')
  }
}

const completeSeva = async (seva) => {
  console.log('Completing seva:', seva.name)
  
  try {
    // In development mode, just update local state
    if (process.env.NODE_ENV === 'development') {
      const index = sevaList.value.findIndex(s => s.id === seva.id)
      if (index !== -1) {
        sevaList.value[index].status = 'completed'
        showToast(`Seva "${seva.name}" marked as completed`, 'success')
      }
    } else {
      // In production, call the API
      await sevaStore.updateSevaStatus(seva.id, 'completed')
      await loadSevas() // Reload the list
      showToast(`Seva "${seva.name}" marked as completed`, 'success')
    }
  } catch (error) {
    console.error('Error completing seva:', error)
    showToast('Failed to mark seva as completed. Please try again.', 'error')
  }
}

const deleteSeva = async (seva) => {
  console.log('Deleting seva:', seva)
  
  // Confirm delete
  if (!confirm(`Are you sure you want to delete the seva "${seva.name}"?`)) {
    return
  }
  
  try {
    // In development mode, just update local state
    if (process.env.NODE_ENV === 'development') {
      sevaList.value = sevaList.value.filter(s => s.id !== seva.id)
      showToast(`Seva "${seva.name}" deleted successfully`, 'success')
    } else {
      // In production, call the API
      await sevaStore.deleteSeva(seva.id)
      await loadSevas() // Reload the list
      showToast(`Seva "${seva.name}" deleted successfully`, 'success')
    }
  } catch (error) {
    console.error('Error deleting seva:', error)
    showToast('Failed to delete seva. Please try again.', 'error')
  }
}

const editSeva = (seva) => {
  console.log('Editing seva:', seva.name)
  
  // Populate the form with the seva data
  sevaForm.value = {
    name: seva.name,
    type: seva.type,
    notes: seva.notes || '',
    amount: seva.amount,
    date: seva.date,
    time: seva.time || '',
    status: seva.status
  }
  
  // Store the original for updating
  editingSeva.value = seva
}

const saveSeva = async () => {
  // Validate form
  if (!sevaForm.value.name || !sevaForm.value.type || !sevaForm.value.date) {
    showToast('Please fill in all required fields', 'error')
    return
  }
  
  try {
    if (editingSeva.value) {
      // Update existing seva
      console.log("Updating seva:", sevaForm.value)
      
      if (process.env.NODE_ENV === 'development') {
        // In development mode, just update local state
        const index = sevaList.value.findIndex(s => s.id === editingSeva.value.id)
        if (index !== -1) {
          sevaList.value[index] = {
            ...sevaList.value[index],
            ...sevaForm.value
          }
          showToast(`Seva "${sevaForm.value.name}" updated successfully`, 'success')
        }
      } else {
        // In production, call the API
        await sevaStore.updateSeva({
          id: editingSeva.value.id,
          ...sevaForm.value
        })
        await loadSevas() // Reload the list
        showToast(`Seva "${sevaForm.value.name}" updated successfully`, 'success')
      }
    } else {
      // Create new seva
      console.log("Creating new seva:", sevaForm.value)
      
      if (process.env.NODE_ENV === 'development') {
        // In development mode, just update local state
        const newId = Math.max(0, ...sevaList.value.map(s => s.id)) + 1
        const newSeva = {
          id: newId,
          ...sevaForm.value,
          devotee: {
            name: 'New Devotee',
            phone: '+91 99999 99999'
          }
        }
        sevaList.value.push(newSeva)
        showToast(`Seva "${sevaForm.value.name}" created successfully`, 'success')
      } else {
        // In production, call the API
        const newSeva = await sevaStore.createSeva({
          ...sevaForm.value,
          entityId: entityId
        })
        await loadSevas() // Reload the list
        showToast(`Seva "${sevaForm.value.name}" created successfully`, 'success')
      }
    }
    
    // Close the form
    closeForm()
  } catch (error) {
    console.error('Error saving seva:', error)
    showToast('Failed to save seva. Please try again.', 'error')
  }
}

const viewSevaDetails = (seva) => {
  console.log('Viewing seva details:', seva.name)
  selectedSeva.value = seva
}

const closeForm = () => {
  showCreateForm.value = false
  editingSeva.value = null
  
  // Reset form
  sevaForm.value = {
    name: '',
    type: '',
    notes: '',
    amount: 0,
    date: '',
    time: '',
    status: 'pending'
  }
}

const clearFilters = () => {
  searchFilter.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  dateRangeFilter.value = ''
}

const exportSevas = () => {
  showToast('Export feature is not implemented yet', 'info')
}

// Lifecycle
onMounted(() => {
  console.log('SevaManagement component mounted')
  loadSevas()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>