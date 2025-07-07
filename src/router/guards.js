// src/router/guards.js
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

/**
 * Role mapping - map backend roles to frontend roles
 * This will handle the discrepancy between backend and frontend role names
 */
const roleMapping = {
  'templeadmin': 'tenant', // Backend returns 'templeadmin', but routes expect 'tenant'
}

/**
 * Get mapped role (or original if no mapping exists)
 */
function getMappedRole(role) {
  return roleMapping[role] || role
}

/**
 * Authentication Guard
 * Checks if user is authenticated before accessing protected routes
 */
export function requireAuth(to, from, next) {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        message: 'Please login to access this page'
      }
    })
    return false
  }
  
  next()
  return true
}

/**
 * Guest Guard
 * Redirects authenticated users away from guest-only pages (login, register)
 */
export function requireGuest(to, from, next) {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    // Use mapped role for redirection
    const mappedRole = getMappedRole(authStore.user?.role)
    const redirectPath = getDefaultRoute(mappedRole)
    next({ path: redirectPath })
    return false
  }
  
  next()
  return true
}

/**
 * Role-based Access Guard
 * Checks if user has required role to access the route
 */
export function requireRole(roles) {
  return (to, from, next) => {
    const authStore = useAuthStore()
    const { showToast } = useToast()
    
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    const userRole = authStore.user?.role
    const mappedRole = getMappedRole(userRole)
    
    // Check if mapped role is included in required roles
    if (!roles.includes(mappedRole)) {
      showToast(`Access denied: User has role "${userRole}" but route requires one of: ${roles.join(', ')}`, 'error')
      next({ name: 'Unauthorized' })
      return
    }
    
    next()
  }
}

/**
 * SPECIFIC GUARD: Check Role (for route files)
 * This is the specific function your route files are importing
 */
export function checkRole(to, from, next, requiredRole) {
  const authStore = useAuthStore()
  const { showToast } = useToast()
  
  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  const userRole = authStore.user?.role
  const mappedRole = getMappedRole(userRole)
  
  // Compare mapped role with required role
  if (mappedRole !== requiredRole) {
    showToast(`Access denied: User has role "${userRole}" but route requires: ${requiredRole}`, 'error')
    next({ name: 'Unauthorized' })
    return
  }
  
  next()
}

/**
 * SPECIFIC GUARD: Check Profile Completed (for devotee routes)
 * Ensures devotee has completed their profile before accessing certain features
 */
export function checkProfileCompleted(to, from, next) {
  const authStore = useAuthStore()
  const { showToast } = useToast()
  
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  
  const mappedRole = getMappedRole(authStore.user?.role)
  
  if (mappedRole !== 'devotee') {
    next({ name: 'Unauthorized' })
    return
  }
  
  // Check if profile is completed
  if (!authStore.user?.profileCompleted) {
    showToast('Please complete your profile first', 'warning')
    next({ name: 'ProfileCreation' })
    return
  }
  
  next()
}

/**
 * SPECIFIC GUARD: Check Temple Approved (for entity/temple features)
 * Ensures the temple is approved before accessing temple management features
 */
export function checkTempleApproved(to, from, next) {
  const authStore = useAuthStore()
  const { showToast } = useToast()
  const templeId = to.params.id
  
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  
  const mappedRole = getMappedRole(authStore.user?.role)
  
  // For tenant role
  if (mappedRole === 'tenant') {
    // Find the specific temple
    const temple = authStore.user?.temples?.find(t => t.id === templeId)
    
    if (!temple) {
      next({ name: 'Unauthorized' })
      return
    }
    
    if (temple.status !== 'APPROVED') {
      showToast('This temple is pending approval. Please wait for admin approval.', 'warning')
      next({ name: 'EntityDashboard', params: { id: templeId } })
      return
    }
  }
  
  next()
}

/**
 * Tenant Status Guard
 * Checks if tenant is approved before accessing tenant features
 */
export function requireApprovedTenant(to, from, next) {
  const authStore = useAuthStore()
  const { showToast } = useToast()
  
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  
  const mappedRole = getMappedRole(authStore.user?.role)
  
  if (mappedRole !== 'tenant') {
    next({ name: 'Unauthorized' })
    return
  }
  
  // DEVELOPMENT BYPASS: Skip approval check for templeadmin
  if (authStore.user?.role === 'templeadmin') {
    console.log("🔑 DEVELOPMENT: Bypassing approval check for templeadmin in route guard")
    next()
    return
  }
  
  if (authStore.user?.status !== 'APPROVED') {
    showToast('Your account is pending approval. Please wait for admin approval.', 'warning')
    next({ name: 'TenantDashboard' })
    return
  }
  
  next()
}

/**
 * Temple Access Guard
 * Checks if user has access to specific temple
 */
export function requireTempleAccess(to, from, next) {
  const authStore = useAuthStore()
  const templeId = to.params.id
  
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  
  const mappedRole = getMappedRole(authStore.user?.role)
  
  // For tenant - check if they own the temple
  if (mappedRole === 'tenant') {
    // DEVELOPMENT BYPASS: Skip temple ownership check for templeadmin
    if (authStore.user?.role === 'templeadmin') {
      console.log("🔑 DEVELOPMENT: Bypassing temple ownership check for templeadmin")
      next()
      return
    }
    
    const hasAccess = authStore.user?.temples?.some(temple => temple.id === templeId)
    if (!hasAccess) {
      next({ name: 'Unauthorized' })
      return
    }
  }
  
  // For devotee/volunteer - check if they're associated with the temple
  if (['devotee', 'volunteer'].includes(mappedRole)) {
    if (authStore.user?.templeId !== templeId) {
      next({ name: 'Unauthorized' })
      return
    }
  }
  
  next()
}

/**
 * Permission Guard
 * Checks specific permissions for granular access control
 */
export function requirePermission(permission) {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' })
      return
    }
    
    if (!authStore.hasPermission(permission)) {
      next({ name: 'Unauthorized' })
      return
    }
    
    next()
  }
}

/**
 * Get default route based on user role
 */
export function getDefaultRoute(role) {
  const routes = {
    tenant: '/tenant/dashboard',
    templeadmin: '/tenant/dashboard', // Add mapping for templeadmin
    devotee: '/devotee/temple-selection',
    volunteer: '/volunteer/temple-selection',
    superadmin: '/superadmin/dashboard',
    super_admin: '/superadmin/dashboard'
  }
  
  return routes[role] || '/'
}

/**
 * Check if route is accessible to user
 */
export function canAccessRoute(route, user) {
  if (!route.meta) return true
  
  // Check authentication requirement
  if (route.meta.requiresAuth && !user) {
    return false
  }
  
  // Get mapped role
  const mappedRole = getMappedRole(user?.role)
  
  // Check role requirements - handles both 'roles' (plural) and 'role' (singular)
  if (route.meta.roles && user) {
    return route.meta.roles.includes(mappedRole) || 
           (user.role === 'templeadmin' && route.meta.roles.includes('tenant'))
  }
  
  // Also check for singular 'role' in meta (for backward compatibility)
  if (route.meta.role && user) {
    return route.meta.role === mappedRole || 
           (user.role === 'templeadmin' && route.meta.role === 'tenant')
  }
  
  // Check specific permissions
  if (route.meta.permissions && user) {
    return route.meta.permissions.every(permission => 
      user.permissions?.includes(permission)
    )
  }
  
  return true
}

/**
 * Get breadcrumb trail for current route
 */
export function getBreadcrumbs(route, routes = []) {
  const breadcrumbs = []
  let currentRoute = route
  
  while (currentRoute) {
    if (currentRoute.meta?.breadcrumb) {
      breadcrumbs.unshift({
        name: currentRoute.meta.breadcrumb,
        path: currentRoute.path,
        active: currentRoute === route
      })
    }
    
    // Find parent route
    const pathSegments = currentRoute.path.split('/').filter(Boolean)
    if (pathSegments.length > 1) {
      pathSegments.pop()
      const parentPath = '/' + pathSegments.join('/')
      currentRoute = routes.find(r => r.path === parentPath)
    } else {
      currentRoute = null
    }
  }
  
  return breadcrumbs
}

/**
 * Route validation utilities
 */
export const routeValidators = {
  isPublicRoute: (route) => !route.meta?.requiresAuth,
  isAuthRoute: (route) => route.path.startsWith('/auth'),
  isTenantRoute: (route) => route.path.startsWith('/tenant'),
  isDevoteeRoute: (route) => route.path.includes('/devotee'),
  isVolunteerRoute: (route) => route.path.includes('/volunteer'),
  isAdminRoute: (route) => route.path.startsWith('/admin')
}

/**
 * Navigation helpers
 */
export const navigationHelpers = {
  goToDefaultRoute: (router, user) => {
    const mappedRole = getMappedRole(user?.role)
    const defaultRoute = getDefaultRoute(mappedRole)
    router.push(defaultRoute)
  },
  
  goToLogin: (router, redirect = null) => {
    router.push({
      name: 'Login',
      query: redirect ? { redirect } : {}
    })
  },
  
  goToPreviousOrDefault: (router, user, fallback = '/') => {
    const previousRoute = router.options.history.state?.back
    if (previousRoute && canAccessRoute({ path: previousRoute }, user)) {
      router.go(-1)
    } else {
      router.push(fallback)
    }
  }
}

export default {
  requireAuth,
  requireGuest,
  requireRole,
  checkRole,
  checkProfileCompleted,
  checkTempleApproved,
  requireApprovedTenant,
  requireTempleAccess,
  requirePermission,
  getDefaultRoute,
  canAccessRoute,
  getBreadcrumbs,
  routeValidators,
  navigationHelpers
}