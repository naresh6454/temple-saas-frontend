<template>
  <BaseCard class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
      <p class="text-gray-600">Join our temple management platform</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-6">
      <!-- Full Name Field -->
      <div>
        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <BaseInput
          id="fullName"
          v-model="form.fullName"
          type="text"
          placeholder="Enter your full name"
          :error="errors.fullName"
          required
          autocomplete="name"
        />
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <BaseInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          :error="errors.email"
          required
          autocomplete="email"
        />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <BaseInput
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a strong password"
          :error="errors.password"
          required
          autocomplete="new-password"
        />
        <PasswordStrengthMeter 
          :password="form.password" 
          class="mt-2"
        />
      </div>

      <!-- Phone Field (Optional) -->
      <!-- <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span class="text-gray-500 text-xs">(Optional)</span>
        </label>
        <BaseInput
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="Enter your phone number"
          :error="errors.phone"
          autocomplete="tel"
        />
      </div> -->

      <!-- Role Selector -->
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
          I want to join as
        </label>
        <RoleSelector
          v-model="form.role"
          :error="errors.role"
          required
        />
      </div>

      <!-- Terms and Privacy -->
      <div class="flex items-start">
        <input
          id="terms"
          v-model="form.acceptTerms"
          type="checkbox"
          class="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
        />
        <label for="terms" class="ml-3 text-sm text-gray-700">
          I agree to the 
          <router-link to="/terms" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Terms of Service
          </router-link>
          and 
          <router-link to="/privacy" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Privacy Policy
          </router-link>
        </label>
      </div>
      <div v-if="errors.acceptTerms" class="text-red-600 text-sm">
        {{ errors.acceptTerms }}
      </div>

      <!-- Submit Button -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        :disabled="!isFormValid"
        class="w-full"
      >
        Create Account
      </BaseButton>

      <!-- Login Link -->
      <div class="text-center pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Already have an account?
          <router-link 
            to="/login" 
            class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
          >
            Sign In
          </router-link>
        </p>
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import RoleSelector from '@/components/auth/RoleSelector.vue'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()


const isLoading = ref(false)
const form = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  acceptTerms: false
})

const errors = ref({})

const isFormValid = computed(() => {
  return form.value.fullName && 
         form.value.email && 
         form.value.password && 
         form.value.role &&
         form.value.acceptTerms &&
         Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}
  
  // Full name validation
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required'
  } else if (form.value.fullName.trim().length < 2) {
    errors.value.fullName = 'Full name must be at least 2 characters'
  }
  
  // Email validation
  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  // Password validation
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }
  
  // Phone validation (optional)
  if (form.value.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Please enter a valid phone number'
  }
  
  // Role validation
  if (!form.value.role) {
    errors.value.role = 'Please select your role'
  }
  
  // Terms validation
  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = 'You must accept the terms and privacy policy'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const result = await authStore.register(form.value)
    
    if (result.success) {
      // Different messages based on role
      const message = form.value.role === 'tenant' 
        ? 'Thanks for registering! You\'ll be notified after approval.'
        : 'Welcome! You can now join a temple and complete your profile.'
      
      success(message) // ✅

      
      // Redirect to login page for now
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error(result.message || 'Registration failed. Please try again.') // ✅

    }
  } catch (error) {
    console.error('Registration error:', error)
    error('An error occurred during registration. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>