<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-white/50 backdrop-blur-sm">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(79,70,229,0.1)_1px,transparent_0)] [background-size:24px_24px]"></div>
    </div>
    
    <!-- Main Content -->
    <div class="relative w-full max-w-md z-10">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-indigo-900 mb-2">Temple SaaS</h1>
        <p class="text-indigo-600 text-sm">Manage your temple with ease</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <LoginForm />
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-indigo-600/80">
          © 2025 Temple SaaS. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-10 left-10 w-20 h-20 bg-indigo-200/30 rounded-full blur-xl"></div>
    <div class="absolute bottom-10 right-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl"></div>
    <div class="absolute top-1/2 left-1/4 w-4 h-4 bg-indigo-400/40 rounded-full"></div>
    <div class="absolute top-1/3 right-1/3 w-6 h-6 bg-indigo-500/30 rounded-full"></div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'

// Set page title
document.title = 'Login - Temple SaaS'
</script>