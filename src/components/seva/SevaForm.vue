<template>
  <div class="bg-white rounded-xl shadow-lg p-6 transition-all duration-200">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ isEditing ? 'Edit Seva' : 'Create New Seva' }}
      </h2>
      <p class="text-gray-600">
        {{ isEditing ? 'Update seva details' : 'Add a new seva for devotees to book' }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Seva Name -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Seva Name *
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g., Abhisheka, Archana, Annadana"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            :class="{ 'border-red-500': errors.name }"
            required
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <!-- Seva Type -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Seva Type *
          </label>
          <select
            v-model="form.type"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            :class="{ 'border-red-500': errors.type }"
            required
          >
            <option value="">Select seva type</option>
            <option value="daily">Daily Seva</option>
            <option value="special">Special Seva</option>
            <option value="festival">Festival Seva</option>
            <option value="monthly">Monthly Seva</option>
            <option value="annual">Annual Seva</option>
          </select>
          <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Describe the seva, its significance, and what it includes..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
          :class="{ 'border-red-500': errors.description }"
          required
        ></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <!-- Pricing & Duration -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Price -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Price (₹) *
          </label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            :class="{ 'border-red-500': errors.price }"
            required
          />
          <p v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</p>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            v-model.number="form.duration"
            type="number"
            min="1"
            placeholder="30"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <!-- Max Bookings -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Max Bookings/Day
          </label>
          <input
            v-model.number="form.maxBookings"
            type="number"
            min="1"
            placeholder="10"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      <!-- Schedule Settings -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Schedule Settings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Available Days -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Available Days
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="day in weekDays" :key="day.value" class="flex items-center">
                <input
                  v-model="form.availableDays"
                  :value="day.value"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ day.label }}</span>
              </label>
            </div>
          </div>

          <!-- Time Slots -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Time Slots
            </label>
            <div class="space-y-2">
              <div v-for="(slot, index) in form.timeSlots" :key="index" class="flex gap-2">
                <input
                  v-model="slot.start"
                  type="time"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  v-model="slot.end"
                  type="time"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  v-if="form.timeSlots.length > 1"
                  @click="removeTimeSlot(index)"
                  type="button"
                  class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="addTimeSlot"
                type="button"
                class="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200"
              >
                + Add Time Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Status -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            v-model="form.status"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <!-- Requirements -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Special Requirements
          </label>
          <input
            v-model="form.requirements"
            type="text"
            placeholder="e.g., Fasting required, Bring flowers"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      <!-- Advanced Options Toggle -->
      <div class="border-t pt-6">
        <button
          @click="showAdvanced = !showAdvanced"
          type="button"
          class="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          <svg 
            class="w-4 h-4 mr-2 transform transition-transform duration-200"
            :class="{ 'rotate-180': showAdvanced }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          Advanced Options
        </button>

        <div v-if="showAdvanced" class="mt-4 space-y-4">
          <!-- Booking Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Advance Booking (days)
              </label>
              <input
                v-model.number="form.advanceBookingDays"
                type="number"
                min="0"
                max="365"
                placeholder="7"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Cancellation Hours
              </label>
              <input
                v-model.number="form.cancellationHours"
                type="number"
                min="0"
                max="168"
                placeholder="24"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          <!-- Checkbox Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="form.isRecurring"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Allow recurring bookings</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="form.requiresApproval"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Requires admin approval</span>
              </label>
            </div>

            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="form.allowMultipleBookings"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Allow multiple bookings per day</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="form.sendReminders"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Send booking reminders</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4 pt-6 border-t">
        <button
          @click="handleCancel"
          type="button"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Saving...' : (isEditing ? 'Update Seva' : 'Create Seva') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

// Props
const props = defineProps({
  sevaId: {
    type: [String, Number],
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// State
const router = useRouter()
const { showToast } = useToast()
const loading = ref(false)
const showAdvanced = ref(false)
const errors = ref({})

// Form data
const form = reactive({
  name: '',
  type: '',
  description: '',
  price: null,
  duration: 30,
  maxBookings: 10,
  availableDays: [],
  timeSlots: [{ start: '09:00', end: '10:00' }],
  status: 'active',
  requirements: '',
  advanceBookingDays: 7,
  cancellationHours: 24,
  isRecurring: false,
  requiresApproval: true,
  allowMultipleBookings: false,
  sendReminders: true
})

// Week days options
const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

// Computed
const isEditing = computed(() => props.sevaId !== null)

// Methods
const addTimeSlot = () => {
  form.timeSlots.push({ start: '09:00', end: '10:00' })
}

const removeTimeSlot = (index) => {
  form.timeSlots.splice(index, 1)
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.name.trim()) {
    errors.value.name = 'Seva name is required'
  }
  
  if (!form.type) {
    errors.value.type = 'Seva type is required'
  }
  
  if (!form.description.trim()) {
    errors.value.description = 'Description is required'
  }
  
  if (form.price === null || form.price < 0) {
    errors.value.price = 'Valid price is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showToast('Please fix the errors above', 'error')
    return
  }

  loading.value = true
  
  try {
    const payload = {
      ...form,
      timeSlots: form.timeSlots.filter(slot => slot.start && slot.end)
    }

    if (isEditing.value) {
      // Update existing seva
      await updateSeva(props.sevaId, payload)
      showToast('Seva updated successfully!', 'success')
    } else {
      // Create new seva
      await createSeva(payload)
      showToast('Seva created successfully!', 'success')
    }
    
    emit('submit', payload)
    
  } catch (error) {
    console.error('Error saving seva:', error)
    showToast('Failed to save seva. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  router.back()
}

// Mock API functions (replace with actual API calls)
const createSeva = async (data) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const updateSeva = async (id, data) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const loadSevaData = async () => {
  if (isEditing.value) {
    // Load existing seva data
    // Replace with actual API call
    Object.assign(form, props.initialData)
  }
}

// Lifecycle
onMounted(() => {
  loadSevaData()
})
</script>