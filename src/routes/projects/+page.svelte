<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { projects, filters } from '$lib/stores';
  import ProjectCard from '$lib/components/projects/ProjectCard.svelte';
  import { Search, Filter, SlidersHorizontal, Grid, List } from 'lucide-svelte';
  
  let filteredProjects = [];
  let allProjects = [];
  let searchTerm = '';
  let selectedCategory = '';
  let selectedStatus = '';
  let sortBy = 'recent';
  let viewMode = 'grid'; // 'grid' or 'list'
  let showFilters = false;
  let loading = true;
  let error = null;
  
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'COMMUNITY_DEVELOPMENT', label: 'Community Development' },
    { value: 'EMERGENCY_RELIEF', label: 'Emergency Relief' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
    { value: 'SPORTS', label: 'Sports' }
  ];
  
  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'COMPLETED', label: 'Completed' }
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'progress', label: 'Most Progress' },
    { value: 'amount_high', label: 'Highest Goal' },
    { value: 'amount_low', label: 'Lowest Goal' },
    { value: 'urgent', label: 'Urgent First' }
  ];
  
  // Mock projects data
  const mockProjects = [
    {
      id: '1',
      title: 'Clean Water for Rural Schools',
      shortDesc: 'Providing clean water access to 5 rural schools in Turkana County, benefiting over 2,000 students.',
      category: 'HEALTHCARE',
      status: 'ACTIVE',
      goalAmount: 500000,
      currentAmount: 325000,
      featured: true,
      imageUrl: null,
      location: 'Turkana County',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      donations: Array(45).fill(null)
    },
    {
      id: '2',
      title: 'Digital Learning Center',
      shortDesc: 'Establishing a computer lab with internet access for students in Kibera slums.',
      category: 'EDUCATION',
      status: 'URGENT',
      goalAmount: 800000,
      currentAmount: 120000,
      featured: true,
      imageUrl: null,
      location: 'Nairobi',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      donations: Array(23).fill(null)
    },
    {
      id: '3',
      title: 'Tree Planting Initiative',
      shortDesc: 'Planting 10,000 indigenous trees to combat deforestation in Mount Kenya region.',
      category: 'ENVIRONMENT',
      status: 'ACTIVE',
      goalAmount: 300000,
      currentAmount: 280000,
      featured: false,
      imageUrl: null,
      location: 'Mount Kenya',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      donations: Array(67).fill(null)
    },
    {
      id: '4',
      title: 'Mobile Health Clinic',
      shortDesc: 'Bringing healthcare services to remote villages in Marsabit County.',
      category: 'HEALTHCARE',
      status: 'ACTIVE',
      goalAmount: 1200000,
      currentAmount: 450000,
      featured: false,
      imageUrl: null,
      location: 'Marsabit County',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      donations: Array(89).fill(null)
    },
    {
      id: '5',
      title: 'Girls Education Support',
      shortDesc: 'Providing scholarships and school supplies for girls in rural areas.',
      category: 'EDUCATION',
      status: 'ACTIVE',
      goalAmount: 600000,
      currentAmount: 380000,
      featured: false,
      imageUrl: null,
      location: 'Kajiado County',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      donations: Array(56).fill(null)
    },
    {
      id: '6',
      title: 'Solar Power for Community Center',
      shortDesc: 'Installing solar panels to provide reliable electricity for community activities.',
      category: 'TECHNOLOGY',
      status: 'URGENT',
      goalAmount: 400000,
      currentAmount: 85000,
      featured: false,
      imageUrl: null,
      location: 'Kilifi County',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      donations: Array(18).fill(null)
    }
  ];
  
  onMount(async () => {
    // Get URL parameters
    const urlParams = new URLSearchParams($page.url.search);
    selectedCategory = urlParams.get('category') || '';
    selectedStatus = urlParams.get('status') || '';
    searchTerm = urlParams.get('search') || '';
    sortBy = urlParams.get('sort') || 'recent';

    // Load projects from API
    await loadProjects();
  });

  async function loadProjects() {
    try {
      loading = true;
      error = null;

      const response = await fetch('/api/projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load projects');
      }

      allProjects = data.projects || [];
      projects.set(allProjects);

      // Apply initial filters
      applyFilters();
    } catch (err) {
      console.error('Error loading projects:', err);
      error = err instanceof Error ? err.message : 'Failed to load projects';
      // Fallback to mock data if API fails
      allProjects = mockProjects;
      projects.set(mockProjects);
      applyFilters();
    } finally {
      loading = false;
    }
  }
  
  function applyFilters() {
    let filtered = [...allProjects];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(search) ||
        project.shortDesc.toLowerCase().includes(search) ||
        project.location.toLowerCase().includes(search)
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }
    
    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }
    
    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'progress':
        filtered.sort((a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount));
        break;
      case 'amount_high':
        filtered.sort((a, b) => b.goalAmount - a.goalAmount);
        break;
      case 'amount_low':
        filtered.sort((a, b) => a.goalAmount - b.goalAmount);
        break;
      case 'urgent':
        filtered.sort((a, b) => {
          if (a.status === 'URGENT' && b.status !== 'URGENT') return -1;
          if (b.status === 'URGENT' && a.status !== 'URGENT') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }
    
    filteredProjects = filtered;
  }
  
  function handleSearch() {
    applyFilters();
    updateURL();
  }
  
  function handleFilterChange() {
    applyFilters();
    updateURL();
  }
  
  function updateURL() {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'recent') params.set('sort', sortBy);
    
    const newURL = params.toString() ? `?${params.toString()}` : '/projects';
    window.history.replaceState({}, '', newURL);
  }
  
  function clearFilters() {
    searchTerm = '';
    selectedCategory = '';
    selectedStatus = '';
    sortBy = 'recent';
    applyFilters();
    window.history.replaceState({}, '', '/projects');
  }
</script>

<svelte:head>
  <title>Browse Projects - DonateKE</title>
  <meta name="description" content="Discover and support social projects across Kenya. Find causes that matter to you and make a difference through anonymous donations." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Browse Projects
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover impactful projects across Kenya and support causes that matter to you.
        </p>
      </div>
    </div>
  </div>
  
  <!-- Filters and Search -->
  <div class="bg-white border-b border-gray-200 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Search Bar -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              bind:value={searchTerm}
              on:input={handleSearch}
              class="input pl-10 pr-4"
            />
          </div>
        </div>
        
        <!-- Filter Controls -->
        <div class="flex items-center gap-4">
          <!-- Mobile Filter Toggle -->
          <button
            class="lg:hidden btn btn-secondary"
            on:click={() => showFilters = !showFilters}
          >
            <Filter class="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <!-- View Mode Toggle -->
          <div class="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              class="p-2 {viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
              on:click={() => viewMode = 'grid'}
            >
              <Grid class="h-4 w-4" />
            </button>
            <button
              class="p-2 {viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
              on:click={() => viewMode = 'list'}
            >
              <List class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Results Count -->
          <span class="text-sm text-gray-600">
            {filteredProjects.length} projects
          </span>
        </div>
      </div>

      <!-- Desktop Filters -->
      <div class="hidden lg:flex items-center gap-4 mt-4">
        <select
          bind:value={selectedCategory}
          on:change={handleFilterChange}
          class="input w-auto"
        >
          {#each categories as category}
            <option value={category.value}>{category.label}</option>
          {/each}
        </select>

        <select
          bind:value={selectedStatus}
          on:change={handleFilterChange}
          class="input w-auto"
        >
          {#each statuses as status}
            <option value={status.value}>{status.label}</option>
          {/each}
        </select>

        <select
          bind:value={sortBy}
          on:change={handleFilterChange}
          class="input w-auto"
        >
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>

        {#if selectedCategory || selectedStatus || searchTerm || sortBy !== 'recent'}
          <button
            on:click={clearFilters}
            class="btn btn-secondary text-sm"
          >
            Clear Filters
          </button>
        {/if}
      </div>

      <!-- Mobile Filters -->
      {#if showFilters}
        <div class="lg:hidden mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label class="label">Category</label>
            <select
              bind:value={selectedCategory}
              on:change={handleFilterChange}
              class="input"
            >
              {#each categories as category}
                <option value={category.value}>{category.label}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="label">Status</label>
            <select
              bind:value={selectedStatus}
              on:change={handleFilterChange}
              class="input"
            >
              {#each statuses as status}
                <option value={status.value}>{status.label}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="label">Sort By</label>
            <select
              bind:value={sortBy}
              on:change={handleFilterChange}
              class="input"
            >
              {#each sortOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          {#if selectedCategory || selectedStatus || searchTerm || sortBy !== 'recent'}
            <button
              on:click={clearFilters}
              class="btn btn-secondary w-full"
            >
              Clear All Filters
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Projects Grid/List -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <!-- Loading State -->
      <div class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading projects...</p>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="text-center py-16">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Failed to load projects
        </h3>
        <p class="text-gray-600 mb-6">
          {error}
        </p>
        <button
          on:click={loadProjects}
          class="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    {:else if filteredProjects.length === 0}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No projects found
        </h3>
        <p class="text-gray-600 mb-6">
          Try adjusting your search criteria or browse all projects.
        </p>
        <button
          on:click={clearFilters}
          class="btn btn-primary"
        >
          Clear Filters
        </button>
      </div>
    {:else}
      <!-- Projects Grid -->
      <div class="grid grid-cols-1 {viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-8">
        {#each filteredProjects as project}
          <ProjectCard {project} compact={viewMode === 'list'} />
        {/each}
      </div>

      <!-- Load More (Placeholder for pagination) -->
      {#if filteredProjects.length >= 6}
        <div class="text-center mt-12">
          <button class="btn btn-secondary px-8 py-3">
            Load More Projects
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
