import SuperAdminDashboard from '@/views/superadmin/SuperAdminDashboard.vue'

// Define routes for Super Admin section
export default [
  {
    path: 'dashboard',
    name: 'SuperAdminDashboard',
    component: SuperAdminDashboard,
    meta: {
      title: 'Super Admin Dashboard',
      requiresAuth: true,
      role: 'superadmin'
    }
  },
  {
    path: 'tenant-approvals',
    name: 'TenantApprovals',
    component: () => import('@/views/superadmin/TenantApprovalsView.vue'),
    meta: {
      title: 'Tenant Approvals',
      requiresAuth: true,
      role: 'superadmin'
    }
  },
  {
    path: 'temple-approvals',
    name: 'TempleApprovals',
    component: () => import('@/views/superadmin/TempleApprovalsView.vue'),
    meta: {
      title: 'Temple Approvals',
      requiresAuth: true,
      role: 'superadmin'
    }
  },
  {
    path: 'platform-stats',
    name: 'PlatformStats',
    component: () => import('@/views/superadmin/PlatformStatsView.vue'),
    meta: {
      title: 'Platform Statistics',
      requiresAuth: true,
      role: 'superadmin'
    }
  }
]