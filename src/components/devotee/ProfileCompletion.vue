<!-- src/components/devotee/ProfileCompletion.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Profile Completion</h2>
        <p class="text-sm text-gray-600 mt-1">
          Complete your profile to get the best temple experience
        </p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-indigo-600">{{ completionPercentage }}%</div>
        <div class="text-xs text-gray-500">Complete</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Overall Progress</span>
        <span class="text-sm text-gray-500">{{ completedSteps.filter(s => s.completed).length }} of {{ totalSteps }} steps</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div 
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${completionPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Step Indicators -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="step in completedSteps" 
        :key="step.step"
        class="flex items-center p-3 rounded-xl border transition-all duration-200 hover:shadow-sm"
        :class="[
          step.completed 
            ? 'bg-indigo-50 border-indigo-200' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        ]"
      >
        <!-- Step Icon -->
        <div class="flex-shrink-0 mr-3">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200"
            :class="[
              step.completed 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-300 text-gray-600'
            ]"
          >
            <svg 
              v-if="step.completed" 
              class="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fill-rule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clip-rule="evenodd" 
              />
            </svg>
            <span v-else>{{ step.step }}</span>
          </div>
        </div>

        <!-- Step Info -->
        <div class="flex-grow min-w-0">
          <h3 
            class="text-sm font-medium truncate"
            :class="step.completed ? 'text-indigo-900' : 'text-gray-700'"
          >
            {{ step.name }}
          </h3>
          <p 
            class="text-xs mt-1"
            :class="step.completed ? 'text-indigo-600' : 'text-gray-500'"
          >
            {{ step.completed ? 'Completed' : 'Pending' }}
          </p>
        </div>

        <!-- Action Button -->
        <div class="flex-shrink-0 ml-2">
          <button 
            @click="$emit('go-to-step', step.step)"
            class="px-3 py-1 text-xs rounded-lg font-medium transition-colors duration-200"
            :class="[
              step.completed 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            ]"
          >
            {{ step.completed ? 'Edit' : 'Complete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Completion Status -->
    <div v-if="isProfileComplete" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fill-rule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clip-rule="evenodd" 
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Profile Complete!</h3>
          <p class="text-sm text-green-700 mt-1">
            Great! Your profile is now complete and you can access all temple features.
          </p>
        </div>
      </div>
    </div>

    <!-- Incomplete Reminder -->
    <div v-else-if="incompleteSteps.length > 0" class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fill-rule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clip-rule="evenodd" 
            />
          </svg>
        </div>
        <div class="ml-3 flex-grow">
          <h3 class="text-sm font-medium text-amber-800">Complete Your Profile</h3>
          <p class="text-sm text-amber-700 mt-1">
            You have {{ incompleteSteps.length }} {{ incompleteSteps.length === 1 ? 'step' : 'steps' }} remaining. 
            Complete them to unlock all features.
          </p>
        </div>
        <div class="ml-3 flex-shrink-0">
          <button 
            @click="$emit('go-to-step', incompleteSteps[0].step)"
            class="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDevoteeStore } from '@/stores/devotee'
import { storeToRefs } from 'pinia'

// Emits
defineEmits(['go-to-step'])

// Store
const devoteeStore = useDevoteeStore()
const { 
  completionPercentage, 
  isProfileComplete, 
  completedSteps, 
  incompleteSteps, 
  totalSteps 
} = storeToRefs(devoteeStore)
</script>