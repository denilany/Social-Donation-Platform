<script>
  import { page } from '$app/stores';
  import { user } from '$lib/stores';
  import { Menu, Heart, User, LogOut, Settings } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let mobileMenuOpen = false;
  let userMenuOpen = false;
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    userMenuOpen = false;
  }
  
  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
    mobileMenuOpen = false;
  }
  
  function handleLogout() {
    user.logout();
    userMenuOpen = false;
    dispatch('logout');
  }
  
  // Close menus when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-button')) {
      userMenuOpen = false;
    }
    if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
      mobileMenuOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="bg-white shadow-sm sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Heart class="h-8 w-8 text-emerald-600" />
          <span class="text-xl font-bold text-gray-900">DonateKE</span>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        {#each navItems as item}
          <a 
            href={item.href}
            class="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors"
            class:text-emerald-600={$page.url.pathname === item.href}
            class:font-semibold={$page.url.pathname === item.href}
          >
            {item.label}
          </a>
        {/each}
      </nav>
      
      <!-- User Actions -->
      <div class="flex items-center space-x-4">
        {#if $user}
          <!-- User Menu -->
          <div class="relative user-menu">
            <button 
              class="user-menu-button flex items-center space-x-2 text-gray-700 hover:text-emerald-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              on:click={toggleUserMenu}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <User class="h-5 w-5" />
              <span class="hidden sm:block text-sm font-medium">{$user.name || 'User'}</span>
            </button>
            
            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <a 
                  href="/profile" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={() => userMenuOpen = false}
                >
                  <User class="h-4 w-4 mr-2" />
                  Profile
                </a>
                <a 
                  href="/settings" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={() => userMenuOpen = false}
                >
                  <Settings class="h-4 w-4 mr-2" />
                  Settings
                </a>
                <hr class="my-1" />
                <!-- <button 
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={handleLogout}
                >
                  <LogOut class="h-4 w-4 mr-2" />
                  Sign Out
                </button> -->
              </div>
            {/if}
          </div>
        {:else}
          <!-- <a href="/auth/login" class="btn btn-primary">
            Sign In
          </a> -->
        {/if}
        
        <!-- Mobile menu button -->
        <button 
          class="mobile-menu-button md:hidden p-2 text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
          on:click={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile menu"
        >
          <Menu class="h-6 w-6" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="mobile-menu md:hidden border-t border-gray-200 py-4">
        <nav class="flex flex-col space-y-2">
          {#each navItems as item}
            <a 
              href={item.href}
              class="text-gray-700 hover:text-emerald-600 hover:bg-gray-100 px-3 py-2 text-base font-medium rounded-lg transition-colors"
              class:text-emerald-600={$page.url.pathname === item.href}
              class:bg-emerald-50={$page.url.pathname === item.href}
              on:click={() => mobileMenuOpen = false}
            >
              {item.label}
            </a>
          {/each}
          
          {#if !$user}
            <hr class="my-2" />
            <!-- <a 
              href="/auth/login" 
              class="btn btn-primary mx-3"
              on:click={() => mobileMenuOpen = false}
            >
              Sign In
            </a> -->
          {/if}
        </nav>
      </div>
    {/if}
  </div>
</header>
