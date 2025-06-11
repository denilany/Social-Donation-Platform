<script>
  import { onMount } from 'svelte';
  import { formatCurrency } from '$lib/utils/currency.js';
  import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Target,
    MapPin,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  
  let projects = [];
  let loading = true;
  let error = null;
  let pagination = {};
  let showCreateModal = false;
  let showDeleteModal = false;
  let selectedProject = null;
  
  // Filters
  let filters = {
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  // Form data for creating/editing projects
  let formData = {
    title: '',
    description: '',
    shortDesc: '',
    category: 'COMMUNITY_DEVELOPMENT',
    status: 'ACTIVE',
    goalAmount: '',
    imageUrl: '',
    location: '',
    startDate: '',
    endDate: '',
    featured: false
  };
  
  const categories = [
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
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'DRAFT', label: 'Draft' }
  ];
  
  onMount(async () => {
    await loadProjects();
  });
  
  async function loadProjects() {
    try {
      loading = true;
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/admin/projects?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      
      const data = await response.json();
      projects = data.projects;
      pagination = data.pagination;
      
    } catch (err) {
      error = err.message;
      console.error('Error loading projects:', err);
    } finally {
      loading = false;
    }
  }
  
  async function handleFilterChange() {
    filters.page = 1;
    await loadProjects();
  }
  
  async function handlePageChange(newPage) {
    filters.page = newPage;
    await loadProjects();
  }
  
  function openCreateModal() {
    formData = {
      title: '',
      description: '',
      shortDesc: '',
      category: 'COMMUNITY_DEVELOPMENT',
      status: 'ACTIVE',
      goalAmount: '',
      imageUrl: '',
      location: '',
      startDate: '',
      endDate: '',
      featured: false
    };
    selectedProject = null;
    showCreateModal = true;
  }
  
  function openEditModal(project) {
    formData = {
      title: project.title,
      description: project.description,
      shortDesc: project.shortDesc || '',
      category: project.category,
      status: project.status,
      goalAmount: project.goalAmount.toString(),
      imageUrl: project.imageUrl || '',
      location: project.location || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      featured: project.featured
    };
    selectedProject = project;
    showCreateModal = true;
  }
  
  function openDeleteModal(project) {
    selectedProject = project;
    showDeleteModal = true;
  }
  
  async function handleSubmit() {
    try {
      const url = selectedProject 
        ? `/api/admin/projects/${selectedProject.id}` 
        : '/api/admin/projects';
      
      const method = selectedProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showCreateModal = false;
        selectedProject = null;
        await loadProjects();
      } else {
        throw new Error(result.error || 'Failed to save project');
      }
      
    } catch (err) {
      error = err.message;
      console.error('Error saving project:', err);
    }
  }
  
  async function handleDelete() {
    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showDeleteModal = false;
        selectedProject = null;
        await loadProjects();
      } else {
        throw new Error(result.error || 'Failed to delete project');
      }
      
    } catch (err) {
      error = err.message;
      console.error('Error deleting project:', err);
    }
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getCategoryColor(category) {
    switch (category) {
      case 'EDUCATION': return 'bg-blue-100 text-blue-800';
      case 'HEALTHCARE': return 'bg-red-100 text-red-800';
      case 'ENVIRONMENT': return 'bg-green-100 text-green-800';
      case 'COMMUNITY_DEVELOPMENT': return 'bg-purple-100 text-purple-800';
      case 'EMERGENCY_RELIEF': return 'bg-orange-100 text-orange-800';
      case 'TECHNOLOGY': return 'bg-indigo-100 text-indigo-800';
      case 'ARTS_CULTURE': return 'bg-pink-100 text-pink-800';
      case 'SPORTS': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Project Management - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Project Management</h1>
          <p class="mt-1 text-sm text-gray-500">Create and manage donation projects</p>
        </div>
        
        <div class="flex space-x-3">
          <button 
            on:click={openCreateModal}
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus class="w-4 h-4 mr-2" />
            Create Project
          </button>
          
          <a 
            href="/admin"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Filters</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="search"
                type="text"
                bind:value={filters.search}
                on:input={handleFilterChange}
                placeholder="Search projects..."
                class="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- Category Filter -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              id="category"
              bind:value={filters.category}
              on:change={handleFilterChange}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {#each categories as category}
                <option value={category.value}>{category.label}</option>
              {/each}
            </select>
          </div>
          
          <!-- Status Filter -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              id="status"
              bind:value={filters.status}
              on:change={handleFilterChange}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {#each statuses as status}
                <option value={status.value}>{status.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}

    <!-- Projects Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Projects 
          {#if pagination.total}
            <span class="text-sm font-normal text-gray-500">
              ({pagination.total.toLocaleString()} total)
            </span>
          {/if}
        </h3>
      </div>
      
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if projects.length === 0}
        <div class="p-6 text-center text-gray-500">
          <p>No projects found</p>
          <button 
            on:click={openCreateModal}
            class="mt-2 text-blue-600 hover:text-blue-500"
          >
            Create your first project
          </button>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each projects as project}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      {#if project.imageUrl}
                        <img class="h-10 w-10 rounded-lg object-cover mr-3" src={project.imageUrl} alt={project.title} />
                      {:else}
                        <div class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                          <Target class="h-5 w-5 text-gray-400" />
                        </div>
                      {/if}
                      <div>
                        <div class="text-sm font-medium text-gray-900">{project.title}</div>
                        <div class="text-sm text-gray-500 truncate max-w-xs">{project.shortDesc}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCategoryColor(project.category)}">
                      {categories.find(c => c.value === project.category)?.label || project.category}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(project.status)}">
                      {statuses.find(s => s.value === project.status)?.label || project.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(project.goalAmount)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{formatCurrency(project.currentAmount)}</div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        style="width: {Math.min((project.currentAmount / project.goalAmount) * 100, 100)}%"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500">
                      {Math.round((project.currentAmount / project.goalAmount) * 100)}% of goal
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        on:click={() => openEditModal(project)}
                        class="text-blue-600 hover:text-blue-900"
                        title="Edit project"
                      >
                        <Edit class="w-4 h-4" />
                      </button>
                      <button 
                        on:click={() => openDeleteModal(project)}
                        class="text-red-600 hover:text-red-900"
                        title="Delete project"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        {#if pagination.totalPages > 1}
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button 
                on:click={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                on:click={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing page <span class="font-medium">{pagination.page}</span> of <span class="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    on:click={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft class="w-5 h-5" />
                  </button>
                  <button 
                    on:click={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight class="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<!-- Create/Edit Project Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {selectedProject ? 'Edit Project' : 'Create New Project'}
        </h3>

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              id="title"
              type="text"
              bind:value={formData.title}
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project title"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              id="description"
              bind:value={formData.description}
              required
              rows="4"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed project description"
            ></textarea>
          </div>

          <!-- Short Description -->
          <div>
            <label for="shortDesc" class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              id="shortDesc"
              bind:value={formData.shortDesc}
              rows="2"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary (auto-generated if empty)"
            ></textarea>
          </div>

          <!-- Goal Amount -->
          <div>
            <label for="goalAmount" class="block text-sm font-medium text-gray-700 mb-1">Goal Amount (KES) *</label>
            <input
              id="goalAmount"
              type="number"
              bind:value={formData.goalAmount}
              required
              min="1"
              step="1"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal amount in KES"
            />
          </div>

          <!-- Category and Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                bind:value={formData.category}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {#each categories as category}
                  <option value={category.value}>{category.label}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                bind:value={formData.status}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {#each statuses as status}
                  <option value={status.value}>{status.label}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Image URL and Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                id="imageUrl"
                type="url"
                bind:value={formData.imageUrl}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                id="location"
                type="text"
                bind:value={formData.location}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project location"
              />
            </div>
          </div>

          <!-- Start and End Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id="startDate"
                type="date"
                bind:value={formData.startDate}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id="endDate"
                type="date"
                bind:value={formData.endDate}
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Featured Checkbox -->
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={formData.featured}
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-700">Featured Project</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              on:click={() => { showCreateModal = false; selectedProject = null; }}
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {selectedProject ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && selectedProject}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <Trash2 class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Project</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete "{selectedProject.title}"? This action cannot be undone.
          </p>
          {#if selectedProject._count?.donations > 0}
            <p class="text-sm text-red-600 mt-2">
              Warning: This project has {selectedProject._count.donations} donation(s). Deletion may not be allowed.
            </p>
          {/if}
        </div>
        <div class="flex justify-center space-x-3 mt-4">
          <button
            on:click={() => { showDeleteModal = false; selectedProject = null; }}
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            on:click={handleDelete}
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
