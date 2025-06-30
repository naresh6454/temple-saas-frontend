// src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export const useToast = () => {
  // Toast types with indigo theme styling
  const TOAST_TYPES = {
    SUCCESS: {
      icon: '✅',
      bgClass: 'bg-green-50 border-green-200',
      textClass: 'text-green-800',
      iconClass: 'text-green-600'
    },
    ERROR: {
      icon: '❌',
      bgClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-800',
      iconClass: 'text-red-600'
    },
    WARNING: {
      icon: '⚠️',
      bgClass: 'bg-yellow-50 border-yellow-200',
      textClass: 'text-yellow-800',
      iconClass: 'text-yellow-600'
    },
    INFO: {
      icon: 'ℹ️',
      bgClass: 'bg-indigo-50 border-indigo-200',
      textClass: 'text-indigo-800',
      iconClass: 'text-indigo-600'
    }
  }

  // Main toast function - can handle both the original function signature and the newer one
  const showToast = (options) => {
    // Handle both formats:
    // showToast('message', 'SUCCESS', 5000) and
    // showToast({ type: 'success', message: 'Hello', duration: 5000 })
    
    let message, type, duration;
    
    if (typeof options === 'object') {
      // New format with options object
      message = options.message;
      // Convert type to uppercase to match TOAST_TYPES keys
      type = (options.type || 'info').toUpperCase();
      duration = options.duration || 5000;
    } else {
      // Old format with separate arguments
      message = options;
      type = arguments[1] || 'INFO';
      duration = arguments[2] || 5000;
    }
    
    // Make sure type is uppercase
    if (typeof type === 'string' && type.toUpperCase() !== type) {
      type = type.toUpperCase();
    }
    
    return addToast(message, type, duration);
  };

  const addToast = (message, type = 'INFO', duration = 5000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      duration,
      ...TOAST_TYPES[type],
      timestamp: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Convenience methods for different toast types
  const success = (message, duration = 5000) => {
    return addToast(message, 'SUCCESS', duration)
  }

  const error = (message, duration = 7000) => {
    return addToast(message, 'ERROR', duration)
  }

  const warning = (message, duration = 6000) => {
    return addToast(message, 'WARNING', duration)
  }

  const info = (message, duration = 5000) => {
    return addToast(message, 'INFO', duration)
  }

  // For API responses
  const handleApiResponse = (response, successMessage = 'Operation completed successfully') => {
    if (response.success) {
      success(successMessage)
    } else {
      error(response.message || 'Something went wrong')
    }
  }

  // For form submissions
  const handleFormSubmit = async (submitFn, successMessage = 'Form submitted successfully') => {
    try {
      const result = await submitFn()
      success(successMessage)
      return result
    } catch (error) {
      error(error.message || 'Form submission failed')
      throw error
    }
  }

  return {
    // State
    toasts: toasts,
    
    // Methods
    addToast,
    removeToast,
    clearAllToasts,
    
    // Added to fix the error with showToast not being a function
    showToast,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    
    // Helper methods
    handleApiResponse,
    handleFormSubmit,
    
    // Constants
    TOAST_TYPES
  }
}

// Create and export a singleton instance for global use
// This ensures components can use the same toast instance
const toastInstance = useToast();
export default toastInstance;