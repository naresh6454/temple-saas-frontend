import api, { endpoints } from './api.js'

class SuperAdminService {
  constructor() {
    this.baseURL = '/api/v1/superadmin'
  }

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================

  async getPendingTenants() {
    try {
      console.log('Service: Fetching pending tenants...')
      
      // Use the correct endpoint from api.js
      const response = await api.get(endpoints.superAdmin.pendingTenants)
      
      console.log('Service: Raw API response:', response)
      
      // The backend returns pending_tenants wrapped in the response
      return {
        success: true,
        data: response.pending_tenants || response || [], 
        message: 'Tenants fetched successfully'
      }
    } catch (error) {
      console.error('Service: Error fetching pending tenants:', error)
      
      // If this is a 404, we might need to fall back to mock data
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, using mock data for demonstration')
        return {
          success: true,
          data: this.getMockPendingTenants(),
          message: 'Mock tenant data loaded (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch pending tenants'
      }
    }
  }

  async getAllTenants(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await api.get(`${this.baseURL}/tenants?${params}`)
      
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          pagination: { total: response.data.length },
          message: 'Tenants fetched successfully'
        }
      } else if (response.data && Array.isArray(response.data.tenants)) {
        return {
          success: true,
          data: response.data.tenants,
          pagination: response.data.pagination || {},
          message: 'Tenants fetched successfully'
        }
      } else if (response.data && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination || {},
          message: 'Tenants fetched successfully'
        }
      }
      
      return {
        success: false,
        data: [],
        message: 'Unexpected API response format'
      }
    } catch (error) {
      console.error('Error fetching all tenants:', error)
      
      // Use mock data as fallback
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, using mock data for demonstration')
        return {
          success: true,
          data: this.getMockAllTenants(),
          message: 'Mock tenant data loaded (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch tenants'
      }
    }
  }

  async approveTenant(tenantId) {
    try {
      console.log(`Approving tenant ${tenantId}...`)
      
      // Use the correct endpoint from api.js
      const payload = {
        status: "APPROVED"
      }
      
      const response = await api.patch(endpoints.superAdmin.updateTenantApproval(tenantId), payload)
      console.log('Tenant approval response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Tenant approved successfully'
      }
    } catch (error) {
      console.error('Error approving tenant:', error)
      
      // If we're in demo mode, simulate success
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful approval')
        
        // Update our mock data to reflect the approval
        this.updateMockTenantStatus(tenantId, 'approved')
        
        return {
          success: true,
          data: { status: 'approved', message: 'Tenant approved successfully (mock)' },
          message: 'Tenant approved successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to approve tenant'
      }
    }
  }

  async rejectTenant(tenantId, data) {
    try {
      console.log(`Rejecting tenant ${tenantId}...`)
      
      // Use the correct endpoint from api.js
      const payload = {
        status: "REJECTED",
        reason: data.reason || data.notes || ''
      }

      const response = await api.patch(endpoints.superAdmin.updateTenantApproval(tenantId), payload)
      console.log('Tenant rejection response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Tenant rejected successfully'
      }
    } catch (error) {
      console.error('Error rejecting tenant:', error)
      
      // If we're in demo mode, simulate success
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful rejection')
        
        // Update our mock data to reflect the rejection
        this.updateMockTenantStatus(tenantId, 'rejected')
        
        return {
          success: true,
          data: { 
            status: 'rejected', 
            reason: data.reason || data.notes,
            message: 'Tenant rejected successfully (mock)' 
          },
          message: 'Tenant rejected successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reject tenant'
      }
    }
  }

  async getTenantDetails(tenantId) {
    try {
      const response = await api.get(`${this.baseURL}/tenants/${tenantId}`)
      
      if (response.data && response.data.tenant) {
        return {
          success: true,
          data: response.data.tenant,
          temples: response.data.temples || [],
          message: 'Tenant details fetched successfully'
        }
      } else if (response.data) {
        return {
          success: true,
          data: response.data,
          temples: response.data.temples || [],
          message: 'Tenant details fetched successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Unexpected API response format'
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch tenant details'
      }
    }
  }

  // ==========================================
  // TEMPLE MANAGEMENT
  // ==========================================

  async getPendingEntities() {
    try {
      console.log('Fetching pending entities from API...')
      
      // Use the correct endpoint from api.js
      const response = await api.get(endpoints.superAdmin.pendingEntities)
      console.log('API response for pending entities:', response)
      
      // Handle the response format properly based on the backend structure
      if (response && response.pending_entities !== undefined) {
        // Backend returns {pending_entities: [...]}
        return {
          success: true,
          data: response.pending_entities || [],
          total: (response.pending_entities || []).length,
          message: 'Pending entities fetched successfully'
        }
      } else if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
          total: response.length,
          message: 'Pending entities fetched successfully'
        }
      } else if (response && Array.isArray(response.entities)) {
        return {
          success: true,
          data: response.entities,
          total: response.total || response.entities.length,
          message: 'Pending entities fetched successfully'
        }
      } else {
        console.warn('API returned unexpected data format:', response)
        // Return empty array as fallback
        return {
          success: true,
          data: [],
          total: 0,
          message: 'No pending entities found'
        }
      }
    } catch (error) {
      console.error('Error fetching pending entities:', error)
      
      // If we're in demo mode, use mock data
      if (error.response?.status === 404) {
        return {
          success: true,
          data: this.getMockPendingEntities(),
          total: this.getMockPendingEntities().length,
          message: 'Mock entities loaded (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch pending entities'
      }
    }
  }

  async approveEntity(entityId, data) {
    try {
      console.log(`Approving entity ${entityId}...`)
      
      const payload = {
        status: "APPROVED",
        notes: data?.notes || ''
      }
      
      const response = await api.patch(endpoints.superAdmin.updateEntityApproval(entityId), payload)
      console.log('Entity approval response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Entity approved successfully'
      }
    } catch (error) {
      console.error('Error approving entity:', error)
      
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful approval')
        return {
          success: true,
          data: { status: 'approved', message: 'Entity approved successfully (mock)' },
          message: 'Entity approved successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to approve entity'
      }
    }
  }

  async rejectEntity(entityId, data) {
    try {
      console.log(`Rejecting entity ${entityId}...`)
      
      const payload = {
        status: "REJECTED",
        reason: data.reason || data.notes || ''
      }
      
      const response = await api.patch(endpoints.superAdmin.updateEntityApproval(entityId), payload)
      console.log('Entity rejection response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Entity rejected successfully'
      }
    } catch (error) {
      console.error('Error rejecting entity:', error)
      
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful rejection')
        return {
          success: true,
          data: { 
            status: 'rejected', 
            reason: data.reason || data.notes,
            message: 'Entity rejected successfully (mock)' 
          },
          message: 'Entity rejected successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reject entity'
      }
    }
  }

  // ==========================================
  // ANALYTICS & DASHBOARD
  // ==========================================

  async getDashboardStats(dateRange = {}) {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      if (dateRange.period) params.append('period', dateRange.period)

      console.log('Fetching dashboard stats with params:', params.toString())
      const response = await api.get(`${this.baseURL}/dashboard?${params}`)
      console.log('Dashboard stats response:', response)
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // If the API returns the stats directly
        if (response.pendingApprovals !== undefined || 
            response.activeTemples !== undefined ||
            response.stats !== undefined) {
          return {
            success: true,
            data: response.stats || response,
            message: 'Dashboard stats fetched successfully'
          }
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Unexpected API response format or no stats available'
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch dashboard stats'
      }
    }
  }

  async getSystemStats(dateRange = {}) {
    return this.getDashboardStats(dateRange);
  }
  
  // ==========================================
  // ACTIVITIES (MOCK)
  // ==========================================
  
  /**
   * Get recent activities - method to support the admin dashboard
   * @param {number} limit - Maximum number of activities to return
   * @returns {Promise<Object>} Recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      // Try to call the actual endpoint (which may not exist yet)
      try {
        const response = await api.get(`${this.baseURL}/activities?limit=${limit}`)
        
        // Check if valid response format
        if (Array.isArray(response)) {
          return {
            success: true,
            data: response,
            message: 'Recent activities fetched successfully'
          }
        } else if (response && Array.isArray(response.activities)) {
          return {
            success: true,
            data: response.activities,
            message: 'Recent activities fetched successfully'
          }
        }
      } catch (apiError) {
        console.warn('Activities endpoint not yet implemented:', apiError)
        
        // Return mock data instead
        return {
          success: true,
          data: this.getMockActivities(limit),
          message: 'Mock activities generated (endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: [],
        message: 'Unexpected API response format for activities'
      }
    } catch (error) {
      console.error('Error in getRecentActivities:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch recent activities'
      }
    }
  }
  
  // ==========================================
  // MOCK DATA HELPERS
  // ==========================================
  
  // Mock tenants data for development/demo
  // Store it as a class property so we can update it
  _mockTenants = [
    {
      ID: 1,
      FullName: "Naresh V",
      Email: "nareshvn4n@gmail.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: null,
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "pending",
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-12T17:00:16.325394Z",
      UpdatedAt: "2025-07-12T17:00:16.325394Z",
      DeletedAt: null
    },
    {
      ID: 2,
      FullName: "GANESH",
      Email: "ganesh123@gmail.com",
      PasswordHash: "$2a$10$qvfEW9znvJEH19YDGiTyROSmTM9nzPjtpHXL/MDZ/3NoDqTsW8O5q",
      Phone: null,
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "pending",
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-12T17:28:03.293811Z",
      UpdatedAt: "2025-07-12T17:28:03.293811Z",
      DeletedAt: null
    },
    {
      ID: 3,
      FullName: "Sharath Kumar",
      Email: "sharath@example.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: "9876543210",
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "approved", // one approved for demo
      EmailVerified: true,
      EmailVerifiedAt: "2025-07-10T10:00:00Z",
      CreatedAt: "2025-07-10T10:00:00Z",
      UpdatedAt: "2025-07-10T10:00:00Z",
      DeletedAt: null
    },
    {
      ID: 4,
      FullName: "Rajesh K",
      Email: "rajesh@example.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: "8765432109",
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "rejected", // one rejected for demo
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-09T15:30:00Z",
      UpdatedAt: "2025-07-09T17:45:00Z",
      DeletedAt: null
    }
  ]
  
  // Method to get pending tenants
  getMockPendingTenants() {
    return this._mockTenants.filter(t => t.Status === 'pending');
  }
  
  // Method to get all tenants
  getMockAllTenants() {
    return this._mockTenants;
  }
  
  // Method to update tenant status in mock data
  updateMockTenantStatus(tenantId, status) {
    // Make sure ID is treated as a number for comparison
    const id = parseInt(tenantId);
    
    this._mockTenants = this._mockTenants.map(tenant => {
      if (tenant.ID === id) {
        return {
          ...tenant,
          Status: status,
          UpdatedAt: new Date().toISOString()
        };
      }
      return tenant;
    });
    
    console.log(`Mock tenant ${tenantId} status updated to ${status}`);
  }
  
  // Generate mock entities data
  getMockPendingEntities() {
    return [
      {
        ID: 1,
        Name: "Sri Venkateswara Temple",
        Description: "Famous temple dedicated to Lord Venkateswara",
        Type: "Hindu",
        Address: "123 Temple Street",
        City: "Bengaluru",
        State: "Karnataka",
        Country: "India",
        Zip: "560001",
        Phone: "9876543210",
        Email: "info@svtemple.com",
        Website: "www.svtemple.com",
        TenantID: 1,
        Status: "pending",
        CreatedBy: 1,
        CreatedAt: "2025-07-11T10:00:00Z",
        UpdatedAt: "2025-07-11T10:00:00Z"
      },
      {
        ID: 2,
        Name: "Ganesh Mandir",
        Description: "Temple dedicated to Lord Ganesha",
        Type: "Hindu",
        Address: "456 Temple Lane",
        City: "Chennai",
        State: "Tamil Nadu",
        Country: "India",
        Zip: "600001",
        Phone: "8765432109",
        Email: "info@ganeshmandir.com",
        Website: "www.ganeshmandir.com",
        TenantID: 2,
        Status: "pending",
        CreatedBy: 2,
        CreatedAt: "2025-07-12T11:30:00Z",
        UpdatedAt: "2025-07-12T11:30:00Z"
      }
    ];
  }
  
  // Generate mock activities data
  getMockActivities(limit = 10) {
    const activities = [
      {
        id: 1,
        type: 'approval',
        description: 'Approved temple admin registration',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 2,
        type: 'approval',
        description: 'Approved new temple registration',
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: 3,
        type: 'new_application',
        description: 'Created new temple',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 4,
        type: 'rejection',
        description: 'Rejected temple admin registration due to incomplete information',
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 5,
        type: 'new_application',
        description: 'Received donation of ₹5000',
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      },
      {
        id: 6,
        type: 'new_application',
        description: 'Created new temple event: Ganesh Chaturthi Celebration',
        timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
      },
      {
        id: 7,
        type: 'new_application',
        description: 'Booked seva: Abhishekam',
        timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
      }
    ];
    
    return activities.slice(0, limit);
  }
}

// Create and export singleton instance
const superAdminService = new SuperAdminService()
export default superAdminService