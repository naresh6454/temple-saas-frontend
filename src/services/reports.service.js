import api from '@/plugins/axios'

class ReportsService {
  // ===============================
  // Utility to build query params
  // ===============================
  buildQueryParams(filters) {
    const queryParams = new URLSearchParams()

    // Common filters
    if (filters.dateRange) queryParams.append('date_range', filters.dateRange)
    if (filters.format) queryParams.append('format', filters.format)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.role && ["Tenant", "Temple"].includes(filters.role)) {
  queryParams.append('role', filters.role)
}

    // Handle custom date ranges
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      queryParams.append('start_date', filters.startDate)
      queryParams.append('end_date', filters.endDate)
    }

    return queryParams
  }

  // ===============================
  // Utility to build report URLs
  // ===============================
  buildReportURL({ isSuperAdmin, entityId, entityIds, endpoint, queryParams }) {
    // Special case for approval-status endpoint - it should always go to the superadmin route
    if (endpoint === 'approval-status') {
      return `/v1/superadmin/reports/${endpoint}?${queryParams}`;
    }
    
    // Special case for user-details endpoint - also always goes to superadmin route
    if (endpoint === 'user-details') {
      return `/v1/superadmin/reports/${endpoint}?${queryParams}`;
    }
    
    // Regular logic for other reports
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        return `/v1/superadmin/reports/${endpoint}?${queryParams}&entities=${entityIds.join(',')}`;
      } else {
        // Fallback: single entity (superadmin scope)
        return `/v1/superadmin/entities/${entityId}/reports/${endpoint}?${queryParams}`;
      }
    } else {
      // Tenant scope
      return `/v1/entities/${entityId}/reports/${endpoint}?${queryParams}`;
    }
  }

  // ===============================
  // APPROVAL STATUS REPORT METHODS
  // ===============================
  async getApprovalStatusReport(params) {
    const { entityId, entityIds, isSuperAdmin } = params
    if (!entityId && !entityIds) throw new Error('Entity ID or Entity IDs are required')

    const queryParams = this.buildQueryParams(params)
    const url = this.buildReportURL({ ...params, endpoint: 'approval-status', queryParams })

    console.log('📊 Approval Status API request:', url)
    return api.get(url)
  }

  /**
   * Download approval status report in specified format
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} - Download result
   */
  async downloadApprovalStatusReport(params) {
    try {
      const { entityId, entityIds, format } = params;
      if ((!entityId && !entityIds) || !format) {
        throw new Error('Entity ID (or IDs) and format are required');
      }

      // Build query params
      const queryParams = this.buildQueryParams(params);
      
      // Use the buildReportURL method to construct the URL correctly
      const url = this.buildReportURL({ 
        ...params, 
        endpoint: 'approval-status', 
        queryParams 
      });

      // Call download method
      return this.downloadReport(url, { format }, 'approval_status_report');
    } catch (error) {
      console.error('Error downloading approval status report:', error);
      throw error;
    }
  }

  /**
   * Get approval status preview data for display
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} - Preview data
   */
  async getApprovalStatusPreview(params) {
    const response = await this.getApprovalStatusReport(params)
    const data = response.data?.data || response.data || []

    const columns = [
      { key: 'item_name', label: 'Item Name' },
      { key: 'item_type', label: 'Type' },
      { key: 'submitted_by', label: 'Submitted By' },
      { key: 'submitted_date', label: 'Submitted Date' },
      { key: 'status', label: 'Status' },
      { key: 'approved_by', label: 'Approved By' },
      { key: 'approval_date', label: 'Approval Date' },
      { key: 'comments', label: 'Comments' }
    ]

    return {
      data: Array.isArray(data)
        ? data.map(item => ({
            ...item,
            submitted_date: item.submitted_date ? this.formatDate(item.submitted_date) : '-',
            approval_date: item.approval_date ? this.formatDate(item.approval_date) : '-'
          }))
        : [],
      columns,
      totalRecords: Array.isArray(data) ? data.length : 0
    }
  }

  // ===============================
  // USER DETAILS REPORT METHODS
  // ===============================
  // Modified sections in reports.service.js

async getUserDetailsReport(params) {
  const { entityId, entityIds, role, status, dateRange = 'monthly', startDate, endDate, isSuperAdmin } = params;

  if (!entityId && !entityIds) {
    throw new Error('Entity ID or Entity IDs are required');
  }

  const queryParams = new URLSearchParams({
    date_range: dateRange
  });

  if (role && role !== 'all') {
    queryParams.append('role', role);
  }

  if (status && status !== 'all') {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // The only valid URL pattern is for superadmin
  let url;
  
  if (isSuperAdmin) {
    if (entityIds && entityIds.length > 1) {
      url = `/v1/superadmin/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`;
    } else {
      url = `/v1/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
    }
  } else {
    // For non-superadmin, there is no directly registered route, so we'll use
    // the superadmin route with tenant_id parameter
    url = `/v1/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
  }

  console.log('👥 User Details API request:', url);
  return api.get(url);
}

async getUserDetailsPreview(params) {
  try {
    const response = await this.getUserDetailsReport(params);
    
    console.log('User Details preview response:', response);
    
    let responseData = response.data;
    
    // Handle different response structures
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    
    const columns = [
      { key: 'name', label: 'User Name' },
      { key: 'email', label: 'Email' },
      { key: 'entity_name', label: 'Entity/Tenant' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created At' }
    ];
    
    // Handle different response formats
    let previewData = [];
    
    if (Array.isArray(responseData)) {
      previewData = responseData;
    } else if (responseData && responseData.user_details) {
      previewData = responseData.user_details;
    } else if (responseData && Array.isArray(responseData.data)) {
      previewData = responseData.data;
    } else {
      console.warn('⚠️ No valid user details data found in response:', responseData);
      previewData = [];
    }
    
    // Format date fields for better display
    previewData = previewData.map(item => ({
      ...item,
      created_at: item.created_at ? this.formatDate(item.created_at) : '-'
    }));
    
    console.log('📋 Final preview data:', previewData);
    
    return {
      data: previewData,
      columns,
      totalRecords: previewData.length || 0
    };
  } catch (error) {
    console.error('❌ Error getting user details preview:', error);
    throw error;
  }
}

// Update the downloadUserDetailsReport method in reports.service.js

async downloadUserDetailsReport(params) {
  const { entityId, entityIds, role, status, dateRange = 'monthly', startDate, endDate, format, isSuperAdmin } = params;

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required');
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format: format
  });

  // Fix the role mapping: map 'tenant' to 'templeadmin' if needed
  if (role && role !== 'all') {
    // If role is 'tenant', convert it to 'templeadmin' for the backend
    const mappedRole = role === 'tenant' ? 'templeadmin' : role;
    queryParams.append('role', mappedRole);
  }

  if (status && status !== 'all') {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // Rest of the method remains the same...
  let url;
  if (isSuperAdmin) {
    if (entityIds && entityIds.length > 1) {
      url = `/v1/superadmin/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`;
    } else {
      url = `/v1/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
    }
  } else {
    url = `/v1/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
  }

  try {
    console.log('👥 Downloading user details report:', url);
    return await this.downloadReport(url, { format }, 'user_details_report', async () => {
      // Fallback function remains the same...
      if (isSuperAdmin) {
        const alternatives = [
          entityIds && entityIds.length > 1
            ? `/v1/superadmin/user-details/report?${queryParams}&tenants=${entityIds.join(',')}`
            : `/v1/superadmin/user-details/report?${queryParams}&tenant_id=${entityId}`,
          entityIds && entityIds.length > 1
            ? `/v1/superadmin/entities/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`
            : `/v1/entities/${entityId}/reports/user-details?${queryParams}`
        ];
        return alternatives;
      }
      return null;
    });
  } catch (error) {
    console.error('Error downloading user details report:', error);
    throw error;
  }
}

  /**
   * Get activities report data (JSON preview)
   */
  async getActivitiesReport(params) {
    const { entityId, entityIds, type, dateRange = 'weekly', startDate, endDate, isSuperAdmin } = params
    
    if ((!entityId && !entityIds) || !type) {
      throw new Error('Entity ID (or IDs) and type are required')
    }

    const queryParams = new URLSearchParams({
      type,
      date_range: dateRange
    })

    if (dateRange === 'custom' && startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    }

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/v1/superadmin/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/v1/superadmin/tenants/${entityId}/reports/activities?${queryParams}`
        }
        
        console.log('Making primary API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/activities/report?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/superadmin/activities/report?${queryParams}&tenant_id=${entityId}`
          }
          
          console.log('Making fallback API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/entities/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/entities/${entityId}/reports/activities?${queryParams}`
          }
          
          console.log('Making third fallback API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/v1/entities/${entityId}/reports/activities?${queryParams}`
      console.log('Making API request:', url)
      response = await api.get(url)
    }
    
    console.log('API Response received:', response)
    return response
  }

  /**
   * Download activities report in specified format
   */
  async downloadActivitiesReport(params) {
    const { entityId, entityIds, type, format, dateRange = 'weekly', startDate, endDate, isSuperAdmin } = params
    
    if ((!entityId && !entityIds) || !type || !format) {
      throw new Error('Entity ID (or IDs), type, and format are required')
    }

    const queryParams = new URLSearchParams({
      type,
      date_range: dateRange,
      format
    })

    if (dateRange === 'custom' && startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    }

    let url;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      // Try the same pattern as getActivitiesReport for consistency
      if (entityIds && entityIds.length > 1) {
        url = `/v1/superadmin/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
      } else {
        url = `/v1/superadmin/tenants/${entityId}/reports/activities?${queryParams}`
      }
      
      // We'll rely on downloadReport's error handling to try alternative patterns if needed
    } else {
      // Regular entity endpoint
      url = `/v1/entities/${entityId}/reports/activities?${queryParams}`
    }

    try {
      return await this.downloadReport(url, { format }, `${type}_report`, async () => {
        // Fallback function for alternative URLs if the first one fails
        if (isSuperAdmin) {
          // Try alternative patterns
          const alternatives = [
            entityIds && entityIds.length > 1 
              ? `/v1/superadmin/activities/report?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/superadmin/activities/report?${queryParams}&tenant_id=${entityId}`,
            
            entityIds && entityIds.length > 1
              ? `/v1/superadmin/entities/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/entities/${entityId}/reports/activities?${queryParams}`
          ];
          
          return alternatives;
        }
        return null; // No alternatives for regular users
      });
    } catch (error) {
      console.error('Error downloading activities report:', error)
      throw error
    }
  }

  /**
   * Get report preview data for display
   */
  async getReportPreview(params) {
    try {
      const response = await this.getActivitiesReport(params)
      
      console.log('API Response Structure:', response)
      console.log('Response Data:', response.data)
      
      let responseData = response.data
      
      if (responseData && responseData.data) {
        responseData = responseData.data
      }
      
      if (!responseData) {
        console.warn('No data found in response')
        responseData = {}
      }
      
      let previewData = []
      let columns = []

      switch (params.type) {
        case 'events':
          columns = [
            { key: 'title', label: 'Event Title' },
            { key: 'event_type', label: 'Type' },
            { key: 'event_date', label: 'Date' },
            { key: 'location', label: 'Location' },
            { key: 'created_by', label: 'Created By' }
          ]
          previewData = responseData.events || responseData.Events || []
          break
          
        case 'sevas':
          columns = [
            { key: 'name', label: 'Seva Name' },
            { key: 'seva_type', label: 'Type' },
            { key: 'price', label: 'Price' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' }
          ]
          previewData = responseData.sevas || responseData.Sevas || []
          break
          
        case 'bookings':
          columns = [
            { key: 'seva_name', label: 'Seva' },
            { key: 'devotee_name', label: 'Devotee' },
            { key: 'devotee_phone', label: 'Phone' },
            { key: 'booking_time', label: 'Booking Time' },
            { key: 'status', label: 'Status' }
          ]
          previewData = responseData.bookings || responseData.Bookings || []
          break
          
        case 'donations':
          columns = [
            { key: 'donor_name', label: 'Donor Name' },
            { key: 'amount', label: 'Amount' },
            { key: 'donation_type', label: 'Type' },
            { key: 'payment_method', label: 'Payment Method' },
            { key: 'status', label: 'Status' },
            { key: 'donation_date', label: 'Donation Date' }
          ]
          previewData = responseData.donations || responseData.Donations || []
          break
      }

      console.log('Extracted preview data:', previewData)
      console.log('Columns:', columns)

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length
      }
    } catch (error) {
      console.error('Error getting report preview:', error)
      throw error
    }
  }

  /**
   * Validate report parameters
   */
  validateReportParams(params) {
    const errors = []

    if (!params.entityId && !params.entityIds) {
      errors.push('Entity ID or Entity IDs are required')
    }

    if (!params.type || !['events', 'sevas', 'bookings', 'donations', 'temple-registered', 'devotee-birthdays'].includes(params.type)) {
      errors.push('Valid report type is required (events, sevas, bookings, donations, temple-registered, devotee-birthdays)')
    }

    if (params.type === 'temple-registered') {
      const validStatuses = ['approved', 'rejected', 'pending']
      if (params.status && !validStatuses.includes(params.status)) {
        errors.push(`Invalid status filter. Allowed values: ${validStatuses.join(', ')}`)
      }
    }

    if (params.dateRange === 'custom') {
      if (!params.startDate || !params.endDate) {
        errors.push('Start date and end date are required for custom date range')
      } else if (new Date(params.startDate) > new Date(params.endDate)) {
        errors.push('Start date must be before end date')
      }
    }

    if (params.format && !['pdf', 'csv', 'excel'].includes(params.format)) {
      errors.push('Invalid format specified')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // TEMPLE REGISTERED METHODS
async downloadTempleRegisteredReport(params) {
  const { entityId, entityIds, templeId, status, dateRange = 'weekly', startDate, endDate, format, isSuperAdmin } = params;

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required');
  }

  console.log('🔍 Temple Register Report Params:', { 
    entityId, 
    entityIds, 
    templeId,
    isSuperAdmin,
    format
  });

  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format
  });

  if (status) {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // Standard auth headers - needed for all requests
  const headers = {
    'Accept': this.getAcceptHeader(format),
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Cache-Control': 'no-cache'
  };

  // CRITICAL FIX: Always use headers from params when available
  if (params.headers && params.headers['X-Tenant-ID']) {
    headers['X-Tenant-ID'] = params.headers['X-Tenant-ID'];
    console.log(`🔑 Using tenant ID from params headers: ${params.headers['X-Tenant-ID']}`);
  } 
  // Fallback options if no headers in params
  else if (!isSuperAdmin && entityId) {
    headers['X-Tenant-ID'] = entityId.toString();
  } else if (isSuperAdmin && entityIds && entityIds.length > 0) {
    headers['X-Tenant-ID'] = entityIds[0].toString();
  } else if (isSuperAdmin && entityId) {
    headers['X-Tenant-ID'] = entityId.toString();
  }
  
  // Log headers for debugging
  console.log('🔑 Using headers:', JSON.stringify(headers));

  // Define URLs to try with correct path for "all" temples
  const urlsToTry = [];
  
  if (templeId === 'all') {
    // Try all these endpoints for the "all" case
    urlsToTry.push(
      `/api/v1/entities/all/reports/temple-registered?${queryParams}`,
      `/api/v1/reports/temple-registered?${queryParams}&all=true`,
      `/api/v1/reports/temples?${queryParams}&all=true`
    );
  } else {
    // For specific temple
    urlsToTry.push(
      `/api/v1/entities/${templeId}/reports/temple-registered?${queryParams}`,
      `/api/v1/reports/temple-registered?${queryParams}&entity_id=${templeId}`,
      `/api/v1/reports/temples?${queryParams}&entity_id=${templeId}`
    );
  }
  
  // Common fallbacks as last resort
  urlsToTry.push(
    `/api/v1/entities/all/reports/temple-registered?${queryParams}`
  );
  
  console.log('🔄 URLs to try:', urlsToTry);
  
  // Try each URL until one succeeds
  let response = null;
  let successUrl = '';
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    console.log(`🔄 Attempt ${i+1}/${urlsToTry.length}: ${url}`);
    
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        console.log(`✅ Success with URL: ${url}`);
        successUrl = url;
        break;
      } else {
        const errorText = await response.text().catch(() => 'Unable to get error text');
        console.log(`❌ URL failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error with URL: ${error.message}`);
    }
  }

  if (!response || !response.ok) {
    throw new Error('All attempts to download temple registered report failed');
  }

  // Convert response to blob for download
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);

  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `temple_registered_report_${Date.now()}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  window.URL.revokeObjectURL(downloadUrl);

  return { success: true, url: successUrl };
}

// Fix for reports.service.js downloadTempleRegisteredReport method

// --- UPDATED downloadTempleRegisteredReport method for reports.service.js ---

async downloadTempleRegisteredReport(params) {
  const { entityId, entityIds, templeId, status, dateRange = 'weekly', startDate, endDate, format, isSuperAdmin } = params;

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required');
  }

  console.log('🔍 Temple Register Report Params:', { 
    entityId, 
    entityIds, 
    templeId,
    isSuperAdmin,
    format
  });

  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format
  });

  if (status) {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // Standard auth headers - needed for all requests
  const headers = {
    'Accept': this.getAcceptHeader(format),
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Cache-Control': 'no-cache'
  };

  // For tenant users, add tenant ID header
  if (!isSuperAdmin && entityId) {
    headers['X-Tenant-ID'] = entityId.toString();
  }

  // For superadmins with multiple tenants, use first tenant in header
  if (isSuperAdmin && entityIds && entityIds.length > 0) {
    headers['X-Tenant-ID'] = entityIds[0].toString();
  } else if (isSuperAdmin && entityId) {
    headers['X-Tenant-ID'] = entityId.toString();
  }
  
  // Log headers for debugging
  console.log('🔑 Using headers:', JSON.stringify(headers));

  // Define URLs to try and their priority
  const urlsToTry = [];
  
  // --- TENANT USER PATHS (keep existing working functionality) ---
  if (!isSuperAdmin) {
    if (templeId === 'all') {
      // For "All Temples" - tenant users
      urlsToTry.push(
        // Primary URL - known to work for tenant users
        `/api/v1/entities/all/reports/temple-registered?${queryParams}`
      );
    } else {
      // For specific temple - tenant users
      urlsToTry.push(
        // Primary URL - known to work for tenant users
        `/api/v1/entities/${templeId}/reports/temple-registered?${queryParams}`
      );
    }
  } 
  // --- SUPERADMIN PATHS (specialized handling) ---
  else {
    // CRITICAL: For Superadmin with multiple tenants and "All Temples"
    if (entityIds && entityIds.length > 0 && templeId === 'all') {
      // For multiple tenants AND "All Temples" - superadmin
      
      // Add tenant_ids parameter for multiple tenants
      const tenantsParam = entityIds.join(',');
      
      // Explicit option 1: Use report-all path with tenants list
      urlsToTry.push(
        `/api/v1/superadmin/reports/all-temples?${queryParams}&tenants=${tenantsParam}`,
        `/api/v1/superadmin/reports/temple-registered/all?${queryParams}&tenants=${tenantsParam}`
      );
      
      // Explicit option 2: Use standard path with all_temples flag
      urlsToTry.push(
        `/api/v1/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}&all_temples=true`,
        `/api/v1/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}&temple_id=all`
      );
      
      // Separate parameter format
      urlsToTry.push(
        `/api/v1/superadmin/temple-registered?${queryParams}&tenant_ids=${tenantsParam}&all=true`
      );
      
      // Try without including temple_id parameter
      urlsToTry.push(
        `/api/v1/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}`
      );
      
      // Try individual tenant URLs with include_all flag
      for (const tid of entityIds) {
        urlsToTry.push(
          `/api/v1/superadmin/tenants/${tid}/reports/temple-registered?${queryParams}&include_all=true`
        );
      }
    }
    // For Superadmin with single tenant and "All Temples" or specific temple
    else {
      if (templeId === 'all') {
        // For single tenant AND "All Temples" - superadmin
        urlsToTry.push(
          `/api/v1/superadmin/tenants/${entityId}/reports/all-temples?${queryParams}`,
          `/api/v1/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&all=true`,
          `/api/v1/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&temple_id=all`,
          `/api/v1/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}`
        );
      } else {
        // For single tenant AND specific temple - superadmin (working case)
        urlsToTry.push(
          `/api/v1/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&temple_id=${templeId}`,
          `/api/v1/superadmin/tenants/${entityId}/temples/${templeId}/reports?${queryParams}`
        );
      }
    }
  }
  
  // Common fallbacks as last resort
  urlsToTry.push(
    `/api/v1/reports/temple-registered?${queryParams}`,
    `/api/v1/reports/temples?${queryParams}`,
    `/api/v1/entities/all/reports/temple-registered?${queryParams}`
  );
  
  console.log('🔄 URLs to try:', urlsToTry);
  
  // Try each URL until one succeeds
  let response = null;
  let successUrl = '';
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    console.log(`🔄 Attempt ${i+1}/${urlsToTry.length}: ${url}`);
    
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        console.log(`✅ Success with URL: ${url}`);
        successUrl = url;
        break;
      } else {
        const errorText = await response.text().catch(() => 'Unable to get error text');
        console.log(`❌ URL failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error with URL: ${error.message}`);
    }
  }
  
  // Handle case where all attempts failed
  if (!response || !response.ok) {
    throw new Error('All download attempts failed. Please check your permissions or contact support.');
  }
  
  // Check for empty response
  const blob = await response.blob();
  if (blob.size === 0) {
    console.error('✅ Success but empty file (0 bytes) from URL:', successUrl);
    throw new Error('No data available for the selected criteria. The server returned an empty file.');
  }
  
  console.log(`✅ Successfully downloaded ${blob.size} bytes of data from URL: ${successUrl}`);
  
  // Create and trigger download
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `temple_register_report_${timestamp}.${format}`;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  
  return { success: true, filename, size: blob.size };
}

  async getTempleRegisteredPreview(params) {
    try {
      const response = await this.getTempleRegisteredReport(params)

      let responseData = response.data
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      const columns = [
        { key: 'temple_name', label: 'Temple Name' },
        { key: 'registration_date', label: 'Registration Date' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' }
      ]

      const previewData = responseData.temples || responseData || []

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length || 0
      }
    } catch (error) {
      console.error('Error getting temple-registered preview:', error)
      throw error
    }
  }

  // DEVOTEE BIRTHDAYS METHODS
  async getDevoteeBirthdaysReport(params) {
    const { entityId, entityIds, dateRange = 'monthly', startDate, endDate, isSuperAdmin } = params

    if (!entityId && !entityIds) {
      throw new Error('Entity ID or Entity IDs are required')
    }

    const queryParams = new URLSearchParams({
      date_range: dateRange,
    })

    // For birthdays, we need to handle date range differently
    if (dateRange === 'custom' && startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    } else {
      // For birthdays, set appropriate default dates
      const today = new Date()
      let calculatedStartDate, calculatedEndDate
      
      switch (dateRange) {
        case 'weekly':
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
          break
        case 'monthly':
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
          break
        case 'yearly':
          calculatedStartDate = new Date(today.getFullYear(), 0, 1)
          calculatedEndDate = new Date(today.getFullYear(), 11, 31)
          break
        default:
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
      }
      
      queryParams.append('start_date', calculatedStartDate.toISOString().split('T')[0])
      queryParams.append('end_date', calculatedEndDate.toISOString().split('T')[0])
    }

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/v1/superadmin/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/v1/superadmin/tenants/${entityId}/reports/devotee-birthdays?${queryParams}`
        }
        
        console.log('🎂 Making primary devotee birthdays API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/devotee-birthdays/report?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/superadmin/devotee-birthdays/report?${queryParams}&tenant_id=${entityId}`
          }
          
          console.log('🎂 Making fallback devotee birthdays API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/entities/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
          }
          
          console.log('🎂 Making third fallback devotee birthdays API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/v1/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
      console.log('🎂 Making devotee birthdays API request:', url)
      response = await api.get(url)
    }
    
    console.log('✅ Devotee birthdays API Response received:', response)
    return response
  }

  async downloadDevoteeBirthdaysReport(params) {
    const { entityId, entityIds, format, dateRange = 'monthly', startDate, endDate, isSuperAdmin } = params

    if ((!entityId && !entityIds) || !format) {
      throw new Error('Entity ID (or IDs) and format are required')
    }

    const queryParams = new URLSearchParams({
      date_range: dateRange,
      format
    })

    // Same date logic as preview method
    if (dateRange === 'custom' && startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    } else {
      const today = new Date()
      let calculatedStartDate, calculatedEndDate
      
      switch (dateRange) {
        case 'weekly':
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
          break
        case 'monthly':
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
          break
        case 'yearly':
          calculatedStartDate = new Date(today.getFullYear(), 0, 1)
          calculatedEndDate = new Date(today.getFullYear(), 11, 31)
          break
        default:
          calculatedStartDate = new Date()
          calculatedEndDate = new Date()
          calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
      }
      
      queryParams.append('start_date', calculatedStartDate.toISOString().split('T')[0])
      queryParams.append('end_date', calculatedEndDate.toISOString().split('T')[0])
    }

    let url;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        url = `/v1/superadmin/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
      } else {
        url = `/v1/superadmin/tenants/${entityId}/reports/devotee-birthdays?${queryParams}`
      }
    } else {
      url = `/v1/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
    }
    
    try {
      return await this.downloadReport(url, { format }, 'devotee_birthdays_report', async () => {
        // Fallback function for alternative URLs if the first one fails
        if (isSuperAdmin) {
          // Try alternative patterns
          const alternatives = [
            entityIds && entityIds.length > 1 
              ? `/v1/superadmin/devotee-birthdays/report?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/superadmin/devotee-birthdays/report?${queryParams}&tenant_id=${entityId}`,
            
            entityIds && entityIds.length > 1
              ? `/v1/superadmin/entities/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
          ];
          
          return alternatives;
        }
        return null; // No alternatives for regular users
      });
    } catch (error) {
      console.error('Error downloading devotee-birthdays report:', error)
      throw error
    }
  }

  async getDevoteeBirthdaysPreview(params) {
    try {
      const response = await this.getDevoteeBirthdaysReport(params)

      console.log('🎂 Devotee birthdays preview response:', response)

      let responseData = response.data
      
      // Handle different response structures
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      console.log('📊 Processed response data:', responseData)

      const columns = [
        { key: 'full_name', label: 'Full Name' },
        { key: 'date_of_birth', label: 'Date of Birth' },
        { key: 'age', label: 'Age' },
        { key: 'gender', label: 'Gender' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'temple_name', label: 'Temple' },
        { key: 'upcoming_birthday', label: 'Upcoming Birthday' }
      ]

      // Handle different response formats more robustly
      let previewData = []
      
      if (Array.isArray(responseData)) {
        previewData = responseData
      } else if (responseData && responseData.devotees) {
        previewData = responseData.devotees
      } else if (responseData && responseData.birthdays) {
        previewData = responseData.birthdays
      } else if (responseData && responseData.devotee_birthdays) {
        previewData = responseData.devotee_birthdays
      } else if (responseData && Array.isArray(responseData.data)) {
        previewData = responseData.data
      } else {
        console.warn('⚠️ No valid devotee birthdays data found in response:', responseData)
        previewData = []
      }

      // Format date fields for better display
      previewData = previewData.map(item => ({
        ...item,
        date_of_birth: item.date_of_birth ? this.formatDate(item.date_of_birth) : '-',
        upcoming_birthday: item.upcoming_birthday ? this.formatDate(item.upcoming_birthday) : '-'
      }))

      console.log('📋 Final preview data:', previewData)

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length || 0
      }
    } catch (error) {
      console.error('❌ Error getting devotee-birthdays preview:', error)
      throw error
    }
  }
// DEVOTEE LIST METHODS
async getDevoteeList(params) {
  const { entityId, entityIds, status = 'all', isSuperAdmin } = params;

  if (!entityId && (!entityIds || entityIds.length === 0)) {
    throw new Error('Entity ID or Entity IDs are required');
  }

  const allowedStatuses = ['all', 'active', 'inactive'];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }

  const queryParams = new URLSearchParams();
  if (status !== 'all') queryParams.append('status', status);

  const buildUrl = (base) => {
    const qp = new URLSearchParams(queryParams.toString());
    if (entityIds && entityIds.length > 1) qp.append('tenants', entityIds.join(','));
    else if (entityId) qp.append('tenant_id', entityId);
    return `${base}?${qp.toString()}`;
  };

  const urlsToTry = [];
  if (isSuperAdmin) {
    urlsToTry.push(
      entityIds && entityIds.length > 1
        ? '/v1/superadmin/reports/devotee-list'
        : `/v1/superadmin/tenants/${entityId}/reports/devotee-list`,
      entityIds && entityIds.length > 1
        ? '/v1/superadmin/devotee-list/report'
        : '/v1/superadmin/devotee-list/report',
      entityIds && entityIds.length > 1
        ? '/v1/superadmin/entities/reports/devotees'
        : `/v1/entities/${entityId}/reports/devotees`
    );
  } else {
    urlsToTry.push(`/v1/entities/${entityId}/reports/devotee-list`);
  }

  let response = null;
  for (const baseUrl of urlsToTry) {
    try {
      const url = buildUrl(baseUrl);
      console.log('📋 Trying Devotee List API:', url);
      response = await api.get(url);
      if (response?.data) break; // Success
    } catch (err) {
      console.warn('API call failed for', baseUrl, err.message);
    }
  }

  if (!response) {
    console.error('All Devotee List API endpoints failed');
    return { data: [] }; // Ensure frontend always gets an array
  }

  // Normalize data to always return an array
  let data = response.data;
  if (data?.data) data = data.data;
  if (!data) data = [];
  if (!Array.isArray(data)) data = data.devotees || data.data || [];

  response.data = Array.isArray(data) ? data : [];
  console.log('✅ Normalized Devotee List Response:', response.data);

  return response;
}

async downloadDevoteeListReport(params) {
  const { format } = params;
  if (!format) throw new Error('Format is required for download');

  if (params.entityIds && Array.isArray(params.entityIds) && params.entityIds.length > 0) {
    params.isSuperAdmin = true;
  }

  const queryParams = new URLSearchParams({ format });
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);

  const buildUrl = (base) => {
    const qp = new URLSearchParams(queryParams.toString());
    if (params.entityIds && params.entityIds.length > 1) qp.append('tenants', params.entityIds.join(','));
    else if (params.entityId) qp.append('tenant_id', params.entityId);
    return `${base}?${qp.toString()}`;
  };

  const urlsToTry = [];
  if (params.isSuperAdmin) {
    urlsToTry.push(
      params.entityIds && params.entityIds.length > 1
        ? '/v1/superadmin/reports/devotee-list'
        : `/v1/superadmin/tenants/${params.entityId}/reports/devotee-list`,
      params.entityIds && params.entityIds.length > 1
        ? '/v1/superadmin/devotee-list/report'
        : '/v1/superadmin/devotee-list/report',
      params.entityIds && params.entityIds.length > 1
        ? '/v1/superadmin/entities/reports/devotees'
        : `/v1/entities/${params.entityId}/reports/devotees`
    );
  } else {
    urlsToTry.push(`/v1/entities/${params.entityId}/reports/devotee-list`);
  }

  for (const baseUrl of urlsToTry) {
    try {
      const url = buildUrl(baseUrl);
      console.log('📋 Trying Devotee List Download API:', url);
      return await this.downloadReport(url, { format }, `devotee_list_${params.status}_report`);
    } catch (err) {
      console.warn('Download attempt failed for', baseUrl, err.message);
    }
  }

  throw new Error('All download attempts for devotee list failed');
}

async getDevoteeListPreview(params) {
  try {
    const response = await this.getDevoteeList(params);
    let data = response.data || [];
    if (!Array.isArray(data)) data = data.devotees || [];

    const columns = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'registration_date', label: 'Registration Date' },
      { key: 'last_login', label: 'Last Login' }
    ];

    return {
      data,
      columns,
      totalRecords: data.length
    };
  } catch (err) {
    console.error('Error getting devotee list preview:', err);
    return { data: [], columns: [], totalRecords: 0 };
  }
}


  // DEVOTEE PROFILE METHODS
  async getDevoteeProfile(params) {
    const { entityId, entityIds, isSuperAdmin } = params

    if (!entityId && !entityIds) {
      throw new Error('Entity ID or Entity IDs are required')
    }

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/v1/superadmin/reports/devotee-profile?tenants=${entityIds.join(',')}`
        } else {
          url = `/v1/superadmin/tenants/${entityId}/reports/devotee-profile`
        }
        
        console.log('👤 Making primary devotee profile API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/devotee-profile/report?tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/superadmin/devotee-profile/report?tenant_id=${entityId}`
          }
          
          console.log('👤 Making fallback devotee profile API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/entities/reports/devotee-profile?tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/entities/${entityId}/reports/devotee-profile`
          }
          
          console.log('👤 Making third fallback devotee profile API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/v1/entities/${entityId}/reports/devotee-profile`
      console.log('👤 Making devotee profile API request:', url)
      response = await api.get(url)
    }
    
    console.log('✅ Devotee profile API Response received:', response)
    return response
  }

  async downloadDevoteeProfileReport(params) {
    const { entityId, entityIds, format, isSuperAdmin } = params

    if ((!entityId && !entityIds) || !format) {
      throw new Error('Entity ID (or IDs) and format are required')
    }

    const queryParams = new URLSearchParams({ format })
    
    let url;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        url = `/v1/superadmin/reports/devotee-profile?${queryParams}&tenants=${entityIds.join(',')}`
      } else {
        url = `/v1/superadmin/tenants/${entityId}/reports/devotee-profile?${queryParams}`
      }
    } else {
      url = `/v1/entities/${entityId}/reports/devotee-profile?${queryParams}`
    }
    
    try {
      return await this.downloadReport(url, { format }, 'devotee_profile_report', async () => {
        // Fallback function for alternative URLs if the first one fails
        if (isSuperAdmin) {
          // Try alternative patterns
          const alternatives = [
            entityIds && entityIds.length > 1 
              ? `/v1/superadmin/devotee-profile/report?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/superadmin/devotee-profile/report?${queryParams}&tenant_id=${entityId}`,
            
            entityIds && entityIds.length > 1
              ? `/v1/superadmin/entities/reports/devotee-profile?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/entities/${entityId}/reports/devotee-profile?${queryParams}`
          ];
          
          return alternatives;
        }
        return null; // No alternatives for regular users
      });
    } catch (error) {
      console.error('Error downloading devotee profile report:', error)
      throw error
    }
  }

  async getDevoteeProfilePreview(params) {
    try {
      const response = await this.getDevoteeProfile(params)

      let responseData = response.data
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      const profileData = responseData.profile || responseData || {}

      return profileData
    } catch (error) {
      console.error('Error getting devotee profile preview:', error)
      throw error
    }
  }


  // AUDIT LOGS REPORT METHODS
  async getAuditLogsReport(params) {
    const {
      entityId,
      entityIds,
      dateRange = 'weekly',
      startDate,
      endDate,
      userId,
      actionType,
      isSuperAdmin
    } = params

    if (!entityId && !entityIds) {
      throw new Error('Entity ID or Entity IDs are required')
    }

    const queryParams = new URLSearchParams({ date_range: dateRange })

    // Handle date range (custom or preset)
    let finalStartDate, finalEndDate
    const today = new Date()

    if (dateRange === 'custom' && startDate && endDate) {
      finalStartDate = startDate
      finalEndDate = endDate
    } else {
      finalEndDate = today.toISOString().split('T')[0]
      const start = new Date(today)

      switch (dateRange) {
        case 'daily':
          break // today only
        case 'weekly':
          start.setDate(today.getDate() - 7)
          break
        case 'monthly':
          start.setMonth(today.getMonth() - 1)
          break
        default:
          start.setDate(today.getDate() - 7)
      }

      finalStartDate = start.toISOString().split('T')[0]
    }

    queryParams.set('start_date', finalStartDate)
    queryParams.set('end_date', finalEndDate)

    if (userId) queryParams.set('user_id', userId)
    if (actionType) queryParams.set('action_type', actionType)

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/v1/superadmin/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/v1/superadmin/tenants/${entityId}/reports/audit-logs?${queryParams}`
        }
        
        console.log('🔍 Making primary audit logs API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/audit-logs/report?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/superadmin/audit-logs/report?${queryParams}&tenant_id=${entityId}`
          }
          
          console.log('🔍 Making fallback audit logs API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/v1/superadmin/entities/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/v1/entities/${entityId}/reports/audit-logs?${queryParams}`
          }
          
          console.log('🔍 Making third fallback audit logs API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/v1/entities/${entityId}/reports/audit-logs?${queryParams}`
      console.log('🔍 Making audit logs API request:', url)
      response = await api.get(url)
    }
    
    console.log('✅ Audit logs API Response received:', response)
    return response
  }

  async downloadAuditLogsReport(params) {
    const {
      entityId,
      entityIds,
      format = 'csv',
      dateRange = 'weekly',
      startDate,
      endDate,
      userId,
      actionType,
      isSuperAdmin
    } = params

    if ((!entityId && !entityIds) || !format) {
      throw new Error('Entity ID (or IDs) and format are required')
    }

    const queryParams = new URLSearchParams({ date_range: dateRange, format })

    // Handle date range
    let finalStartDate, finalEndDate
    const today = new Date()

    if (dateRange === 'custom' && startDate && endDate) {
      finalStartDate = startDate
      finalEndDate = endDate
    } else {
      finalEndDate = today.toISOString().split('T')[0]
      const start = new Date(today)

      switch (dateRange) {
        case 'daily':
          break // today only
        case 'weekly':
          start.setDate(today.getDate() - 7)
          break
        case 'monthly':
          start.setMonth(today.getMonth() - 1)
          break
        default:
          start.setDate(today.getDate() - 7)
      }

      finalStartDate = start.toISOString().split('T')[0]
    }

    queryParams.set('start_date', finalStartDate)
    queryParams.set('end_date', finalEndDate)

    if (userId) queryParams.set('user_id', userId)
    if (actionType) queryParams.set('action_type', actionType)

    let url;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        url = `/v1/superadmin/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
      } else {
        url = `/v1/superadmin/tenants/${entityId}/reports/audit-logs?${queryParams}`
      }
    } else {
      url = `/v1/entities/${entityId}/reports/audit-logs?${queryParams}`
    }

    try {
      return await this.downloadReport(url, { format }, 'audit_logs_report', async () => {
        // Fallback function for alternative URLs if the first one fails
        if (isSuperAdmin) {
          // Try alternative patterns
          const alternatives = [
            entityIds && entityIds.length > 1 
              ? `/v1/superadmin/audit-logs/report?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/superadmin/audit-logs/report?${queryParams}&tenant_id=${entityId}`,
            
            entityIds && entityIds.length > 1
              ? `/v1/superadmin/entities/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
              : `/v1/entities/${entityId}/reports/audit-logs?${queryParams}`
          ];
          
          return alternatives;
        }
        return null; // No alternatives for regular users
      });
    } catch (error) {
      console.error('❌ Error downloading audit logs report:', error)
      throw error
    }
  }

  async getAuditLogsPreview(params) {
    try {
      const response = await this.getAuditLogsReport(params)

      console.log('🔍 Audit logs preview response:', response)

      let responseData = response.data
      
      // Handle different response structures
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      console.log('📊 Processed audit logs data:', responseData)

      const columns = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'user_name', label: 'User' },
        { key: 'action_type', label: 'Action' },
        { key: 'resource_type', label: 'Resource Type' },
        { key: 'resource_id', label: 'Resource ID' },
        { key: 'description', label: 'Description' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'user_agent', label: 'User Agent' }
      ]

      // Handle different response formats
      let previewData = []
      
      if (Array.isArray(responseData)) {
        previewData = responseData
      } else if (responseData && responseData.audit_logs) {
        previewData = responseData.audit_logs
      } else if (responseData && responseData.logs) {
        previewData = responseData.logs
      } else if (responseData && Array.isArray(responseData.data)) {
        previewData = responseData.data
      } else {
        console.warn('⚠️ No valid audit logs data found in response:', responseData)
        previewData = []
      }

      // Format timestamp for better display
      previewData = previewData.map(item => ({
        ...item,
        timestamp: item.timestamp ? this.formatDateTime(item.timestamp) : '-',
        description: item.description || item.details || '-',
        user_agent: item.user_agent ? this.truncateText(item.user_agent, 50) : '-'
      }))

      console.log('📋 Final audit logs preview data:', previewData)

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length || 0
      }
    } catch (error) {
      console.error('❌ Error getting audit logs preview:', error)
      throw error
    }
  }

  // TEMPLE/ENTITY METHODS
  async getTemples(params = {}) {
    const { isSuperAdmin } = params
    
    try {
      let url;
      if (isSuperAdmin) {
        url = '/v1/superadmin/tenants'
      } else {
        url = '/v1/entities'
      }
      
      console.log('🔍 Making temples API request:', url)
      const response = await api.get(url)
      console.log('✅ Temples API Response received:', response)
      
      return response
    } catch (error) {
      console.error('❌ Error fetching temples:', error)
      throw error
    }
  }

  async getEntities(params = {}) {
    const { isSuperAdmin } = params
    
    try {
      let url;
      let response;
      
      // Try multiple possible endpoints
      const endpoints = [
        isSuperAdmin ? '/v1/superadmin/tenants' : '/v1/entities',
        isSuperAdmin ? '/v1/superadmin/entities' : '/v1/tenant/entities',
        '/v1/temples',
        '/v1/organizations'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log('🔍 Trying entities endpoint:', endpoint)
          response = await api.get(endpoint)
          console.log('✅ Success with endpoint:', endpoint, response)
          return response
        } catch (error) {
          console.log('❌ Failed endpoint:', endpoint, error.message)
          continue
        }
      }
      
      throw new Error('Unable to fetch entities from any available endpoint')
    } catch (error) {
      console.error('❌ Error fetching entities:', error)
      throw error
    }
  }

  async getTenantEntities(params = {}) {
    const { isSuperAdmin } = params
    
    try {
      let url;
      if (isSuperAdmin) {
        url = '/v1/superadmin/entities'
      } else {
        url = '/v1/tenant/entities'
      }
      
      console.log('🔍 Making tenant entities API request:', url)
      const response = await api.get(url)
      console.log('✅ Tenant entities API Response received:', response)
      
      return response
    } catch (error) {
      console.error('❌ Error fetching tenant entities:', error)
      
      // Fallback to getEntities if this endpoint doesn't exist
      return this.getEntities(params)
    }
  }

  // UTILITY METHODS
  formatDateTime(dateString) {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (error) {
      console.warn('Invalid datetime format:', dateString)
      return dateString
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  async downloadReport(apiUrl, params, defaultFilename, getFallbackUrls = null) {
    try {
      console.log('🔄 Making download request:', apiUrl)
      console.log('📋 Request parameters:', params)

      try {
        const response = await api.get(apiUrl, {
          responseType: 'blob',
          headers: {
            'Accept': this.getAcceptHeader(params.format),
            'Cache-Control': 'no-cache'
          }
        })
        
        console.log('✅ Download response received:', {
          status: response.status,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          contentDisposition: response.headers['content-disposition']
        })

        // Validate response
        if (!response.data || response.data.size === 0) {
          throw new Error('Empty file received from server')
        }

        // Check for error responses disguised as success
        const contentType = response.headers['content-type']
        if (contentType?.includes('text/html') || contentType?.includes('application/json')) {
          const text = await response.data.text()
          console.error('❌ Server returned error response:', text)
          throw new Error(`Server error: ${text.substring(0, 200)}`)
        }

        // Extract filename
        let filename = `${defaultFilename}.${params.format}`
        const contentDisposition = response.headers['content-disposition']
        
        if (contentDisposition) {
          const patterns = [
            /filename[^;=\n]*=\s*"([^"]+)"/i,
            /filename[^;=\n]*=\s*'([^']+)'/i,
            /filename[^;=\n]*=\s*([^;\n]+)/i,
            /filename\*=UTF-8''([^;\n]+)/i
          ]
          
          for (const pattern of patterns) {
            const match = contentDisposition.match(pattern)
            if (match) {
              filename = decodeURIComponent(match[1].trim())
              break
            }
          }
        }

        // Create and trigger download
        const blob = new Blob([response.data], {
          type: this.getBlobType(params.format)
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 1000)

        console.log('✅ Download completed successfully')
        return { 
          success: true, 
          filename, 
          size: blob.size,
          contentType: contentType
        }
      } catch (error) {
        // Try fallback URLs if provided
        if (getFallbackUrls) {
          const fallbackUrls = await getFallbackUrls()
          if (fallbackUrls && fallbackUrls.length > 0) {
            console.log('Trying fallback URLs:', fallbackUrls)
            
            // Try each fallback URL
            for (const fbUrl of fallbackUrls) {
              try {
                console.log('Trying fallback URL:', fbUrl)
                const response = await api.get(fbUrl, {
                  responseType: 'blob',
                  headers: {
                    'Accept': this.getAcceptHeader(params.format),
                    'Cache-Control': 'no-cache'
                  }
                })
                
                // Extract filename
                let filename = `${defaultFilename}.${params.format}`
                const contentDisposition = response.headers['content-disposition']
                
                if (contentDisposition) {
                  const patterns = [
                    /filename[^;=\n]*=\s*"([^"]+)"/i,
                    /filename[^;=\n]*=\s*'([^']+)'/i,
                    /filename[^;=\n]*=\s*([^;\n]+)/i,
                    /filename\*=UTF-8''([^;\n]+)/i
                  ]
                  
                  for (const pattern of patterns) {
                    const match = contentDisposition.match(pattern)
                    if (match) {
                      filename = decodeURIComponent(match[1].trim())
                      break
                    }
                  }
                }

                // Create and trigger download
                const blob = new Blob([response.data], {
                  type: this.getBlobType(params.format)
                })
                
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', filename)
                link.style.display = 'none'
                
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                setTimeout(() => {
                  window.URL.revokeObjectURL(url)
                }, 1000)

                console.log('✅ Download completed successfully with fallback URL')
                return { 
                  success: true, 
                  filename, 
                  size: blob.size,
                  contentType: response.headers['content-type']
                }
              } catch (fbError) {
                console.error('❌ Fallback URL failed:', fbUrl, fbError)
                // Continue to the next fallback URL
              }
            }
          }
        }
        
        // If we reach here, all fallbacks failed
        throw error
      }
    } catch (error) {
      console.error('❌ Error in download:', error)
      
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          contentType: error.response.headers['content-type']
        })
        
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text()
            throw new Error(`Server error (${error.response.status}): ${errorText}`)
          } catch (readError) {
            console.error('Failed to read error response:', readError)
          }
        }
        
        throw new Error(`Server returned ${error.response.status}: ${error.response.statusText}`)
      }
      
      throw error
    }
  }

  formatDate(dateString) {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.warn('Invalid date format:', dateString)
      return dateString
    }
  }

  getAcceptHeader(format) {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf'
      case 'excel':
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv':
        return 'text/csv'
      default:
        return 'application/octet-stream'
    }
  }
  
  getBlobType(format) {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf'
      case 'excel':
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv':
        return 'text/csv'
      default:
        return 'application/octet-stream'
    }
  }
}

export default new ReportsService()