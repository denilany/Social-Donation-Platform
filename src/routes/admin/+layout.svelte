<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores';
  import { Shield, AlertTriangle } from 'lucide-svelte';
  
  let loading = true;
  let authorized = false;
  
  onMount(() => {
    // Check if user is logged in and has admin role
    const unsubscribe = user.subscribe(($user) => {
      loading = false;

      if (!$user) {
        // Not logged in, redirect to login
        goto('/login');
        return;
      }

      if ($user && $user.role !== 'ADMIN') {
        // Not an admin, show unauthorized message
        authorized = false;
        return;
      }

      // User is admin
      authorized = true;
    });

    return unsubscribe;
  });
</script>

<svelte:head>
  <title>Admin Dashboard - DonateKE</title>
</svelte:head>

{#if loading}
  <!-- Loading State -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if !authorized}
  <!-- Unauthorized State -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <AlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p class="text-gray-600 mb-6">
        You don't have permission to access the admin dashboard. 
        This area is restricted to administrators only.
      </p>
      <div class="space-y-3">
        <a 
          href="/" 
          class="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Homepage
        </a>
        <a 
          href="/login" 
          class="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Login as Admin
        </a>
      </div>
    </div>
  </div>
{:else}
  <!-- Authorized - Show Admin Content -->
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <Shield class="w-6 h-6 text-blue-600" />
            <div>
              <h1 class="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
              <p class="text-sm text-gray-500">DonateKE Administration</p>
            </div>
          </div>
          
          <nav class="flex space-x-6">
            <a
              href="/admin"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/admin/donations"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Donations
            </a>
            <a
              href="/admin/projects"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Projects
            </a>
            <a
              href="/"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Back to Site
            </a>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Admin Content -->
    <slot />
  </div>
{/if}
