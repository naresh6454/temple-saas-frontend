/**
 * Super Admin Service
 * Handles all Super Admin operations including tenant approvals, temple management, and analytics
 */

import api from './api.js'

class SuperAdminService {
  constructor() {
    this.baseURL = '/api/v1/superadmin'
  }

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================

  /**
   * Get all pending tenant registrations
   * @returns {Promise<Object>} List of pending tenants
   */
  async getPendingTenants() {
    try {
      const response = await api.get(`${this.baseURL}/tenants/pending`)
      return {
        success: true,
        data: response.data.tenants || [],
        total: response.data.total || 0,
        message: 'Pending tenants fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch pending tenants'
      }
    }
  }

  /**
   * Get all tenants with filtering and pagination
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Filtered list of tenants
   */
  async getAllTenants(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Add filters
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await api.get(`${this.baseURL}/tenants?${params}`)
      return {
        success: true,
        data: response.data.tenants || [],
        pagination: response.data.pagination || {},
        message: 'Tenants fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch tenants'
      }
    }
  }

  /**
   * Approve a tenant registration
   * @param {string} tenantId - Tenant ID to approve
   * @param {Object} approvalData - Approval details
   * @returns {Promise<Object>} Approval result
   */
  async approveTenant(tenantId, approvalData = {}) {
    try {
      const payload = {
        status: 'APPROVED',
        approvedBy: approvalData.approvedBy || null,
        approvalNotes: approvalData.notes || '',
        approvedAt: new Date().toISOString(),
        ...approvalData
      }

      const response = await api.patch(`${this.baseURL}/tenants/${tenantId}/approve`, payload)
      return {
        success: true,
        data: response.data.tenant || {},
        message: response.data.message || 'Tenant approved successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to approve tenant'
      }
    }
  }

  /**
   * Reject a tenant registration
   * @param {string} tenantId - Tenant ID to reject
   * @param {Object} rejectionData - Rejection details
   * @returns {Promise<Object>} Rejection result
   */
  async rejectTenant(tenantId, rejectionData = {}) {
    try {
      const payload = {
        status: 'REJECTED',
        rejectedBy: rejectionData.rejectedBy || null,
        rejectionNotes: rejectionData.notes || '',
        rejectionReason: rejectionData.reason || '',
        rejectedAt: new Date().toISOString(),
        allowResubmission: rejectionData.allowResubmission || true,
        ...rejectionData
      }

      const response = await api.patch(`${this.baseURL}/tenants/${tenantId}/reject`, payload)
      return {
        success: true,
        data: response.data.tenant || {},
        message: response.data.message || 'Tenant rejected successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to reject tenant'
      }
    }
  }

  /**
   * Get tenant details with associated temples
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Tenant details
   */
  async getTenantDetails(tenantId) {
    try {
      const response = await api.get(`${this.baseURL}/tenants/${tenantId}`)
      return {
        success: true,
        data: response.data.tenant || {},
        temples: response.data.temples || [],
        message: 'Tenant details fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch tenant details'
      }
    }
  }

  // ==========================================
  // TEMPLE MANAGEMENT
  // ==========================================

  /**
   * Get all pending temple approvals
   * @returns {Promise<Object>} List of pending temples
   */
  async getPendingTemples() {
    try {
      const response = await api.get(`${this.baseURL}/temples/pending`)
      return {
        success: true,
        data: response.data.temples || [],
        total: response.data.total || 0,
        message: 'Pending temples fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch pending temples'
      }
    }
  }

  /**
   * Get all temples with filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Filtered list of temples
   */
  async getAllTemples(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.tenantId) params.append('tenantId', filters.tenantId)
      if (filters.city) params.append('city', filters.city)
      if (filters.state) params.append('state', filters.state)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get(`${this.baseURL}/temples?${params}`)
      return {
        success: true,
        data: response.data.temples || [],
        pagination: response.data.pagination || {},
        message: 'Temples fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch temples'
      }
    }
  }

  /**
   * Approve a temple
   * @param {string} templeId - Temple ID to approve
   * @param {Object} approvalData - Approval details
   * @returns {Promise<Object>} Approval result
   */
  async approveTemple(templeId, approvalData = {}) {
    try {
      const payload = {
        status: 'APPROVED',
        approvedBy: approvalData.approvedBy || null,
        approvalNotes: approvalData.notes || '',
        approvedAt: new Date().toISOString(),
        ...approvalData
      }

      const response = await api.patch(`${this.baseURL}/temples/${templeId}/approve`, payload)
      return {
        success: true,
        data: response.data.temple || {},
        message: response.data.message || 'Temple approved successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to approve temple'
      }
    }
  }

  /**
   * Reject a temple
   * @param {string} templeId - Temple ID to reject
   * @param {Object} rejectionData - Rejection details
   * @returns {Promise<Object>} Rejection result
   */
  async rejectTemple(templeId, rejectionData = {}) {
    try {
      const payload = {
        status: 'REJECTED',
        rejectedBy: rejectionData.rejectedBy || null,
        rejectionNotes: rejectionData.notes || '',
        rejectionReason: rejectionData.reason || '',
        rejectedAt: new Date().toISOString(),
        allowResubmission: rejectionData.allowResubmission || true,
        ...rejectionData
      }

      const response = await api.patch(`${this.baseURL}/temples/${templeId}/reject`, payload)
      return {
        success: true,
        data: response.data.temple || {},
        message: response.data.message || 'Temple rejected successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to reject temple'
      }
    }
  }

  /**
   * Get temple details with documents
   * @param {string} templeId - Temple ID
   * @returns {Promise<Object>} Temple details
   */
  async getTempleDetails(templeId) {
    try {
      const response = await api.get(`${this.baseURL}/temples/${templeId}`)
      return {
        success: true,
        data: response.data.temple || {},
        documents: response.data.documents || [],
        tenant: response.data.tenant || {},
        message: 'Temple details fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch temple details'
      }
    }
  }

  // ==========================================
  // ANALYTICS & DASHBOARD
  // ==========================================

  /**
   * Get Super Admin dashboard statistics
   * @param {Object} dateRange - Date range for analytics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(dateRange = {}) {
    try {
      const params = new URLSearchParams()
      
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      if (dateRange.period) params.append('period', dateRange.period) // today, week, month, year

      const response = await api.get(`${this.baseURL}/dashboard/stats?${params}`)
      return {
        success: true,
        data: {
          summary: response.data.summary || {},
          trends: response.data.trends || {},
          recentActivity: response.data.recentActivity || [],
          pendingApprovals: response.data.pendingApprovals || {}
        },
        message: 'Dashboard stats fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Failed to fetch dashboard stats'
      }
    }
  }

  /**
   * Get system analytics
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} System analytics data
   */
  async getSystemAnalytics(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.metric) params.append('metric', filters.metric)
      if (filters.period) params.append('period', filters.period)
      if (filters.groupBy) params.append('groupBy', filters.groupBy)

      const response = await api.get(`${this.baseURL}/analytics?${params}`)
      return {
        success: true,
        data: response.data.analytics || {},
        message: 'System analytics fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Failed to fetch system analytics'
      }
    }
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  /**
   * Bulk approve tenants
   * @param {Array} tenantIds - Array of tenant IDs
   * @param {Object} approvalData - Bulk approval data
   * @returns {Promise<Object>} Bulk approval result
   */
  async bulkApproveTenants(tenantIds, approvalData = {}) {
    try {
      const payload = {
        tenantIds,
        status: 'APPROVED',
        approvedBy: approvalData.approvedBy || null,
        approvalNotes: approvalData.notes || '',
        approvedAt: new Date().toISOString()
      }

      const response = await api.post(`${this.baseURL}/tenants/bulk-approve`, payload)
      return {
        success: true,
        data: response.data.results || [],
        message: response.data.message || 'Tenants approved successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to bulk approve tenants'
      }
    }
  }

  /**
   * Bulk reject tenants
   * @param {Array} tenantIds - Array of tenant IDs
   * @param {Object} rejectionData - Bulk rejection data
   * @returns {Promise<Object>} Bulk rejection result
   */
  async bulkRejectTenants(tenantIds, rejectionData = {}) {
    try {
      const payload = {
        tenantIds,
        status: 'REJECTED',
        rejectedBy: rejectionData.rejectedBy || null,
        rejectionNotes: rejectionData.notes || '',
        rejectionReason: rejectionData.reason || '',
        rejectedAt: new Date().toISOString(),
        allowResubmission: rejectionData.allowResubmission || true
      }

      const response = await api.post(`${this.baseURL}/tenants/bulk-reject`, payload)
      return {
        success: true,
        data: response.data.results || [],
        message: response.data.message || 'Tenants rejected successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to bulk reject tenants'
      }
    }
  }

  // ==========================================
  // NOTIFICATIONS & COMMUNICATION
  // ==========================================

  /**
   * Send notification to tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Notification result
   */
  async sendNotificationToTenant(tenantId, notification) {
    try {
      const payload = {
        tenantId,
        type: notification.type || 'SYSTEM',
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'MEDIUM',
        channels: notification.channels || ['EMAIL', 'IN_APP']
      }

      const response = await api.post(`${this.baseURL}/notifications/send`, payload)
      return {
        success: true,
        data: response.data.notification || {},
        message: 'Notification sent successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to send notification'
      }
    }
  }

  /**
   * Get system logs
   * @param {Object} filters - Log filters
   * @returns {Promise<Object>} System logs
   */
  async getSystemLogs(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.level) params.append('level', filters.level)
      if (filters.module) params.append('module', filters.module)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get(`${this.baseURL}/logs?${params}`)
      return {
        success: true,
        data: response.data.logs || [],
        pagination: response.data.pagination || {},
        message: 'System logs fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch system logs'
      }
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Download tenant data export
   * @param {Object} exportParams - Export parameters
   * @returns {Promise<Object>} Export result
   */
  async exportTenantData(exportParams = {}) {
    try {
      const params = new URLSearchParams()
      
      if (exportParams.format) params.append('format', exportParams.format) // csv, xlsx, pdf
      if (exportParams.status) params.append('status', exportParams.status)
      if (exportParams.dateRange) {
        params.append('startDate', exportParams.dateRange.startDate)
        params.append('endDate', exportParams.dateRange.endDate)
      }

      const response = await api.get(`${this.baseURL}/export/tenants?${params}`, {
        responseType: 'blob'
      })

      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || 'tenants_export',
        message: 'Export generated successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to generate export'
      }
    }
  }

  /**
   * Get approval history for a tenant or temple
   * @param {string} entityId - Entity ID (tenant or temple)
   * @param {string} entityType - Entity type ('tenant' or 'temple')
   * @returns {Promise<Object>} Approval history
   */
  async getApprovalHistory(entityId, entityType = 'tenant') {
    try {
      const response = await api.get(`${this.baseURL}/approval-history/${entityType}/${entityId}`)
      return {
        success: true,
        data: response.data.history || [],
        message: 'Approval history fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch approval history'
      }
    }
  }
}

// Create and export singleton instance
const superAdminService = new SuperAdminService()
export default superAdminService