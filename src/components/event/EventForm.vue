<template>
  <div class="bg-white rounded-xl shadow-lg">
    <!-- Form Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEdit ? 'Edit Event' : 'Create New Event' }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ isEdit ? 'Update event details and notify devotees' : 'Plan a new temple event or festival' }}
          </p>
        </div>
        <div v-if="isEdit" class="flex items-center space-x-2">
          <span :class="statusBadgeClasses" class="px-3 py-1 rounded-full text-xs font-medium">
            {{ form.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
      <!-- Basic Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Event Title -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Event Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g., Maha Shivaratri Celebration"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
        </div>

        <!-- Event Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Event Type <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.type"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.type }"
          >
            <option value="">Select Event Type</option>
            <option value="festival">Festival</option>
            <option value="ceremony">Ceremony</option>
            <option value="spiritual">Spiritual Discourse</option>
            <option value="cultural">Cultural Program</option>
            <option value="community">Community Gathering</option>
            <option value="special">Special Occasion</option>
          </select>
          <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
        </div>

        <!-- Event Status -->
        <div v-if="isEdit">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            v-model="form.status"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Date and Time -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Event Date <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.date }"
          />
          <p v-if="errors.date" class="mt-1 text-sm text-red-600">{{ errors.date }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Event Time <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.time"
            type="time"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.time }"
          />
          <p v-if="errors.time" class="mt-1 text-sm text-red-600">{{ errors.time }}</p>
        </div>
      </div>

      <!-- Location -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          v-model="form.location"
          type="text"
          placeholder="e.g., Main Temple Hall, Garden Area"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <p class="mt-1 text-sm text-gray-500">Leave empty to default to "Temple Premises"</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Event Description <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Describe the event, its significance, schedule, and what devotees can expect..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.description }"
        ></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <!-- Event Image -->
      <!-- <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Event Image
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
          <div v-if="!form.imagePreview" class="space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div class="text-sm text-gray-600">
              <label class="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium">
                Upload an image
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
              </label>
              or drag and drop
            </div>
            <p class="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
          
          <div v-else class="relative">
            <img
              :src="form.imagePreview"
              alt="Event preview"
              class="mx-auto h-32 w-auto rounded-lg object-cover"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div> -->

      <!-- Associated Sevas -->
      <!-- <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Associated Sevas
        </label>
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <input
              v-model="sevaSearch"
              type="text"
              placeholder="Search sevas to attach..."
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              @click="showSevaModal = true"
              class="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Browse
            </button>
          </div>

          <div v-if="form.attachedSevas.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="seva in form.attachedSevas"
              :key="seva.id"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
            >
              {{ seva.name }}
              <button
                type="button"
                @click="removeSevaAttachment(seva.id)"
                class="ml-2 text-amber-600 hover:text-amber-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div> -->

      <!-- Notification Settings -->
      <!-- <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-medium text-gray-900 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notification Settings
        </h3> -->
        <!-- <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="form.notifyOnCreate"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-700">
              Notify all devotees when event is created
            </span>
          </label>
          <label class="flex items-center">
            <input
              v-model="form.reminderNotification"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-700">
              Send reminder notification 1 day before event
            </span>
          </label>
        </div> -->
      <!-- </div> -->

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="handleCancel"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
        >
          <svg v-if="isSubmitting" xmlns="http://www.w3.org/2000/svg" class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22c5.523 0 10-4.477 10-10h-2c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8v2M18.59 13.51l2.12-2.12-2.12-2.12M5.41 8.59l-2.12 2.12 2.12 2.12" />
          </svg>
          {{ isEdit ? 'Update Event' : 'Create Event' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useEventStore } from '@/stores/event'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  event: {
    type: Object,
    default: null
  },
  availableSevas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const eventStore = useEventStore()
const toast = useToast()

const isEdit = computed(() => !!props.event)
const imageInput = ref(null)
const sevaSearch = ref('')
const showSevaModal = ref(false)
const isSubmitting = ref(false)
const errors = reactive({})

const form = reactive({
  title: '',
  type: '',
  status: 'upcoming',
  date: '',
  time: '',
  location: '',
  description: '',
  image: null,
  imagePreview: null,
  attachedSevas: [],
  notifyOnCreate: true,
  reminderNotification: true
})

const statusBadgeClasses = computed(() => {
  const status = form.status?.toLowerCase()
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    case 'ongoing':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-gray-100 text-gray-700'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})

// Initialize form with event data if editing
onMounted(() => {
  if (props.event) {
    // Convert event data to the form structure
    let eventDate = '';
    let eventTime = '';
    
    if (props.event.eventDate) {
      const date = new Date(props.event.eventDate);
      eventDate = date.toISOString().split('T')[0];
      eventTime = date.toTimeString().slice(0, 5);
    }
    
    Object.assign(form, {
      title: props.event.title || '',
      type: props.event.type || '',
      status: getEventStatus(props.event) || 'upcoming',
      date: eventDate,
      time: eventTime,
      location: props.event.location || '',
      description: props.event.description || '',
      imagePreview: props.event.imageURL || null,
      attachedSevas: props.event.attachedSevas || [],
      notifyOnCreate: props.event.notifyOnCreate ?? true,
      reminderNotification: props.event.reminderNotification ?? true
    })
  } else {
    // Set default date to tomorrow for new events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.date = tomorrow.toISOString().split('T')[0];
    form.time = '18:00'; // Default time 6 PM
  }
})

// Helper to determine event status
function getEventStatus(event) {
  if (!event || !event.eventDate) return 'upcoming';
  
  const now = new Date();
  const eventDate = new Date(event.eventDate);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(eventDate);
  endDate.setHours(23, 59, 59); // End of the day
  
  if (now < eventDate) return 'upcoming';
  if (now >= eventDate && now <= endDate) return 'ongoing';
  return 'completed';
}

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  let isValid = true

  if (!form.title.trim()) {
    errors.title = 'Event title is required'
    isValid = false
  }

  if (!form.type) {
    errors.type = 'Event type is required'
    isValid = false
  }

  if (!form.date) {
    errors.date = 'Event date is required'
    isValid = false
  } else {
    // Validate date is not in the past
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today && !isEdit.value) {
      errors.date = 'Event date cannot be in the past'
      isValid = false
    }
  }

  if (!form.time) {
    errors.time = 'Event time is required'
    isValid = false
  }

  if (!form.description.trim()) {
    errors.description = 'Event description is required'
    isValid = false
  } else if (form.description.length < 10) {
    errors.description = 'Description is too short (minimum 10 characters)'
    isValid = false
  }

  return isValid
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size should be less than 5MB')
    return
  }

  form.image = file
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imagePreview = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.image = null
  form.imagePreview = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const removeSevaAttachment = (sevaId) => {
  form.attachedSevas = form.attachedSevas.filter(seva => seva.id !== sevaId)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the form errors before submitting')
    return
  }

  isSubmitting.value = true
  
  try {
    // Create event data for API
    const formData = new FormData()
    
    // Create proper event date from date + time inputs
    const eventDate = new Date(`${form.date}T${form.time}:00`)
    
    const eventData = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventDate: eventDate.toISOString(),
      location: form.location || 'Temple Premises',
      type: form.type,
      // These properties may need to be adjusted based on your backend API
      maxAttendees: 0,
      registrationRequired: false,
      isActive: true
    }
    
    // Add JSON data
    formData.append('data', JSON.stringify(eventData))
    
    // Add image if exists
    if (form.image) {
      formData.append('image', form.image)
    }
    
    let response;
    if (isEdit.value && props.event?.id) {
      response = await eventStore.updateEvent(props.event.id, formData);
      toast.success('Event updated successfully')
    } else {
      response = await eventStore.createEvent(formData);
      toast.success('Event created successfully')
    }
    
    emit('submit', response)
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error('Failed to save event. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>