import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/plugins/axios'
import { USER_ROLES } from '@/utils/constants'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => {
    if (!user.value) return null
    
    // Handle both string roles and numeric role_id
    if (typeof user.value.role === 'string') {
      return user.value.role
    }
    
    // Map role_id to string role if needed
    const ROLE_MAP = {
      1: 'superadmin',
      2: 'templeadmin',
      3: 'devotee',
      4: 'volunteer'
    }
    
    return user.value.roleId ? ROLE_MAP[user.value.roleId] : null
  })
  
  const isTenant = computed(() => userRole.value === USER_ROLES.TENANT || userRole.value === 'templeadmin')
  const isDevotee = computed(() => userRole.value === USER_ROLES.DEVOTEE || userRole.value === 'devotee')
  
  // Initialize auth state
  const initialize = async () => {
    try {
      // If we have a token but no user data, try to fetch user
      if (token.value) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        
        const storedUser = localStorage.getItem('user_data')
        if (storedUser) {
          user.value = JSON.parse(storedUser)
        } else {
          // If needed, fetch user profile here
        }
      }
      
      return isAuthenticated.value
    } catch (err) {
      console.error('Auth initialization error:', err)
      logout()
      return false
    }
  }
  
  // Login action - connects to the Go backend
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      // Call the login endpoint
      const response = await api.post('/auth/login', credentials)
      
      // Extract data from response based on Go backend structure
      const { accessToken, refreshToken, user: userData } = response.data
      
      // Store auth data
      token.value = accessToken
      user.value = userData
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      // Determine where to redirect based on role
      let redirectPath = '/'
      if (userData.roleId === 1 || userData.role === 'superadmin') {
        redirectPath = '/superadmin/dashboard'
      } else if (userData.roleId === 2 || userData.role === 'templeadmin') {
        redirectPath = '/tenant/dashboard'
      } else if (userData.roleId === 3 || userData.role === 'devotee') {
        redirectPath = userData.entityId 
          ? `/entity/${userData.entityId}/devotee/dashboard` 
          : '/devotee/temple-selection'
      } else if (userData.roleId === 4 || userData.role === 'volunteer') {
        redirectPath = userData.entityId 
          ? `/entity/${userData.entityId}/volunteer/dashboard` 
          : '/volunteer/temple-selection'
      }
      
      return {
        success: true,
        user: userData,
        redirectPath
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.response?.data?.error || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // Logout action
  const logout = async () => {
    try {
      if (token.value) {
        // Optionally call logout endpoint
        // await api.post('/auth/logout')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state regardless
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      delete api.defaults.headers.common['Authorization']
      
      // Redirect to login
      router.push('/login')
    }
  }
  
  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isTenant,
    isDevotee,
    
    // Actions
    initialize,
    login,
    logout,
    
    // For backwards compatibility
    initializeAuth: initialize,
    clearError: () => { error.value = null }
  }
})