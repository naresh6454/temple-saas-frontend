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
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Event Image
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
          <div v-if="!form.imagePreview" class="space-y-2">
            <Upload class="mx-auto h-12 w-12 text-gray-400" />
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
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Associated Sevas -->
      <div>
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
              <Plus class="h-4 w-4 mr-2" />
              Browse
            </button>
          </div>

          <!-- Selected Sevas -->
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
                <X class="h-3 w-3" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-medium text-gray-900 mb-3 flex items-center">
          <Bell class="h-5 w-5 mr-2 text-indigo-500" />
          Notification Settings
        </h3>
        <div class="space-y-3">
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
        </div>
      </div>

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
          <Loader2 v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" />
          {{ isEdit ? 'Update Event' : 'Create Event' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Upload, X, Plus, Bell, Loader2 } from 'lucide-vue-next'

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

const isEdit = computed(() => !!props.event)
const imageInput = ref(null)
const sevaSearch = ref('')
const showSevaModal = ref(false)
const isSubmitting = ref(false)

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

const errors = reactive({
  title: '',
  type: '',
  date: '',
  time: '',
  description: ''
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
if (props.event) {
  Object.assign(form, {
    title: props.event.title || '',
    type: props.event.type || '',
    status: props.event.status || 'upcoming',
    date: props.event.date ? new Date(props.event.date).toISOString().split('T')[0] : '',
    time: props.event.date ? new Date(props.event.date).toTimeString().slice(0, 5) : '',
    location: props.event.location || '',
    description: props.event.description || '',
    imagePreview: props.event.image || null,
    attachedSevas: props.event.attachedSevas || [],
    notifyOnCreate: props.event.notifyOnCreate ?? true,
    reminderNotification: props.event.reminderNotification ?? true
  })
}

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
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
  }

  if (!form.time) {
    errors.time = 'Event time is required'
    isValid = false
  }

  if (!form.description.trim()) {
    errors.description = 'Event description is required'
    isValid = false
  }

  return isValid
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    form.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      form.imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
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
  if (!validateForm()) return

  isSubmitting.value = true
  
  try {
    const eventData = {
      ...form,
      date: new Date(`${form.date}T${form.time}`).toISOString()
    }
    
    emit('submit', eventData)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>