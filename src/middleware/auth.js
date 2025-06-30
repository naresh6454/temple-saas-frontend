import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

/**
 * Authentication middleware
 * Checks if the user is authenticated and redirects to login if not
 */
export default function authMiddleware(to, from, next) {
  const authStore = useAuthStore()
  const toast = useToast()
  
  // Skip authentication check for routes that don't require it
  if (!to.meta.requiresAuth) {
    return next()
  }
  
  // Check if the user is authenticated
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to access this page')
    
    // Redirect to login with the original route as a redirect parameter
    return next({ 
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  }
  
  // User is authenticated, proceed
  next()
}