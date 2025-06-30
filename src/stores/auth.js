// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/plugins/axios'
import { USER_ROLES, USER_STATUS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)
  const loading = ref(false) // Added for compatibility with new sections
  const error = ref(null)
  const isInitialized = ref(false)

  // Getters (Computed)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const userRole = computed(() => user.value?.role || null)
  
  const isTenant = computed(() => userRole.value === USER_ROLES.TENANT)
  const isDevotee = computed(() => userRole.value === USER_ROLES.DEVOTEE)
  const isVolunteer = computed(() => userRole.value === USER_ROLES.VOLUNTEER)
  const isSuperAdmin = computed(() => userRole.value === USER_ROLES.SUPER_ADMIN || userRole.value === 'superadmin')
  
  const isApproved = computed(() => user.value?.status === USER_STATUS.APPROVED)
  const isPending = computed(() => user.value?.status === USER_STATUS.PENDING)
  const isRejected = computed(() => user.value?.status === USER_STATUS.REJECTED)
  
  const canAccessDashboard = computed(() => {
    if (!isAuthenticated.value) return false
    
    // Super Admin can always access
    if (isSuperAdmin.value) return true
    
    // Tenants need approval to access dashboard
    if (isTenant.value) return isApproved.value
    
    // Devotees and Volunteers can access after registration
    return isDevotee.value || isVolunteer.value
  })

  const userDisplayName = computed(() => {
    if (!user.value) return ''
    return user.value.fullName || user.value.email
  })

  // 🔥 FIXED: Proper role-based dashboard routing
  const dashboardRoute = computed(() => {
    if (!canAccessDashboard.value) return '/'
    
    // Super Admin dashboard
    if (isSuperAdmin.value) return '/superadmin/dashboard'
    
    // Tenant dashboard
    if (isTenant.value) return '/tenant/dashboard'
    
    // 🔥 FIX: Check if user has selected temple before routing to entity dashboard
    if (isDevotee.value) {
      if (user.value?.selectedTempleId) {
        return `/entity/${user.value.selectedTempleId}/devotee/dashboard`
      }
      // If no temple selected, redirect to temple selection
      return '/devotee/temple-selection'
    }
    
    if (isVolunteer.value) {
      if (user.value?.selectedTempleId) {
        return `/entity/${user.value.selectedTempleId}/volunteer/dashboard`
      }
      // If no temple selected, redirect to temple selection
      return '/volunteer/temple-selection'
    }
    
    // Default fallback
    return '/'
  })

  // 🔥 FIXED: Enhanced post-login redirect with proper role handling
  const getPostLoginRedirect = (requestedRedirect = null) => {
    if (!user.value) return '/'
    
    // If there's a specific redirect requested, validate it's allowed for this user
    if (requestedRedirect) {
      const isValidRedirect = validateRedirectForUser(requestedRedirect, user.value)
      if (isValidRedirect) {
        return requestedRedirect
      }
    }
    
    // Role-based default routing
    const role = user.value.role
    
    // Super Admin
    if (role === USER_ROLES.SUPER_ADMIN || role === 'superadmin') {
      return '/superadmin/dashboard'
    }
    
    // Tenant
    if (role === USER_ROLES.TENANT) {
      if (user.value.status === USER_STATUS.APPROVED) {
        return '/tenant/dashboard'
      } else {
        return '/tenant/pending-approval'
      }
    }
    
    // Devotee
    if (role === USER_ROLES.DEVOTEE) {
      if (user.value.selectedTempleId) {
        return `/entity/${user.value.selectedTempleId}/devotee/dashboard`
      }
      return '/devotee/temple-selection'
    }
    
    // Volunteer
    if (role === USER_ROLES.VOLUNTEER) {
      if (user.value.selectedTempleId) {
        return `/entity/${user.value.selectedTempleId}/volunteer/dashboard`
      }
      return '/volunteer/temple-selection'
    }
    
    // Default fallback
    return '/'
  }

  // Validate if a redirect is allowed for the current user
  const validateRedirectForUser = (redirect, userData) => {
    if (!userData || !redirect) return false
    
    const role = userData.role
    
    // Super Admin can access super admin routes
    if (redirect.startsWith('/superadmin/') && (role === USER_ROLES.SUPER_ADMIN || role === 'superadmin')) {
      return true
    }
    
    // Tenant can access tenant routes
    if (redirect.startsWith('/tenant/') && role === USER_ROLES.TENANT && userData.status === USER_STATUS.APPROVED) {
      return true
    }
    
    // Devotee can access devotee routes
    if (redirect.includes('/devotee/') && role === USER_ROLES.DEVOTEE) {
      return true
    }
    
    // Volunteer can access volunteer routes
    if (redirect.includes('/volunteer/') && role === USER_ROLES.VOLUNTEER) {
      return true
    }
    
    return false
  }

  // ENHANCED INITIALIZE AUTH - Combines both approaches
  const initializeAuth = async () => {
    if (isInitialized.value) return true
    
    try {
      loading.value = true
      isLoading.value = true
      
      // Check for existing token (both possible storage keys)
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const userData = localStorage.getItem('user_data')
      
      if (authToken && userData) {
        token.value = authToken
        user.value = JSON.parse(userData)
        
        // Set axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
        
        console.log('Auth initialized - User:', user.value)
        isInitialized.value = true
        return true
      }
      
      // If we have a token but no user data, try to fetch user
      if (authToken) {
        token.value = authToken
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
        await fetchUser()
        
        if (user.value) {
          console.log('Auth initialized via token - User:', user.value)
          isInitialized.value = true
          return true
        }
      }
      
      // If no token, check for demo/test superadmin in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - no auth token found')
      }
      
      isInitialized.value = true
      return false
    } catch (error) {
      console.error('Auth initialization error:', error)
      await logout()
      isInitialized.value = true
      return false
    } finally {
      loading.value = false
      isLoading.value = false
    }
  }

  // 🔥 ENHANCED LOGIN with proper role-based routing
  const login = async (credentials, redirectTo = null) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // For development/testing - hardcoded superadmin
      if (credentials.email === 'admin@temple.com' && credentials.password === 'admin123') {
        const superAdmin = {
          id: 1,
          fullName: 'Super Admin',
          email: 'admin@temple.com',
          role: 'superadmin',
          status: USER_STATUS.APPROVED,
          isActive: true,
          selectedTempleId: null,
          permissions: ['admin', 'read', 'write', 'delete', 'approve', 'reject']
        }
        
        const mockToken = 'mock-superadmin-token-' + Date.now()
        
        // Store auth data (both storage approaches)
        token.value = mockToken
        user.value = superAdmin
        localStorage.setItem('token', mockToken)
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_data', JSON.stringify(superAdmin))
        
        // Set axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`

        console.log('Super admin logged in:', superAdmin)
        
        // 🔥 FIXED: Use proper redirect logic
        const redirectUrl = getPostLoginRedirect(redirectTo)

        return {
          success: true,
          user: superAdmin,
          redirectTo: redirectUrl,
          message: 'Super admin login successful!'
        }
      }
      
      // 🔥 ENHANCED MOCK RESPONSE with better role detection
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
      
      let mockUser
      
      // Better role detection based on email patterns
      if (credentials.email.includes('admin@') || credentials.email.includes('superadmin@')) {
        mockUser = {
          id: 'u123',
          fullName: 'Super Admin',
          email: credentials.email,
          role: USER_ROLES.SUPER_ADMIN,
          status: USER_STATUS.APPROVED,
          permissions: ['admin', 'read', 'write', 'delete', 'approve', 'reject']
        }
      } else if (credentials.email.includes('tenant@') || credentials.email.includes('temple@')) {
        mockUser = {
          id: 'u124',
          fullName: 'Temple Admin',
          email: credentials.email,
          role: USER_ROLES.TENANT,
          status: USER_STATUS.APPROVED,
          temples: ['temple1', 'temple2'],
          permissions: ['read', 'write', 'admin']
        }
      } else if (credentials.email.includes('volunteer@')) {
        mockUser = {
          id: 'u125',
          fullName: 'Volunteer User',
          email: credentials.email,
          role: USER_ROLES.VOLUNTEER,
          status: USER_STATUS.APPROVED,
          selectedTempleId: 'temple1', // Mock: already selected temple
          permissions: ['read']
        }
      } else {
        // Default to devotee
        mockUser = {
          id: 'u126',
          fullName: 'Devotee User',
          email: credentials.email,
          role: USER_ROLES.DEVOTEE,
          status: USER_STATUS.APPROVED,
          selectedTempleId: null, // 🔥 FIX: Start with no temple selected
          permissions: ['read', 'write']
        }
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Store auth data (both storage approaches)
      token.value = mockToken
      user.value = mockUser
      localStorage.setItem('token', mockToken)
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`

      // 🔥 FIXED: Use proper redirect logic
      const redirectUrl = getPostLoginRedirect(redirectTo)

      console.log('Mock login successful:', {
        user: mockUser,
        redirectTo: redirectUrl
      })

      return {
        success: true,
        user: mockUser,
        redirectTo: redirectUrl,
        message: 'Mock login successful!'
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      console.error('Login error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 🔥 ENHANCED REGISTER with role-based post-registration flow
  const register = async (userData) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // MOCKED delay and response for UI testing without backend
      await new Promise((resolve) => setTimeout(resolve, 1000)) // simulate delay

      // Simulated registered user
      const newUser = {
        id: Date.now(),
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role || USER_ROLES.DEVOTEE,
        status: userData.role === USER_ROLES.TENANT ? USER_STATUS.PENDING : USER_STATUS.APPROVED,
        selectedTempleId: null // Start with no temple selected
      }

      // 🔥 FIXED: Don't auto-login after registration
      // Instead, return success with proper next steps
      let nextStep = '/login'
      let message = 'Registration successful! Please login to continue.'
      
      if (userData.role === USER_ROLES.TENANT) {
        message = 'Registration successful! Your account is pending approval. You will be notified via email.'
      }

      return {
        success: true,
        user: newUser,
        nextStep,
        message
      }
    } catch (err) {
      error.value = 'Mock registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint if needed
      if (token.value) {
        // await api.post('/auth/logout') // Uncomment when backend is ready
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear local state regardless of API call success
      user.value = null
      token.value = null
      
      // Remove from both possible storage locations
      localStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      delete api.defaults.headers.common['Authorization']
      
      console.log('User logged out')
    }
  }

  const forgotPassword = async (email) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      await api.post('/auth/forgot-password', { email })
      return { success: true, message: 'Password reset email sent!' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send reset email'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  const resetPassword = async (token, password, confirmPassword) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword
      })
      return { success: true, message: 'Password reset successful!' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Password reset failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    
    isLoading.value = true
    loading.value = true
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      
      // Update localStorage with fresh user data
      localStorage.setItem('user_data', JSON.stringify(response.data))
    } catch (err) {
      console.error('Failed to fetch user:', err)
      // If token is invalid, logout
      await logout()
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  const updateUser = async (updates) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put('/auth/profile', updates)
      user.value = { ...user.value, ...response.data }
      
      // Update localStorage with updated user data
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      return { success: true, user: user.value }
    } catch (err) {
      error.value = err.response?.data?.message || 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  const selectTemple = async (templeId) => {
    try {
      const response = await api.post('/auth/select-temple', { templeId })
      user.value = { ...user.value, selectedTempleId: templeId }
      
      // Update localStorage with updated user data
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to select temple'
      return { success: false, error: error.value }
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user.value || !user.value.permissions) return false
    return user.value.permissions.includes(permission)
  }

  // Initialize auth state on app load (alias for backward compatibility)
  const initialize = initializeAuth

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    loading, // Added for compatibility
    error,
    isInitialized,
    
    // Getters
    isAuthenticated,
    userRole,
    isTenant,
    isDevotee,
    isVolunteer,
    isSuperAdmin,
    isApproved,
    isPending,
    isRejected,
    canAccessDashboard,
    userDisplayName,
    dashboardRoute,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    fetchUser,
    updateUser,
    selectTemple,
    hasPermission,
    initialize,
    initializeAuth,
    clearError,
    getPostLoginRedirect,
    validateRedirectForUser
  }
})