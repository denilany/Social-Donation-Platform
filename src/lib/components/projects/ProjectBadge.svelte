<script>
  export let type; // 'category' | 'status'
  export let value;
  export let size = 'sm'; // 'xs' | 'sm' | 'md'
  
  function getCategoryConfig(category) {
    const configs = {
      EDUCATION: { color: 'bg-blue-100 text-blue-800', icon: '📚', label: 'Education' },
      HEALTHCARE: { color: 'bg-red-100 text-red-800', icon: '🏥', label: 'Healthcare' },
      ENVIRONMENT: { color: 'bg-green-100 text-green-800', icon: '🌱', label: 'Environment' },
      COMMUNITY_DEVELOPMENT: { color: 'bg-purple-100 text-purple-800', icon: '🏘️', label: 'Community' },
      EMERGENCY_RELIEF: { color: 'bg-orange-100 text-orange-800', icon: '🚨', label: 'Emergency' },
      TECHNOLOGY: { color: 'bg-indigo-100 text-indigo-800', icon: '💻', label: 'Technology' },
      ARTS_CULTURE: { color: 'bg-pink-100 text-pink-800', icon: '🎨', label: 'Arts & Culture' },
      SPORTS: { color: 'bg-yellow-100 text-yellow-800', icon: '⚽', label: 'Sports' }
    };
    return configs[category] || { color: 'bg-gray-100 text-gray-800', icon: '📋', label: category };
  }
  
  function getStatusConfig(status) {
    const configs = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      PAUSED: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      DRAFT: { color: 'bg-gray-100 text-gray-600', label: 'Draft' }
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  }
  
  function getSizeClasses(size) {
    const sizes = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm'
    };
    return sizes[size] || sizes.sm;
  }
  
  $: config = type === 'category' ? getCategoryConfig(value) : getStatusConfig(value);
  $: sizeClasses = getSizeClasses(size);
</script>

<span class="inline-flex items-center rounded-full font-medium {config.color} {sizeClasses}">
  {#if type === 'category' && config.icon}
    <span class="mr-1">{config.icon}</span>
  {/if}
  {config.label}
</span>
