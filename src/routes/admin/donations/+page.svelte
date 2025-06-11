<script>
  import { onMount } from 'svelte';
  import { formatCurrency } from '$lib/utils/currency.js';
  import { 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
  } from 'lucide-svelte';
  
  let donations = [];
  let loading = true;
  let error = null;
  let pagination = {};
  let stats = {};
  
  // Filters
  let filters = {
    search: '',
    status: '',
    projectId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  let projects = [];
  
  onMount(async () => {
    await loadProjects();
    await loadDonations();
  });
  
  async function loadProjects() {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      projects = data.projects || [];
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }
  
  async function loadDonations() {
    try {
      loading = true;
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/admin/donations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load donations');
      }
      
      const data = await response.json();
      donations = data.donations;
      pagination = data.pagination;
      stats = data.stats;
      
    } catch (err) {
      error = err.message;
      console.error('Error loading donations:', err);
    } finally {
      loading = false;
    }
  }
  
  async function handleFilterChange() {
    filters.page = 1; // Reset to first page
    await loadDonations();
  }
  
  async function handlePageChange(newPage) {
    filters.page = newPage;
    await loadDonations();
  }
  
  async function handleSort(field) {
    if (filters.sortBy === field) {
      filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      filters.sortBy = field;
      filters.sortOrder = 'desc';
    }
    await loadDonations();
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  async function exportDonations() {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          params.append(key, value);
        }
      });
      
      // For now, we'll just download the current data as CSV
      // In a real app, you'd have a dedicated export endpoint
      const csvContent = generateCSV(donations);
      downloadCSV(csvContent, 'donations.csv');
      
    } catch (err) {
      console.error('Export error:', err);
    }
  }
  
  function generateCSV(data) {
    const headers = [
      'Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Status', 
      'Project', 'Transaction ID', 'Receipt Number', 'Payment Method'
    ];
    
    const rows = data.map(donation => [
      formatDate(donation.createdAt),
      donation.anonymous ? 'Anonymous' : (donation.donorName || ''),
      donation.anonymous ? '' : (donation.donorEmail || ''),
      donation.amount,
      donation.currency,
      donation.paymentStatus,
      donation.project.title,
      donation.transactionId || '',
      donation.receiptNumber || '',
      donation.paymentMethod
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }
  
  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Donation Management - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Donation Management</h1>
          <p class="mt-1 text-sm text-gray-500">Track and manage all donations</p>
        </div>
        
        <div class="flex space-x-3">
          <button 
            on:click={exportDonations}
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download class="w-4 h-4 mr-2" />
            Export
          </button>
          
          <a 
            href="/admin"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                bind:value={filters.search}
                on:input={handleFilterChange}
                placeholder="Search donations..."
                class="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              bind:value={filters.status}
              on:change={handleFilterChange}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <!-- Project Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select 
              bind:value={filters.projectId}
              on:change={handleFilterChange}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {#each projects as project}
                <option value={project.id}>{project.title}</option>
              {/each}
            </select>
          </div>
          
          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div class="flex space-x-2">
              <input
                type="date"
                bind:value={filters.startDate}
                on:change={handleFilterChange}
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                bind:value={filters.endDate}
                on:change={handleFilterChange}
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    {#if stats.statusStats}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {#each stats.statusStats as stat}
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm font-medium text-gray-500 uppercase">{stat.paymentStatus}</div>
            <div class="mt-1">
              <div class="text-2xl font-semibold text-gray-900">{stat._count.id}</div>
              <div class="text-sm text-gray-500">{formatCurrency(stat._sum.amount || 0)}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Donations Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Donations 
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
      {:else if error}
        <div class="p-6 text-center text-red-600">{error}</div>
      {:else if donations.length === 0}
        <div class="p-6 text-center text-gray-500">No donations found</div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => handleSort('createdAt')}>
                  <div class="flex items-center">
                    Date
                    <ArrowUpDown class="ml-1 w-3 h-3" />
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => handleSort('amount')}>
                  <div class="flex items-center">
                    Amount
                    <ArrowUpDown class="ml-1 w-3 h-3" />
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each donations as donation}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {donation.anonymous ? 'Anonymous' : (donation.donorName || 'Unknown')}
                    </div>
                    {#if !donation.anonymous && donation.donorEmail}
                      <div class="text-sm text-gray-500">{donation.donorEmail}</div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.project.title}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(donation.paymentStatus)}">
                      {donation.paymentStatus}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.paymentMethod}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900">
                      <Eye class="w-4 h-4" />
                    </button>
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
