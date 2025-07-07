// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { checkProfileCompleted, requireAuth } from './guards'
// Add these imports
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Public Views
import LandingPage from '@/views/public/LandingPage.vue'
import TermsPage from '@/views/public/TermsPage.vue'
import PrivacyPage from '@/views/public/PrivacyPage.vue'

// Auth Views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

// Tenant Views
import TenantDashboard from '@/views/tenant/TenantDashboard.vue'
import CreateTemple from '@/views/tenant/CreateTemple.vue'
import ManageTemples from '@/views/tenant/ManageTemples.vue'
import EditTemple from '@/views/tenant/EditTemple.vue'
import TempleDetails from '@/views/tenant/TempleDetails.vue'  // Add import for TempleDetails

// Entity (Temple Admin) Views - Phase 5
import EntityDashboard from '@/views/entity/EntityDashboard.vue'
import DevoteeManagement from '@/views/entity/DevoteeManagement.vue'
import SevaManagement from '@/views/entity/SevaManagement.vue'
import DonationManagement from '@/views/entity/DonationManagement.vue'
import EventManagement from '@/views/entity/EventManagement.vue'
import CommunicationCenter from '@/views/entity/CommunicationCenter.vue'
import VolunteerManagement from '@/views/entity/VolunteerManagement.vue'

// Devotee Views - Phase 6
import TempleSelection from '@/views/devotee/TempleSelection.vue'
import ProfileCreation from '@/views/devotee/ProfileCreation.vue'
import DevoteeDashboard from '@/views/devotee/DevoteeDashboard.vue'
import SevaBooking from '@/views/devotee/SevaBooking.vue'
import DonationHistory from '@/views/devotee/DonationHistory.vue'
import MyEvents from '@/views/devotee/MyEvents.vue'
import ProfileEdit from '@/views/devotee/ProfileEdit.vue'

// Volunteer Views - Phase 7
import VolunteerTempleSelection from '@/views/volunteer/TempleSelection.vue'
import VolunteerDashboard from '@/views/volunteer/VolunteerDashboard.vue'
import MyAssignments from '@/views/volunteer/MyAssignments.vue'
import MySchedule from '@/views/volunteer/MySchedule.vue'

// SuperAdmin Views
import SuperAdminDashboard from '@/views/superadmin/SuperAdminDashboard.vue'

// User Views
import NotificationsView from '@/views/user/NotificationsView.vue'
import UserProfileView from '@/views/user/UserProfileView.vue' // Updated import path
import SettingsView from '@/views/settings/SettingsView.vue' // New import for Settings
import SupportView from '@/views/user/SupportView.vue' // Added import for Support

// Error Views
import NotFound from '@/views/error/NotFound.vue'
import Unauthorized from '@/views/error/Unauthorized.vue'
import ServerError from '@/views/error/ServerError.vue'

// Role mapping between numeric IDs and string roles
const ROLE_MAP = {
  1: 'superadmin',
  2: 'tenant',
  3: 'devotee',
  4: 'volunteer'
}

// Add mapping from backend roles to frontend roles
const BACKEND_ROLE_MAP = {
  'templeadmin': 'tenant' // Map backend 'templeadmin' to frontend 'tenant'
}

// Helper function to get user role as string
function getUserRole(user) {
  if (!user) return null
  
  // If user already has string role
  if (typeof user.role === 'string') {
    // Check if we need to map from backend role to frontend role
    return BACKEND_ROLE_MAP[user.role] || user.role
  }
  
  // If user has numeric role_id
  if (user.role_id !== undefined) {
    return ROLE_MAP[user.role_id] || null
  }
  
  return null
}

const routes = [
  // Public Routes
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: LandingPage,
        meta: { 
          title: 'Temple Management SaaS - Manage Your Temple Digitally',
          description: 'Manage your temple, devotees, sevas & donations with ease'
        }
      },
      {
        path: '/terms',
        name: 'Terms',
        component: TermsPage,
        meta: { title: 'Terms of Service' }
      },
      {
        path: '/privacy',
        name: 'Privacy',
        component: PrivacyPage,
        meta: { title: 'Privacy Policy' }
      }
    ]
  },

  // Auth Routes - Direct paths (as per your preference)
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { 
      title: 'Login',
      layout: 'AuthLayout' 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { 
      title: 'Register',
      layout: 'AuthLayout' 
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { 
      title: 'Forgot Password',
      layout: 'AuthLayout' 
    }
  },

  // User Routes (Common for all authenticated users)
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsView,
    meta: { 
      requiresAuth: true,
      title: 'Notifications',
      breadcrumb: 'Notifications',
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfileView, 
    meta: { 
      requiresAuth: true,
      title: 'My Profile',
      breadcrumb: 'My Profile',
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
      title: 'Account Settings',
      breadcrumb: 'Settings',
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/support',
    name: 'Support',
    component: SupportView,
    meta: {
      requiresAuth: true,
      title: 'Support Center',
      breadcrumb: 'Support',
      layout: 'DashboardLayout'
    }
  },

  // Tenant Routes - UPDATED to include templeadmin
  {
    path: '/tenant',
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      allowedRoles: ['tenant', 'templeadmin'],
      roles: ['tenant', 'templeadmin']
    },
    children: [
      {
        path: 'dashboard',
        name: 'TenantDashboard',
        component: TenantDashboard,
        meta: { 
          title: 'Tenant Dashboard',
          breadcrumb: 'Dashboard',
          allowedRoles: ['tenant', 'templeadmin'],
          roles: ['tenant', 'templeadmin']
        }
      },
      {
        path: 'entities/create',
        name: 'CreateTemple',
        component: CreateTemple,
        meta: { 
          title: 'Create Temple',
          breadcrumb: 'Create Temple',
          allowedRoles: ['tenant', 'templeadmin'],
          roles: ['tenant', 'templeadmin']
        }
      },
      {
        path: 'entities',
        name: 'ManageTemples',
        component: ManageTemples,
        meta: { 
          title: 'Manage Temples',
          breadcrumb: 'Manage Temples',
          allowedRoles: ['tenant', 'templeadmin'],
          roles: ['tenant', 'templeadmin']
        }
      },
      {
        path: 'entities/:id',
        name: 'TempleDetails',
        component: TempleDetails,
        props: true,  // Enable props passing
        meta: { 
          title: 'Temple Details',
          breadcrumb: 'Temple Details',
          allowedRoles: ['tenant', 'templeadmin'],
          roles: ['tenant', 'templeadmin']
        }
      },
      {
        path: 'entities/:id/edit',
        name: 'EditTemple',
        component: EditTemple,
        props: true,  // Enable props passing
        meta: { 
          title: 'Edit Temple',
          breadcrumb: 'Edit Temple',
          allowedRoles: ['tenant', 'templeadmin'],
          roles: ['tenant', 'templeadmin']
        }
      }
    ]
  },

  // Entity (Temple Admin) Routes - Phase 5 - UPDATED to include templeadmin
  {
    path: '/entity/:id',
    component: DashboardLayout,
    props: true, // Enable props passing for the layout
    meta: { 
      requiresAuth: true,
      allowedRoles: ['tenant', 'entity_admin', 'templeadmin']
    },
    children: [
      {
        path: 'dashboard',
        name: 'EntityDashboard',
        component: EntityDashboard,
        props: true, // Enable props passing
        meta: { 
          title: 'Temple Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'devotees',
        name: 'DevoteeManagement',
        component: DevoteeManagement,
        props: true, // Enable props passing
        meta: { 
          title: 'Devotee Management',
          breadcrumb: 'Devotees'
        }
      },
      {
        path: 'sevas',
        name: 'SevaManagement',
        component: SevaManagement,
        props: true, // Enable props passing
        meta: { 
          title: 'Seva Management',
          breadcrumb: 'Sevas'
        }
      },
      {
        path: 'donations',
        name: 'DonationManagement',
        component: DonationManagement,
        props: true, // Enable props passing
        meta: { 
          title: 'Donation Management',
          breadcrumb: 'Donations'
        }
      },
      {
        path: 'events',
        name: 'EventManagement',
        component: EventManagement,
        props: true, // Enable props passing
        meta: { 
          title: 'Event Management',
          breadcrumb: 'Events'
        }
      },
      {
        path: 'communication',
        name: 'CommunicationCenter',
        component: CommunicationCenter,
        props: true, // Enable props passing
        meta: { 
          title: 'Communication Center',
          breadcrumb: 'Communication'
        }
      },
      {
        path: 'volunteers',
        name: 'VolunteerManagement',
        component: VolunteerManagement,
        props: true, // Enable props passing
        meta: { 
          title: 'Volunteer Management',
          breadcrumb: 'Volunteers'
        }
      }
    ]
  },

  // Devotee Routes - Phase 6
  {
    path: '/devotee',
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      allowedRoles: ['devotee']
    },
    children: [
      {
        path: 'temple-selection',
        name: 'DevoteeTempleSelection',
        component: TempleSelection,
        meta: { 
          title: 'Select Temple',
          breadcrumb: 'Temple Selection'
        }
      },
      {
        path: 'profile/create',
        name: 'DevoteeProfileCreation',
        component: ProfileCreation,
        meta: { 
          title: 'Complete Profile',
          breadcrumb: 'Profile Creation'
        }
      },
      {
        path: 'profile/edit',
        name: 'DevoteeProfileEdit',
        component: ProfileEdit,
        meta: { 
          title: 'Edit Profile',
          breadcrumb: 'Edit Profile',
          role: 'devotee'
        }
      }
    ]
  },

  // Devotee Entity-Specific Routes
  {
    path: '/entity/:id/devotee',
    component: DashboardLayout,
    props: true, // Enable props passing for the layout
    meta: { 
      requiresAuth: true,
      allowedRoles: ['devotee']
    },
    children: [
      {
        path: 'dashboard',
        name: 'DevoteeDashboard',
        component: DevoteeDashboard,
        props: true, // Enable props passing
        // Remove the beforeEnter guard temporarily for debugging
        // beforeEnter: checkProfileCompleted,
        meta: { 
          title: 'My Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'profile/edit',
        name: 'DevoteeProfileEdit',
        component: ProfileEdit,
        props: true,
        meta: { 
          title: 'Edit Profile',
          breadcrumb: 'Edit Profile'
        }
      },
      {
        path: 'seva-booking',
        name: 'SevaBooking',
        component: SevaBooking,
        props: true, // Enable props passing
        // beforeEnter: checkProfileCompleted,
        meta: { 
          title: 'Book Seva',
          breadcrumb: 'Seva Booking'
        }
      },
      {
        path: 'donations',
        name: 'DevoteeDonationHistory',
        component: DonationHistory,
        props: true, // Enable props passing
        // beforeEnter: checkProfileCompleted,
        meta: { 
          title: 'My Donations',
          breadcrumb: 'Donation History'
        }
      },
      {
        path: 'events',
        name: 'DevoteeMyEvents',
        component: MyEvents,
        props: true, // Enable props passing
        // beforeEnter: checkProfileCompleted,
        meta: { 
          title: 'Temple Events',
          breadcrumb: 'My Events'
        }
      }
    ]
  },

  // Volunteer Routes - Phase 7 (COMPLETED)
  {
    path: '/volunteer',
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      allowedRoles: ['volunteer']
    },
    children: [
      {
        path: 'temple-selection',
        name: 'VolunteerTempleSelection',
        component: VolunteerTempleSelection,
        meta: { 
          title: 'Select Temple',
          breadcrumb: 'Temple Selection'
        }
      }
    ]
  },

  // Volunteer Entity-Specific Routes - Phase 7 (COMPLETED)
  {
    path: '/entity/:id/volunteer',
    component: DashboardLayout,
    props: true, // Enable props passing for the layout
    meta: { 
      requiresAuth: true,
      allowedRoles: ['volunteer']
    },
    children: [
      {
        path: 'dashboard',
        name: 'VolunteerDashboard',
        component: VolunteerDashboard,
        props: true, // Enable props passing
        meta: { 
          title: 'Volunteer Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'assignments',
        name: 'MyAssignments',
        component: MyAssignments,
        props: true, // Enable props passing
        meta: { 
          title: 'My Assignments',
          breadcrumb: 'Assignments'
        }
      },
      {
        path: 'schedule',
        name: 'MySchedule',
        component: MySchedule,
        props: true, // Enable props passing
        meta: { 
          title: 'My Schedule',
          breadcrumb: 'Schedule'
        }
      }
    ]
  },

  // SuperAdmin Routes
  {
  path: '/superadmin',
  component: DashboardLayout,
  meta: { 
    requiresAuth: true,
    allowedRoles: ['superadmin', 'super_admin'] // Accept both formats
  },
  children: [
    {
      path: 'dashboard',
      name: 'SuperAdminDashboard',
      component: SuperAdminDashboard,
      meta: { 
        title: 'Super Admin Dashboard',
        breadcrumb: 'Dashboard'
      }
    }
  ]
},

  // Convenience Redirects
  {
    path: '/temple-selection',
    redirect: to => {
      // This would need to check user role and redirect appropriately
      // For now, defaulting to devotee - should be enhanced with actual role check
      return '/devotee/temple-selection'
    }
  },

  // Error Routes
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { title: 'Access Denied' }
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerError,
    meta: { title: 'Server Error' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Enhanced router guard with proper role-based access control
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // For debugging
  console.log('Navigating to:', to.path)
  
  // Try to get auth store - need to wrap in try/catch to handle errors during initialization
  try {
    const authStore = useAuthStore()
    
    // Map templeadmin to tenant for route access
    const userRole = authStore.userRole
    const mappedRole = userRole === 'templeadmin' ? 'tenant' : userRole
    
    // CRITICAL: Special case for tenant users - force redirect to tenant dashboard
    if (authStore.isAuthenticated && (mappedRole === 'tenant')) {
      // If trying to access devotee routes, redirect to tenant dashboard
      if (to.path.includes('/devotee/') || to.path.startsWith('/entity/') && to.path.includes('/devotee/')) {
        console.warn('⚠️ Tenant user trying to access devotee routes - redirecting to tenant dashboard')
        return next('/tenant/dashboard')
      }
    }
    
    // Handle root path for authenticated users
    if (to.path === '/' && authStore.isAuthenticated) {
      // Use mapped role for dashboard redirection
      const dashboardRoute = authStore.dashboardRoute
      console.log('Redirecting authenticated user to dashboard:', dashboardRoute)
      return next(dashboardRoute)
    }
    
    // Skip auth check if not required
    if (!to.meta.requiresAuth) {
      return next()
    }
    
    // Check if user is authenticated for protected routes
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log('Authentication required, redirecting to login')
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    
    // Check role-based access - UPDATED to handle templeadmin
    if (to.meta.allowedRoles && to.meta.allowedRoles.length > 0) {
      // Special case for templeadmin trying to access tenant routes
      if (userRole === 'templeadmin' && to.meta.allowedRoles.includes('tenant')) {
        console.log('🔑 DEVELOPMENT: Allowing templeadmin access to tenant route')
        return next()
      }
      
      if (!to.meta.allowedRoles.includes(userRole) && !to.meta.allowedRoles.includes(mappedRole)) {
        console.error(`Access denied: User has role "${userRole}" but route requires one of: ${to.meta.allowedRoles.join(', ')}`)
        return next({ name: 'Unauthorized' })
      }
    }
    
    // Check specific role requirement - UPDATED to handle templeadmin
    if (to.meta.role) {
      if (to.meta.role === 'tenant' && userRole === 'templeadmin') {
        console.log('🔑 DEVELOPMENT: Allowing templeadmin access to tenant-specific route')
        return next()
      }
      
      if (authStore.userRole !== to.meta.role && mappedRole !== to.meta.role) {
        console.error(`Access denied: User has role "${authStore.userRole}" but route requires "${to.meta.role}"`)
        return next({ name: 'Unauthorized' })
      }
    }
  } catch (err) {
    console.error('Error in router guard:', err)
    // If there's an error accessing the store, continue to the route without checks
    // This allows the app to initialize properly
  }
  
  // Continue to the route
  next()
})

// Route helpers for components (Updated with Phase 7)
export function useRouteHelpers() {
  return {
    getTenantRoutes: () => [
      { name: 'TenantDashboard', path: '/tenant/dashboard', label: 'Dashboard' },
      { name: 'ManageTemples', path: '/tenant/entities', label: 'Manage Temples' },
      { name: 'CreateTemple', path: '/tenant/entities/create', label: 'Create Temple' }
    ],
    
    getEntityRoutes: (entityId) => [
      { name: 'EntityDashboard', path: `/entity/${entityId}/dashboard`, label: 'Dashboard' },
      { name: 'DevoteeManagement', path: `/entity/${entityId}/devotees`, label: 'Devotees' },
      { name: 'SevaManagement', path: `/entity/${entityId}/sevas`, label: 'Sevas' },
      { name: 'DonationManagement', path: `/entity/${entityId}/donations`, label: 'Donations' },
      { name: 'EventManagement', path: `/entity/${entityId}/events`, label: 'Events' },
      { name: 'CommunicationCenter', path: `/entity/${entityId}/communication`, label: 'Communication' },
      { name: 'VolunteerManagement', path: `/entity/${entityId}/volunteers`, label: 'Volunteers' }
    ],

    getDevoteeRoutes: (entityId) => [
      { 
        name: 'DevoteeDashboard', 
        path: `/entity/${entityId}/devotee/dashboard`, 
        label: 'Dashboard',
        params: { id: entityId } // Add params to ensure it's passed when using router-link
      },
      { 
        name: 'DevoteeProfileEdit', 
        path: `/entity/${entityId}/devotee/profile/edit`, 
        label: 'Edit Profile',
        params: { id: entityId }
      },
      { 
        name: 'SevaBooking', 
        path: `/entity/${entityId}/devotee/seva-booking`, 
        label: 'Book Seva',
        params: { id: entityId }
      },
      { 
        name: 'DevoteeDonationHistory', 
        path: `/entity/${entityId}/devotee/donations`, 
        label: 'My Donations',
        params: { id: entityId }
      },
      { 
        name: 'DevoteeMyEvents', 
        path: `/entity/${entityId}/devotee/events`, 
        label: 'Temple Events',
        params: { id: entityId }
      }
    ],

    // NEW: Volunteer Routes Helper - Phase 7
    getVolunteerRoutes: (entityId) => [
      { 
        name: 'VolunteerDashboard', 
        path: `/entity/${entityId}/volunteer/dashboard`, 
        label: 'Dashboard',
        params: { id: entityId }
      },
      { 
        name: 'MyAssignments', 
        path: `/entity/${entityId}/volunteer/assignments`, 
        label: 'My Assignments',
        params: { id: entityId }
      },
      { 
        name: 'MySchedule', 
        path: `/entity/${entityId}/volunteer/schedule`, 
        label: 'My Schedule',
        params: { id: entityId }
      }
    ],
    
    getPublicRoutes: () => [
      { name: 'Landing', path: '/', label: 'Home' },
      { name: 'Terms', path: '/terms', label: 'Terms' },
      { name: 'Privacy', path: '/privacy', label: 'Privacy' }
    ],

    getAuthRoutes: () => [
      { name: 'Login', path: '/login', label: 'Login' },
      { name: 'Register', path: '/register', label: 'Register' },
      { name: 'ForgotPassword', path: '/forgot-password', label: 'Forgot Password' }
    ],
    
    // Updated: Added Support to common routes
    getCommonRoutes: () => [
      { name: 'Notifications', path: '/notifications', label: 'Notifications' },
      { name: 'Profile', path: '/profile', label: 'My Profile' },
      { name: 'Settings', path: '/settings', label: 'Settings' },
      { name: 'Support', path: '/support', label: 'Support' }
    ],

    // NEW: Get role-specific post-login redirect paths - Phase 7
    getPostLoginRedirect: (userRole, entityId = null) => {
      // Map templeadmin to tenant for redirection
      const mappedRole = userRole === 'templeadmin' ? 'tenant' : userRole
      
      switch (mappedRole) {
        case 'tenant':
          return '/tenant/dashboard'
        case 'devotee':
          return entityId ? `/entity/${entityId}/devotee/dashboard` : '/devotee/temple-selection'
        case 'volunteer':
          return entityId ? `/entity/${entityId}/volunteer/dashboard` : '/volunteer/temple-selection'
        case 'entity_admin':
          return entityId ? `/entity/${entityId}/dashboard` : '/tenant/dashboard'
        case 'superadmin':
          return '/superadmin/dashboard'
        default:
          return '/'
      }
    }
  }
}

export default router