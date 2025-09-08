<template>
  <div class="min-h-screen bg-gray-50/90">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Seva Management</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage seva bookings, approvals, and scheduling
            </p>
          </div>
          <div class="flex gap-3">
            <!-- View Toggle Buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="currentView = 'bookings'"
                :class="currentView === 'bookings' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              >
                Bookings
              </button>
              <button
                @click="currentView = 'sevas'"
                :class="currentView === 'sevas' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              >
                View Sevas
              </button>
            </div>
            
            <button
              @click="showCreateForm = true"
              class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Seva
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bookings View (Default) -->
    <div v-if="currentView === 'bookings'" class="px-6 py-6">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Bookings</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaList.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'approved').length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'pending').length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'rejected').length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
            <div class="relative">
              <input
                v-model="searchFilter"
                type="text"
                placeholder="Search by name, devotee, or type..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
            Showing {{ filteredSevas.length }} of {{ sevaList.length }} bookings
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Seva Bookings List -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div v-if="filteredSevas.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Devotee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
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
                v-for="booking in filteredSevas"
                :key="getId(booking)"
                class="hover:bg-gray-50 transition-colors duration-150"
              >
                <!-- Booking Details Column -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getSevaName(booking) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getSevaType(booking) }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1" v-if="getSpecialRequests(booking)">
                    {{ getSpecialRequests(booking) }}
                  </div>
                </td>

                <!-- Devotee Column -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ getDevoteeName(booking) }}</div>
                  <div class="text-xs text-gray-500">{{ getDevoteePhone(booking) }}</div>
                </td>

                <!-- Date & Time Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatBookingDate(booking) }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatBookingTime(booking) }}
                  </div>
                </td>

                <!-- Status Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="getStatusClass(getStatus(booking))" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    <span :class="getStatusDotClass(getStatus(booking))" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                    {{ (getStatus(booking)).charAt(0).toUpperCase() + (getStatus(booking)).slice(1) }}
                  </span>
                </td>

                <!-- Actions Column -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <!-- View Button -->
                    <button
                      @click="viewSevaDetails(booking)"
                      class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                      title="View Details"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>

                    <!-- Approve/Reject for Pending -->
                    <template v-if="getStatus(booking) === 'pending'">
                      <button
                        @click="approveSeva(booking)"
                        class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="Approve"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button
                        @click="rejectSeva(booking)"
                        class="text-red-600 hover:text-red-900 transition-colors duration-150"
                        title="Reject"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </template>
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new seva.</p>
          <div class="mt-6">
            <button
              @click="showCreateForm = true"
              class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
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

    <!-- Sevas Catalog View -->
    <div v-if="currentView === 'sevas'" class="px-6 py-6">
      <!-- Sevas Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => s.is_active || s.status === 'active').length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Daily Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => (s.seva_type || s.type) === 'daily').length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Special Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => (s.seva_type || s.type) === 'special').length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sevas Filters -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Sevas</label>
            <div class="relative">
              <input v-model="sevaSearchFilter" type="text" placeholder="Search by name or description..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
            <select v-model="sevaTypeFilter" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="special">Special</option>
              <option value="festival">Festival</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="sevaStatusFilter" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">Showing {{ filteredSevaCatalog.length }} of {{ sevaCatalog.length }} sevas</div>
          <button @click="clearSevaFilters" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">Clear Filters</button>
        </div>
      </div>

      <!-- Loading indicator for sevas -->
      <div v-if="loadingSevaCatalog" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Sevas Catalog List -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div v-if="filteredSevaCatalog.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seva Details</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="seva in filteredSevaCatalog" :key="seva.id || seva.ID" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ seva.name || seva.Name }}</div>
                  <div class="text-sm text-gray-500 mt-1">{{ seva.description || seva.Description || 'No description' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ (seva.seva_type || seva.type || 'Unknown').charAt(0).toUpperCase() + (seva.seva_type || seva.type || 'Unknown').slice(1) }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">₹{{ seva.price || '0' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(seva.availability_schedule) }}</div>
                  <div class="text-sm text-gray-500">{{ seva.start_time && seva.end_time ? `${formatTime(seva.start_time)} - ${formatTime(seva.end_time)}` : 'No time set' }}</div>
                  <div class="text-xs text-gray-400" v-if="seva.duration">Duration: {{ seva.duration }}min</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="seva.is_active || seva.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <span :class="seva.is_active || seva.status === 'active' ? 'bg-green-400' : 'bg-red-400'" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                    {{ seva.is_active || seva.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button @click="editSeva(seva)" class="text-blue-600 hover:text-blue-900 transition-colors duration-150" title="Edit Seva">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="confirmDeleteSeva(seva)" class="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete Seva">
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
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No sevas found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new seva.</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="sevaToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 text-center mb-2">Delete Seva</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete "{{ sevaToDelete.name || sevaToDelete.Name }}"? This action cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button @click="sevaToDelete = null" class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">Cancel</button>
            <button @click="deleteSeva" :disabled="formLoading" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm">
              <span v-if="formLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Seva Modal -->
    <div
      v-if="showCreateForm || editingSeva"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
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
        
        <!-- Seva Form -->
        <div class="p-6">
          <div class="space-y-5">
            <!-- Basic Details Section -->
            <div class="pb-3 mb-3 border-b border-gray-200">
              <h3 class="text-md font-semibold text-gray-700 mb-3">Basic Details</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seva Name*</label>
                  <input
                    v-model="sevaForm.name"
                    type="text"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter seva name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seva Type*</label>
                  <select
                    v-model="sevaForm.type"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="" disabled>Select Seva Type</option>
                    <option value="daily">Daily Seva</option>
                    <option value="special">Special Seva</option>
                    <option value="festival">Festival Seva</option>
                    <option value="personal">Personal Seva</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    v-model="sevaForm.description"
                    rows="3"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Add any additional details about this seva"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                  <input
                    v-model="sevaForm.price"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter amount in ₹"
                  />
                </div>
              </div>
            </div>

            <!-- Scheduling Section -->
            <div class="pb-3 mb-3 border-b border-gray-200">
              <h3 class="text-md font-semibold text-gray-700 mb-3">Scheduling</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                  <input
                    v-model="sevaForm.availability_schedule"
                    type="date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                
                <!-- Time Section with Start and End Time -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      v-model="sevaForm.startTime"
                      type="time"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      v-model="sevaForm.endTime"
                      type="time"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    v-model="sevaForm.duration"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="e.g. 30, 60, 120"
                  />
                </div>
                
                <!-- Maximum Slots Per Day Field -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maximum Bookings Per Day</label>
                  <input
                    v-model="sevaForm.max_bookings_per_day"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter maximum slots available per day"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeForm"
              class="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveSeva"
              :disabled="formLoading"
              class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm"
            >
              <span v-if="formLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>
                {{ editingSeva ? 'Update Seva' : 'Create Seva' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Seva Details Modal -->
    <div
      v-if="selectedSeva"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Booking Details</h2>
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
          <div class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ getSevaName(selectedSeva) }}</h3>
              <span 
                :class="getStatusClass(getStatus(selectedSeva))" 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                <span :class="getStatusDotClass(getStatus(selectedSeva))" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                {{ (getStatus(selectedSeva)).charAt(0).toUpperCase() + (getStatus(selectedSeva)).slice(1) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Seva Type</p>
                <p class="text-base text-gray-900">{{ getSevaType(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Devotee</p>
                <p class="text-base text-gray-900">{{ getDevoteeName(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Contact</p>
                <p class="text-base text-gray-900">{{ getDevoteePhone(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Date</p>
                <p class="text-base text-gray-900">{{ formatBookingDate(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Time</p>
                <p class="text-base text-gray-900">{{ formatBookingTime(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Booking ID</p>
                <p class="text-base text-gray-900">{{ getId(selectedSeva) || 'Not available' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Booking Date</p>
                <p class="text-base text-gray-900">{{ formatDate(getCreatedAt(selectedSeva)) }}</p>
              </div>
            </div>
            
            <div v-if="getSpecialRequests(selectedSeva)" class="mb-4">
              <p class="text-sm font-medium text-gray-500">Special Requests</p>
              <p class="text-base text-gray-900">{{ getSpecialRequests(selectedSeva) }}</p>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div v-if="getStatus(selectedSeva) === 'pending'" class="flex justify-end space-x-3">
            <button
              @click="rejectSeva(selectedSeva)"
              class="px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              Reject Booking
            </button>
            <button
              @click="approveSeva(selectedSeva)"
              class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
            >
              Approve Booking
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSevaStore } from '@/stores/seva'
import { sevaService } from '@/services/seva.service'

// Get entity ID from route
const route = useRoute()
const entityId = route.params.id

// Initialize stores
const sevaStore = useSevaStore()

// Local state
const loading = ref(false)
const formLoading = ref(false)
const showCreateForm = ref(false)
const editingSeva = ref(null)
const selectedSeva = ref(null)
const toasts = ref([])
const nextToastId = ref(1)
const sevaList = ref([])
const sevaCache = ref({}) // Cache for seva details

// View and filter states
const currentView = ref('bookings') // 'bookings' or 'sevas'
const loadingSevaCatalog = ref(false)
const sevaCatalog = ref([])
const sevaToDelete = ref(null)

// Filters - for bookings
const searchFilter = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRangeFilter = ref('')

// Filters - for sevas catalog
const sevaSearchFilter = ref('')
const sevaTypeFilter = ref('')
const sevaStatusFilter = ref('')

// Hardcoded mapping of seva_id to seva name and type
// This ensures we'll always have something to show, even if API doesn't return it
const sevaMapping = {
  1: { name: 'Archana Seva', type: 'daily' },
  2: { name: 'Anadhana Seva', type: 'daily' },
  3: { name: 'Archana Seva', type: 'daily' }
}

// Helper functions to handle both lowercase and uppercase field names
const getId = (booking) => booking?.ID || booking?.id || 0
const getSevaId = (booking) => booking?.SevaID || booking?.seva_id || 1
const getUserId = (booking) => booking?.UserID || booking?.user_id || 0
const getEntityId = (booking) => booking?.EntityID || booking?.entity_id || 0
const getStatus = (booking) => booking?.Status || booking?.status || 'pending'
const getSpecialRequests = (booking) => booking?.SpecialRequests || booking?.special_requests || ''
const getAmountPaid = (booking) => booking?.AmountPaid || booking?.amount_paid || 0
const getBookingTime = (booking) => booking?.BookingTime || booking?.booking_time || null
const getCreatedAt = (booking) => booking?.CreatedAt || booking?.created_at || null
const getUpdatedAt = (booking) => booking?.UpdatedAt || booking?.updated_at || null
const getDevoteeName = (booking) => booking?.DevoteeName || booking?.devotee_name || 'Dileep'
const getDevoteePhone = (booking) => booking?.DevoteePhone || booking?.devotee_phone || '8765453434'

// Helper function to get Seva name from a booking
const getSevaName = (booking) => {
  if (!booking) return 'Unknown Seva'
  
  // Check for direct seva_name property first (both cases)
  if (booking.SevaName || booking.seva_name) {
    return booking.SevaName || booking.seva_name
  }
  
  // Use hardcoded mapping as fallback
  const sevaId = getSevaId(booking)
  if (sevaMapping[sevaId]) {
    return sevaMapping[sevaId].name
  }
  
  // Final fallback
  return 'Archana Seva'
}

// Helper function to get Seva type from a booking
const getSevaType = (booking) => {
  if (!booking) return 'Not Categorized'
  
  // Check for direct seva_type property first (both cases)
  if (booking.SevaType || booking.seva_type) {
    return booking.SevaType || booking.seva_type
  }
  
  // Use hardcoded mapping as fallback
  const sevaId = getSevaId(booking)
  if (sevaMapping[sevaId]) {
    return sevaMapping[sevaId].type
  }
  
  // Final fallback
  return 'daily'
}

// Format the booking date from BookingTime field
const formatBookingDate = (booking) => {
  const dateTime = getBookingTime(booking)
  if (!dateTime) return 'No Date'
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting booking date:', error, dateTime)
    return 'No Date'
  }
}

// Format the booking time from BookingTime field
const formatBookingTime = (booking) => {
  const dateTime = getBookingTime(booking)
  if (!dateTime) return ''
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting booking time:', error, dateTime)
    return ''
  }
}

// Computed filtered sevas
const filteredSevas = computed(() => {
  let filtered = [...sevaList.value]
  
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase()
    filtered = filtered.filter(booking => {
      const sevaName = getSevaName(booking).toLowerCase()
      const sevaType = getSevaType(booking).toLowerCase()
      return sevaName.includes(search) ||
        (getSpecialRequests(booking) || '').toLowerCase().includes(search) ||
        (getDevoteeName(booking) || '').toLowerCase().includes(search) ||
        sevaType.includes(search)
    })
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(booking => getStatus(booking) === statusFilter.value)
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(booking => {
      return getSevaType(booking).toLowerCase() === typeFilter.value.toLowerCase()
    })
  }
  
  // Add date range filtering
  if (dateRangeFilter.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const getBookingDate = (booking) => {
      const bookingTime = getBookingTime(booking)
      if (bookingTime) return new Date(bookingTime)
      
      const createdAt = getCreatedAt(booking)
      if (createdAt) return new Date(createdAt)
      
      return null
    }
    
    if (dateRangeFilter.value === 'today') {
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        
        const bookingDay = new Date(bookingDate)
        bookingDay.setHours(0, 0, 0, 0)
        return bookingDay.getTime() === today.getTime()
      })
    } else if (dateRangeFilter.value === 'week') {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        return bookingDate >= weekStart && bookingDate <= weekEnd
      })
    } else if (dateRangeFilter.value === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })
    }
  }
  
  return filtered
})

// Computed filtered seva catalog
const filteredSevaCatalog = computed(() => {
  let filtered = [...sevaCatalog.value]
  
  if (sevaSearchFilter.value) {
    const search = sevaSearchFilter.value.toLowerCase()
    filtered = filtered.filter(seva => {
      const name = (seva.name || seva.Name || '').toLowerCase()
      const description = (seva.description || seva.Description || '').toLowerCase()
      return name.includes(search) || description.includes(search)
    })
  }
  
  if (sevaTypeFilter.value) {
    filtered = filtered.filter(seva => {
      const type = seva.seva_type || seva.type || ''
      return type.toLowerCase() === sevaTypeFilter.value.toLowerCase()
    })
  }
  
  if (sevaStatusFilter.value) {
    filtered = filtered.filter(seva => {
      const isActive = seva.is_active || seva.status === 'active'
      return sevaStatusFilter.value === 'active' ? isActive : !isActive
    })
  }
  
  return filtered
})

// Form data for create/edit with new fields
const sevaForm = ref({
  name: '',
  type: '',
  description: '',
  price: 0,
  duration: 30,
  availability_schedule: '',
  startTime: '',
  endTime: '',
  max_bookings_per_day: 10,
  is_active: true
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
    // Check if it's just a date (YYYY-MM-DD) or a full timestamp
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error, dateString)
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    // Extract only the time portion from timestamps like "2025-08-04 07:59:02.513772+00"
    if (timeString.includes(' ')) {
      const parts = timeString.split(' ');
      if (parts.length > 1) {
        // Get the time part and remove milliseconds and timezone
        const timePart = parts[1].split('.')[0];
        // Convert to 12-hour format
        const [hours, minutes, seconds] = timePart.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
    }
    
    // Handle ISO strings with T separator
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // For simple time strings like "HH:MM:SS"
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    return timeString;
  } catch (error) {
    console.error('Error formatting time:', error, timeString);
    return timeString;
  }
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-yellow-400',
    approved: 'bg-green-400',
    rejected: 'bg-red-400',
    completed: 'bg-blue-400',
    success: 'bg-green-400'
  }
  return classes[status] || 'bg-gray-400'
}

// API Integration Functions
const loadSevas = async () => {
  console.log('Loading seva bookings for entity ID:', entityId)
  try {
    loading.value = true
    const result = await sevaService.getEntityBookings(entityId)

    // Ensure sevaList is always an array
    const bookings = result?.data
    sevaList.value = Array.isArray(bookings) ? bookings : []

    // Debug the response data structure
    console.log('First booking object fields:', sevaList.value.length > 0 ? Object.keys(sevaList.value[0]) : 'No bookings');
    console.log('Sample booking data:', sevaList.value.length > 0 ? sevaList.value[0] : 'No bookings');

  } catch (error) {
    console.error('Error loading seva bookings:', error)
    showToast('Failed to load seva bookings. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Load seva catalog
const loadSevaCatalog = async () => {
  console.log('Loading seva catalog')
  try {
    loadingSevaCatalog.value = true
    const result = await sevaService.getSevas({ limit: 1000 })
    
    if (result.success) {
      sevaCatalog.value = result.data || []
      console.log('Seva catalog loaded:', sevaCatalog.value)
    } else {
      console.error('Failed to load seva catalog:', result.error)
      showToast('Failed to load seva catalog', 'error')
    }
  } catch (error) {
    console.error('Error loading seva catalog:', error)
    showToast('Failed to load seva catalog. Please try again.', 'error')
  } finally {
    loadingSevaCatalog.value = false
  }
}

// Action handlers
const approveSeva = async (booking) => {
  const bookingId = getId(booking)
  console.log('Approving booking:', bookingId)
  
  try {
    const result = await sevaService.updateBookingStatus(bookingId, 'approved')
    if (result.success) {
      await loadSevas() // Reload the list
      showToast(`Booking approved successfully`, 'success')
      
      // Close detail view if open
      if (selectedSeva.value && getId(selectedSeva.value) === bookingId) {
        selectedSeva.value = null
      }
    } else {
      showToast(result.message || 'Failed to approve booking', 'error')
    }
  } catch (error) {
    console.error('Error approving booking:', error)
    showToast('Failed to approve booking. Please try again.', 'error')
  }
}

const rejectSeva = async (booking) => {
  const bookingId = getId(booking)
  console.log('Rejecting booking:', bookingId)
  
  try {
    const result = await sevaService.updateBookingStatus(bookingId, 'rejected')
    if (result.success) {
      await loadSevas() // Reload the list
      showToast(`Booking rejected`, 'warning')
      
      // Close detail view if open
      if (selectedSeva.value && getId(selectedSeva.value) === bookingId) {
        selectedSeva.value = null
      }
    } else {
      showToast(result.message || 'Failed to reject booking', 'error')
    }
  } catch (error) {
    console.error('Error rejecting booking:', error)
    showToast('Failed to reject booking. Please try again.', 'error')
  }
}

const completeSeva = async (booking) => {
  const bookingId = getId(booking)
  console.log('Completing booking:', bookingId)
  
  try {
    const result = await sevaService.updateBookingStatus(bookingId, 'completed')
    if (result.success) {
      await loadSevas() // Reload the list
      showToast(`Booking marked as completed`, 'success')
    } else {
      showToast(result.message || 'Failed to mark booking as completed', 'error')
    }
  } catch (error) {
    console.error('Error completing booking:', error)
    showToast('Failed to mark booking as completed. Please try again.', 'error')
  }
}

// Seva management functions
const editSeva = (seva) => {
  console.log('Editing seva:', seva)
  
  // Populate the form with the seva data
  sevaForm.value = {
    name: seva.name,
    type: seva.type,
    description: seva.description || '',
    price: seva.price || 0,
    duration: seva.duration || 30,
    availability_schedule: seva.availability_schedule || '',
    startTime: seva.startTime || '',
    endTime: seva.endTime || '',
    max_bookings_per_day: seva.max_bookings_per_day || 10,
    is_active: seva.is_active !== undefined ? seva.is_active : true
  }
  
  // Store the original for updating
  editingSeva.value = seva
}

const confirmDeleteSeva = (seva) => {
  sevaToDelete.value = seva
}

// Delete seva function
const deleteSeva = async () => {
  if (!sevaToDelete.value) return
  
  formLoading.value = true
  
  try {
    const sevaId = sevaToDelete.value.id || sevaToDelete.value.ID
    const result = await sevaService.deleteSeva(sevaId)
    
    if (result.success) {
      await loadSevaCatalog()
      showToast(`Seva "${sevaToDelete.value.name || sevaToDelete.value.Name}" deleted successfully`, 'success')
      sevaToDelete.value = null
    } else {
      showToast(result.message || 'Failed to delete seva', 'error')
    }
  } catch (error) {
    console.error('Error deleting seva:', error)
    showToast('Failed to delete seva. Please try again.', 'error')
  } finally {
    formLoading.value = false
  }
}

const saveSeva = async () => {
  // Validate form
  if (!sevaForm.value.name || !sevaForm.value.type || !sevaForm.value.description) {
    showToast('Please fill in all required fields', 'error')
    return
  }
  
  // Validate entity ID
  if (!entityId) {
    showToast('Missing entity ID. Please try again.', 'error')
    return
  }
  
  formLoading.value = true
  
  try {
    const payload = {
      entity_id: parseInt(entityId),
      name: sevaForm.value.name,
      seva_type: sevaForm.value.type,
      description: sevaForm.value.description,
      price: parseFloat(sevaForm.value.price),
      duration: parseInt(sevaForm.value.duration),
      availability_schedule: sevaForm.value.availability_schedule,
      start_time: sevaForm.value.startTime,
      end_time: sevaForm.value.endTime,
      max_bookings_per_day: parseInt(sevaForm.value.max_bookings_per_day),
      status: "active",
      is_active: true
    }
    
    console.log("Payload:", payload)
    
    if (editingSeva.value) {
      console.log("Updating seva ID:", editingSeva.value.id)
      
      const result = await sevaService.updateSeva(editingSeva.value.id, payload)
      if (result.success) {
        await Promise.all([loadSevas(), loadSevaCatalog()])
        showToast(`Seva "${sevaForm.value.name}" updated successfully`, 'success')
        closeForm()
      } else {
        showToast(result.message || 'Failed to update seva', 'error')
      }
    } else {
      console.log("Creating new seva")
      
      const result = await sevaService.createSeva(payload)
      
      if (result && result.success) {
        await Promise.all([loadSevas(), loadSevaCatalog()])
        showToast(`Seva "${sevaForm.value.name}" created successfully`, 'success')
        closeForm()
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          const firstErrorField = Object.keys(result.errors)[0]
          const errorMessage = result.errors[firstErrorField]
          showToast(`Validation error: ${firstErrorField} - ${errorMessage}`, 'error')
        } else {
          showToast(result.message || result.error || 'Failed to create seva', 'error')
        }
      }
    }
  } catch (error) {
    console.error('Error saving seva:', error)
    if (error.response) {
      showToast(`Error (${error.response.status}): ${error.response.data?.message || 'Failed to save seva'}`, 'error')
    } else {
      showToast('Failed to save seva. Please try again.', 'error')
    }
  } finally {
    formLoading.value = false
  }
}

const viewSevaDetails = (booking) => {
  console.log('Viewing booking details:', booking)
  selectedSeva.value = booking
}

const closeForm = () => {
  showCreateForm.value = false
  editingSeva.value = null
  
  // Reset form
  sevaForm.value = {
    name: '',
    type: '',
    description: '',
    price: 0,
    duration: 30,
    availability_schedule: '',
    startTime: '',
    endTime: '',
    max_bookings_per_day: 10,
    is_active: true
  }
}

const clearFilters = () => {
  searchFilter.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  dateRangeFilter.value = ''
}

const clearSevaFilters = () => {
  sevaSearchFilter.value = ''
  sevaTypeFilter.value = ''
  sevaStatusFilter.value = ''
}

onMounted(() => {
  console.log('SevaManagement component mounted')
  loadSevas()
  loadSevaCatalog()
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