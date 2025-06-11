<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores';
  import { Heart, Mail, Lock, AlertCircle } from 'lucide-svelte';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let checkingAuth = true;

  onMount(() => {
    // Check if user is already logged in
    const unsubscribe = user.subscribe(($user) => {
      checkingAuth = false;
      if ($user) {
        // User is already logged in, redirect based on role
        if ($user.role === 'ADMIN') {
          goto('/admin');
        } else {
          goto('/');
        }
      }
    });

    return unsubscribe;
  });

  async function handleLogin() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    try {
      loading = true;
      error = '';
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        user.login(data.user);
        
        // Store user data in localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Redirect to admin dashboard if admin, otherwise home
        if (data.user.role === 'ADMIN') {
          goto('/admin');
        } else {
          goto('/');
        }
      } else {
        error = data.error || 'Login failed';
      }
      
    } catch (err) {
      error = 'Network error. Please try again.';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>Login - DonateKE</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  {#if checkingAuth}
    <!-- Checking authentication state -->
    <div class="flex justify-center items-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  {:else}
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="flex justify-center">
        <a href="/" class="flex items-center space-x-2">
          <Heart class="h-10 w-10 text-emerald-600" />
          <span class="text-2xl font-bold text-gray-900">DonateKE</span>
        </a>
      </div>

      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Access the admin dashboard to manage donations
      </p>
    </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <!-- Demo Credentials Info -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 class="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
        <div class="text-sm text-blue-700">
          <p><strong>Email:</strong> admin@donateke.org</p>
          <p><strong>Password:</strong> demo123</p>
        </div>
      </div>
      
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <!-- Error Message -->
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <AlertCircle class="w-5 h-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div class="mt-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              on:keypress={handleKeyPress}
              class="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="mt-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              bind:value={password}
              on:keypress={handleKeyPress}
              class="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            disabled={loading}
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            {:else}
              Sign in
            {/if}
          </button>
        </div>
      </form>
      
      <!-- Back to Home -->
      <div class="mt-6 text-center">
        <a href="/" class="text-sm text-emerald-600 hover:text-emerald-500">
          ← Back to home
        </a>
      </div>
    </div>
  </div>
  {/if}
</div>
