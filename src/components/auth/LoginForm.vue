<template>
  <BaseCard class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
      <p class="text-gray-600">Sign in to your temple management account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
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
          placeholder="Enter your password"
          :error="errors.password"
          required
          autocomplete="current-password"
        />
      </div>

      <!-- Forgot Password Link -->
      <div class="flex justify-end">
        <router-link 
          to="/forgot-password" 
          class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
        >
          Forgot password?
        </router-link>
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
        Sign In
      </BaseButton>

      <!-- Register Link -->
      <div class="text-center pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link 
            to="/register" 
            class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
          >
            Create Account
          </router-link>
        </p>
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success, error } = useToast()

const isLoading = ref(false)
const redirectPath = ref('')

const form = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: ''
})

const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !errors.value.email && 
         !errors.value.password
})

// Extract redirect parameter from URL on component mount
onMounted(() => {
  redirectPath.value = route.query.redirect || ''
  
  // For testing purposes, pre-fill email based on redirect path
  if (redirectPath.value === '/superadmin/dashboard') {
    form.value.email = 'admin@example.com'
  }
})

const validateForm = () => {
  errors.value = {}
  
  // Email validation
  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  // Password validation
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    // Pass the redirect parameter to the login function
    const result = await authStore.login(form.value, redirectPath.value)
    
    if (result.success) {
      success('Login successful! Welcome back.')
      
      // Debug: Log authentication state
      console.log('🔐 Auth Debug Info:')
      console.log('User:', result.user)
      console.log('User Role:', result.user?.role)
      console.log('Is Authenticated:', authStore.isAuthenticated)
      console.log('Dashboard Route:', authStore.dashboardRoute)
      console.log('Redirect Path:', result.redirectPath)
      
      // Use the redirect path from the login result
      const finalRedirectPath = result.redirectPath || authStore.dashboardRoute
      console.log('Final Redirect Path:', finalRedirectPath)
      
      router.push(finalRedirectPath)
    } else {
      error(result.message || 'Login failed. Please try again.')
    }
  } catch (err) {
    console.error('Login error:', err)
    error('An error occurred during login. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>