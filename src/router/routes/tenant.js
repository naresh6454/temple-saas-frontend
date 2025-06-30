import TenantDashboard from '@/views/tenant/TenantDashboard.vue'
import CreateTemple from '@/views/tenant/CreateTemple.vue'
import ManageTemples from '@/views/tenant/ManageTemples.vue'
import TempleDetails from '@/views/tenant/TempleDetails.vue'
import EditTemple from '@/views/tenant/EditTemple.vue'

export default [
  {
    path: 'dashboard',
    name: 'TenantDashboard',
    component: TenantDashboard,
    meta: {
      title: 'Tenant Dashboard',
      requiresAuth: true,
      role: 'tenant'
    }
  },
  {
    path: 'entities/create',
    name: 'CreateTemple',
    component: CreateTemple,
    meta: {
      title: 'Create Temple',
      requiresAuth: true,
      role: 'tenant'
    }
  },
  {
    path: 'entities',
    name: 'ManageTemples',
    component: ManageTemples,
    meta: {
      title: 'Manage Temples',
      requiresAuth: true,
      role: 'tenant'
    }
  },
  {
    path: 'entities/:id',
    name: 'TempleDetails',
    component: TempleDetails,
    meta: {
      title: 'Temple Details',
      requiresAuth: true,
      role: 'tenant'
    }
  },
  {
    path: 'entities/:id/edit',
    name: 'EditTemple',
    component: EditTemple,
    meta: {
      title: 'Edit Temple',
      requiresAuth: true,
      role: 'tenant'
    }
  }
]