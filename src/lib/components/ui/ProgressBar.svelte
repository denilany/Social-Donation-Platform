<script>
  export let progress = 0; // 0-100
  export let height = 'h-2'; // Tailwind height class
  export let animated = true;
  export let showPercentage = false;
  export let color = 'emerald'; // emerald, blue, red, yellow, etc.
  
  function getColorClasses(color, progress) {
    const baseColors = {
      emerald: 'from-emerald-500 to-green-500',
      blue: 'from-blue-500 to-indigo-500',
      red: 'from-red-500 to-pink-500',
      yellow: 'from-yellow-500 to-orange-500',
      purple: 'from-purple-500 to-indigo-500',
      green: 'from-green-500 to-emerald-500'
    };
    
    // Auto color based on progress
    if (color === 'auto') {
      if (progress >= 100) return baseColors.green;
      if (progress >= 75) return baseColors.emerald;
      if (progress >= 50) return baseColors.yellow;
      if (progress >= 25) return baseColors.blue;
      return baseColors.red;
    }
    
    return baseColors[color] || baseColors.emerald;
  }
  
  $: colorClasses = getColorClasses(color, progress);
  $: clampedProgress = Math.min(Math.max(progress, 0), 100);
</script>

<div class="w-full">
  {#if showPercentage}
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm font-medium text-gray-700">Progress</span>
      <span class="text-sm text-gray-500">{clampedProgress.toFixed(1)}%</span>
    </div>
  {/if}
  
  <div class="w-full bg-gray-200 rounded-full {height} overflow-hidden">
    <div 
      class="h-full bg-gradient-to-r {colorClasses} transition-all duration-500 ease-out"
      class:animate-pulse={animated && progress > 0}
      style="width: {clampedProgress}%"
    >
      {#if animated}
        <div class="h-full w-full bg-white opacity-20 animate-pulse"></div>
      {/if}
    </div>
  </div>
</div>
