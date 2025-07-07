<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Alert for errors -->
      <div v-if="authStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ authStore.error }}
      </div>
      
      <!-- Email Input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
          />
        </div>
      </div>
      
      <!-- Password Input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password"
          />
        </div>
      </div>
      
      <!-- Remember Me Checkbox -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember_me"
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="remember_me" class="ml-2 block text-sm text-gray-900">Remember me</label>
        </div>
        
        <div class="text-sm">
          <router-link to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </router-link>
        </div>
      </div>
      
      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span v-if="loading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </div>
      
      <!-- Register Link -->
      <div class="text-center">
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Don't have an account? Register
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const form = ref({
  email: '',
  password: ''
})
const rememberMe = ref(false)
const loading = ref(false)

// Get redirect path from URL if available
const redirectPath = computed(() => route.query.redirect || '')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    showToast('Please enter your email and password', 'error')
    return
  }
  
  loading.value = true
  
  try {
    // Call the login method from the auth store
    const result = await authStore.login(form.value)
    
    if (result.success) {
      showToast('Login successful!', 'success')
      
      // Redirect to the appropriate page
      const destination = redirectPath.value || result.redirectPath || '/'
      router.push(destination)
    } else {
      showToast(result.error || 'Login failed', 'error')
    }
  } catch (err) {
    console.error('Login error:', err)
    showToast('An unexpected error occurred', 'error')
  } finally {
    loading.value = false
  }
}
</script>