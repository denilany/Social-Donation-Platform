<script>
  import { notifications } from '$lib/stores';
  import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  
  function getIcon(type) {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  }
  
  function getColorClasses(type) {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50 text-green-800';
      case 'error': return 'border-red-500 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  }
  
  function getIconColor(type) {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  }
</script>

<!-- Notifications Container -->
<div class="fixed top-20 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
  {#each $notifications as notification (notification.id)}
    <div 
      class="pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 p-4 {getColorClasses(notification.type)}"
      transition:fly={{ x: 300, duration: 300 }}
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svelte:component 
            this={getIcon(notification.type)} 
            class="h-5 w-5 {getIconColor(notification.type)}" 
          />
        </div>
        <div class="ml-3 flex-1">
          {#if notification.title}
            <h4 class="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
          {/if}
          <p class="text-sm text-gray-600">
            {notification.message}
          </p>
        </div>
        <button 
          class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          on:click={() => notifications.remove(notification.id)}
          aria-label="Close notification"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  {/each}
</div>
