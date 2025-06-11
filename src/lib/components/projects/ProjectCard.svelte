<script>
  import { formatCurrency, calculateProgress, timeAgo } from '$lib/utils';
  import { Heart, MapPin, Clock, Users, Star } from 'lucide-svelte';
  import ProjectBadge from './ProjectBadge.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import DonationForm from '../donations/DonationForm.svelte';

  export let project;
  export let featured = false;
  export let compact = false;

  let showDonationForm = false;

  $: progress = calculateProgress(project.currentAmount, project.goalAmount);
  $: remaining = project.goalAmount - project.currentAmount;
  $: donorCount = project.donations?.length || 0;

  function openDonationForm() {
    showDonationForm = true;
  }

  function handleDonationSuccess(event) {
    // Update project current amount
    project.currentAmount += event.detail.donation.amount;
    project = project; // Trigger reactivity
  }
</script>

<div 
  class="card group hover:shadow-lg transition-all duration-300 {compact ? 'h-auto' : ''}"
  class:ring-2={featured} 
  class:ring-emerald-500={featured}
  class:ring-offset-2={featured}
>
  <!-- Project Image -->
  <div class="relative {compact ? 'h-32' : 'h-48'} overflow-hidden">
    {#if project.imageUrl}
      <img 
        src={project.imageUrl} 
        alt={project.title}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
        <Heart class="h-12 w-12 text-white opacity-50" />
      </div>
    {/if}
    
    <!-- Status Badge -->
    <div class="absolute top-3 left-3">
      <ProjectBadge type="status" value={project.status} />
    </div>
    
    <!-- Featured Badge -->
    {#if project.featured}
      <div class="absolute top-3 right-3">
        <div class="flex items-center px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
          <Star class="h-3 w-3 mr-1" />
          Featured
        </div>
      </div>
    {/if}
    
    <!-- Urgent Overlay -->
    {#if project.status === 'URGENT'}
      <div class="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center">
        <div class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          URGENT
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Project Content -->
  <div class="p-4 {compact ? 'space-y-2' : 'space-y-4'}">
    <!-- Category -->
    <div class="flex items-center justify-between">
      <ProjectBadge type="category" value={project.category} />
      {#if !compact}
        <div class="flex items-center text-gray-500 text-xs">
          <Users class="h-3 w-3 mr-1" />
          {donorCount} donors
        </div>
      {/if}
    </div>
    
    <!-- Title -->
    <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
      <a href="/projects/{project.id}" class="hover:underline">
        {project.title}
      </a>
    </h3>
    
    <!-- Description -->
    {#if !compact}
      <p class="text-gray-600 text-sm line-clamp-3">
        {project.shortDesc}
      </p>
    {/if}
    
    <!-- Location & Time -->
    <div class="flex items-center text-gray-500 text-xs space-x-4">
      {#if project.location}
        <div class="flex items-center">
          <MapPin class="h-3 w-3 mr-1" />
          <span class="truncate">{project.location}</span>
        </div>
      {/if}
      <div class="flex items-center">
        <Clock class="h-3 w-3 mr-1" />
        {timeAgo(project.createdAt)}
      </div>
    </div>
    
    <!-- Progress -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Progress</span>
        <span class="text-sm text-gray-500">{progress.toFixed(1)}%</span>
      </div>
      <ProgressBar {progress} />
    </div>
    
    <!-- Funding Info -->
    <div class="flex justify-between items-center">
      <div>
        <p class="text-lg font-bold text-gray-900">
          {formatCurrency(project.currentAmount)}
        </p>
        <p class="text-xs text-gray-500">
          raised of {formatCurrency(project.goalAmount)}
        </p>
      </div>
      {#if !compact}
        <div class="text-right">
          <p class="text-sm font-medium text-gray-700">
            {formatCurrency(remaining)}
          </p>
          <p class="text-xs text-gray-500">remaining</p>
        </div>
      {/if}
    </div>
    
    <!-- Action Buttons -->
    <div class="flex space-x-3 pt-2">
      <button
        on:click={openDonationForm}
        class="flex-1 btn btn-primary text-center text-sm"
      >
        <Heart class="h-4 w-4 mr-1" />
        Donate Now
      </button>
      {#if !compact}
        <a
          href="/projects/{project.id}"
          class="btn btn-secondary text-sm"
        >
          Learn More
        </a>
      {/if}
    </div>
  </div>
</div>

<!-- Donation Form Modal -->
<DonationForm
  {project}
  bind:showModal={showDonationForm}
  on:success={handleDonationSuccess}
  on:close={() => showDonationForm = false}
/>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
