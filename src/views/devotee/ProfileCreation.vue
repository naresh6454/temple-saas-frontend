<template>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
              <p class="text-gray-600 mt-1">Build your spiritual profile step by step</p>
            </div>
            <button
              @click="skipToEnd"
              class="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
            >
              Skip All →
            </button>
          </div>
          
          <!-- Progress Indicator -->
          <ProfileCompletion 
            :completion-percentage="completionPercentage"
            :current-step="currentStep"
            :total-steps="totalSteps"
          />
        </div>

        <!-- Step Navigation -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div class="px-6 py-4 border-b border-gray-100">
            <nav class="flex space-x-8 overflow-x-auto">
              <button
                v-for="(step, index) in steps"
                :key="step.id"
                @click="goToStep(index)"
                :class="[
                  'flex items-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  currentStep === index 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : step.completed 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-500 hover:bg-gray-50'
                ]"
              >
                <div :class="[
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                  currentStep === index 
                    ? 'bg-indigo-600 text-white' 
                    : step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-200 text-gray-500'
                ]">
                  <CheckIcon v-if="step.completed" class="w-3 h-3" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span>{{ step.title }}</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Form Container -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6">
            <!-- Step Content -->
            <div class="min-h-[400px]">
              <component 
                :is="currentStepComponent" 
                :key="currentStep"
                @next="nextStep"
                @previous="previousStep"
                @skip="skipStep"
                @update-data="updateStepData"
                :data="stepData[currentStep]"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
              <button
                @click="previousStep"
                :disabled="currentStep === 0"
                class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div class="flex items-center space-x-3">
                <button
                  @click="skipStep"
                  class="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                >
                  Skip This Step
                </button>
                
                <button
                  @click="nextStep"
                  :disabled="isLoading"
                  class="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <span v-if="isLoading">Saving...</span>
                  <span v-else-if="currentStep === totalSteps - 1">Complete Profile</span>
                  <span v-else>Next Step</span>
                  <ChevronRightIcon v-if="!isLoading" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-6 bg-indigo-50 rounded-xl p-6">
          <div class="flex items-start space-x-3">
            <InformationCircleIcon class="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <h3 class="text-sm font-medium text-indigo-900 mb-1">Need Help?</h3>
              <p class="text-sm text-indigo-700 mb-3">
                All steps are optional and can be completed later from your dashboard. 
                However, a complete profile helps temple administrators serve you better.
              </p>
              <button class="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDevoteeStore } from '@/stores/devotee'
import { useToast } from '@/composables/useToast'
import ProfileCompletion from '@/components/devotee/ProfileCompletion.vue'
import PersonalDetailsForm from '@/components/devotee/PersonalDetailsForm.vue'
import SpiritualInfoForm from '@/components/devotee/SpiritualInfoForm.vue'
import FamilyLineageForm from '@/components/devotee/FamilyLineageForm.vue'
import SevaPreferencesForm from '@/components/devotee/SevaPreferencesForm.vue'
import FamilyMembersForm from '@/components/devotee/FamilyMembersForm.vue'
import NotesAttachmentsForm from '@/components/devotee/NotesAttachmentsForm.vue'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon,
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

const router = useRouter()
const devoteeStore = useDevoteeStore()
const { showToast } = useToast()

// State
const currentStep = ref(0)
const isLoading = ref(false)
const stepData = ref({})

// Steps configuration
const steps = ref([
  { 
    id: 'personal', 
    title: 'Personal Details', 
    component: 'PersonalDetailsForm',
    completed: false 
  },
  { 
    id: 'spiritual', 
    title: 'Spiritual Info', 
    component: 'SpiritualInfoForm',
    completed: false 
  },
  { 
    id: 'lineage', 
    title: 'Family Lineage', 
    component: 'FamilyLineageForm',
    completed: false 
  },
  { 
    id: 'preferences', 
    title: 'Seva Preferences', 
    component: 'SevaPreferencesForm',
    completed: false 
  },
  { 
    id: 'family', 
    title: 'Family Members', 
    component: 'FamilyMembersForm',
    completed: false 
  },
  { 
    id: 'notes', 
    title: 'Notes & Attachments', 
    component: 'NotesAttachmentsForm',
    completed: false 
  }
])

// Computed
const totalSteps = computed(() => steps.value.length)

const currentStepComponent = computed(() => {
  const components = {
    PersonalDetailsForm,
    SpiritualInfoForm,
    FamilyLineageForm,
    SevaPreferencesForm,
    FamilyMembersForm,
    NotesAttachmentsForm
  }
  return components[steps.value[currentStep.value]?.component]
})

const completionPercentage = computed(() => {
  const completedSteps = steps.value.filter(step => step.completed).length
  return Math.round((completedSteps / totalSteps.value) * 100)
})

// Methods
const goToStep = (stepIndex) => {
  if (stepIndex >= 0 && stepIndex < totalSteps.value) {
    currentStep.value = stepIndex
  }
}

const nextStep = async () => {
  isLoading.value = true
  
  try {
    // Save current step data
    await saveStepData()
    
    // Mark current step as completed
    steps.value[currentStep.value].completed = true
    
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++
    } else {
      // Complete profile creation
      await completeProfile()
    }
  } catch (error) {
    showToast('Failed to save step data', 'error')
  } finally {
    isLoading.value = false
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skipStep = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  } else {
    skipToEnd()
  }
}

const skipToEnd = () => {
  router.push(`/entity/${devoteeStore.selectedTempleId}/devotee/dashboard`)
}

const updateStepData = (data) => {
  stepData.value[currentStep.value] = data
}

const saveStepData = async () => {
  const data = stepData.value[currentStep.value]
  if (data) {
    await devoteeStore.updateProfileStep(steps.value[currentStep.value].id, data)
  }
}

const completeProfile = async () => {
  await devoteeStore.completeProfile()
  showToast('Profile completed successfully!', 'success')
  router.push(`/entity/${devoteeStore.selectedTempleId}/devotee/dashboard`)
}

// Lifecycle
onMounted(() => {
  // Load existing profile data if any
  devoteeStore.loadProfileData().then((data) => {
    if (data) {
      stepData.value = data
      // Mark completed steps
      Object.keys(data).forEach((stepId) => {
        const stepIndex = steps.value.findIndex(s => s.id === stepId)
        if (stepIndex !== -1 && data[stepId]) {
          steps.value[stepIndex].completed = true
        }
      })
    }
  })
})
</script>