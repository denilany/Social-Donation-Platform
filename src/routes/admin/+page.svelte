<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores';
  import { formatCurrency } from '$lib/utils/currency.js';
  import { 
    TrendingUp, 
    DollarSign, 
    Users, 
    Target, 
    Clock, 
    CheckCircle, 
    XCircle,
    AlertCircle,
    BarChart3,
    Calendar
  } from 'lucide-svelte';
  
  let dashboardData = null;
  let loading = true;
  let error = null;
  let timeframe = '30';
  
  onMount(async () => {
    await loadDashboardData();
  });
  
  async function loadDashboardData() {
    try {
      loading = true;
      const response = await fetch(`/api/admin/dashboard?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      
      dashboardData = await response.json();
    } catch (err) {
      error = err.message;
      console.error('Dashboard error:', err);
    } finally {
      loading = false;
    }
  }
  
  async function handleTimeframeChange() {
    await loadDashboardData();
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - DonateKE</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">Monitor donations and platform performance</p>
        </div>
        
        <!-- Timeframe Selector -->
        <div class="flex items-center space-x-2">
          <Calendar class="w-5 h-5 text-gray-400" />
          <select 
            bind:value={timeframe} 
            on:change={handleTimeframeChange}
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <XCircle class="w-5 h-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p class="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {:else if dashboardData}
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Donations -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DollarSign class="w-8 h-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Raised</p>
              <p class="text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardData.overallStats.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <!-- Total Donations Count -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TrendingUp class="w-8 h-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Donations</p>
              <p class="text-2xl font-semibold text-gray-900">
                {dashboardData.overallStats.totalDonations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Active Projects -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Target class="w-8 h-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Projects</p>
              <p class="text-2xl font-semibold text-gray-900">
                {dashboardData.overallStats.activeProjects}
              </p>
            </div>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Success Rate</p>
              <p class="text-2xl font-semibold text-gray-900">
                {dashboardData.overallStats.successRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Donation Status Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Donations</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each dashboardData.recentActivity.recentDonations.slice(0, 5) as donation}
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {donation.anonymous ? 'Anonymous' : (donation.donorName || 'Unknown')}
                    </p>
                    <p class="text-sm text-gray-500">{donation.project.title}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {formatCurrency(donation.amount)}
                    </p>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(donation.paymentStatus)}">
                      {donation.paymentStatus}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
            <div class="mt-6">
              <a href="/admin/donations" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View all donations →
              </a>
            </div>
          </div>
        </div>

        <!-- Top Projects -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Top Performing Projects</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each dashboardData.projectPerformance.slice(0, 5) as project}
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{project.title}</p>
                    <p class="text-sm text-gray-500">{project.category}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {formatCurrency(project.currentAmount)}
                    </p>
                    <p class="text-sm text-gray-500">
                      {project.progressPercentage}% of goal
                    </p>
                  </div>
                </div>
              {/each}
            </div>
            <div class="mt-6">
              <a href="/admin/projects" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View all projects →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/admin/donations" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 class="w-6 h-6 text-blue-600 mr-3" />
              <span class="text-sm font-medium text-gray-900">View All Donations</span>
            </a>
            
            <a href="/admin/projects" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Target class="w-6 h-6 text-purple-600 mr-3" />
              <span class="text-sm font-medium text-gray-900">Manage Projects</span>
            </a>
            
            <a href="/admin/users" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users class="w-6 h-6 text-green-600 mr-3" />
              <span class="text-sm font-medium text-gray-900">User Management</span>
            </a>
            
            <a href="/admin/reports" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 class="w-6 h-6 text-orange-600 mr-3" />
              <span class="text-sm font-medium text-gray-900">Generate Reports</span>
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
