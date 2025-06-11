<script>
  import { onMount } from 'svelte';
  import { projects, featuredProjects } from '$lib/stores';
  import ProjectCard from '$lib/components/projects/ProjectCard.svelte';
  import { formatCurrency } from '$lib/utils';
  import { Heart, Users, Target, Award, ArrowRight, TrendingUp, Globe, Shield } from 'lucide-svelte';
  
  let stats = {
    totalDonations: 2500000,
    totalProjects: 156,
    totalDonors: 3420,
    impactReached: 12500
  };
  
  let recentProjects = [];
  let featuredProjectsList = [];
  
  // Mock data for demonstration
  const mockProjects = [
    {
      id: '1',
      title: 'Clean Water for Rural Schools',
      shortDesc: 'Providing clean water access to 5 rural schools in Turkana County, benefiting over 2,000 students.',
      category: 'HEALTHCARE',
      status: 'ACTIVE',
      goalAmount: 500000,
      currentAmount: 355000,
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
    }
  ];
  
  onMount(() => {
    // Set mock data
    projects.set(mockProjects);
    featuredProjectsList = mockProjects.filter(p => p.featured);
    recentProjects = mockProjects.slice(0, 3);
  });
  
  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All donations are processed securely with full transparency on fund usage and project progress.'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Connect with projects that create lasting change in Kenyan communities nationwide.'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'Every project has clear goals and measurable outcomes to maximize your impact.'
    },
    {
      icon: Globe,
      title: 'Wide Reach',
      description: 'Support projects across Kenya, from urban centers to rural communities.'
    }
  ];
  
  const categories = [
    { name: 'Education', icon: '📚', count: 45, color: 'bg-blue-500' },
    { name: 'Healthcare', icon: '🏥', count: 32, color: 'bg-red-500' },
    { name: 'Environment', icon: '🌱', count: 28, color: 'bg-green-500' },
    { name: 'Community', icon: '🏘️', count: 23, color: 'bg-purple-500' },
    { name: 'Emergency', icon: '🚨', count: 15, color: 'bg-orange-500' },
    { name: 'Technology', icon: '💻', count: 12, color: 'bg-indigo-500' }
  ];
</script>

<svelte:head>
  <title>DonateKE - Anonymous Donations for Kenyan Communities</title>
  <meta name="description" content="Support social projects across Kenya through secure, anonymous donations. Make a difference in education, healthcare, environment, and community development." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white overflow-hidden">
  <div class="absolute inset-0 bg-black opacity-10"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Transform Lives Through
        <span class="text-emerald-200">Anonymous Giving</span>
      </h1>
      <p class="text-xl md:text-2xl mb-8 text-emerald-100 max-w-3xl mx-auto">
        Support impactful social projects across Kenya. Every donation, no matter the size, 
        creates lasting change in communities that need it most.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <a href="/projects" class="btn bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold">
          <Heart class="h-5 w-5 mr-2" />
          Start Donating
        </a>
        <a href="/about" class="btn border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold">
          Learn More
        </a>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-emerald-200 mb-2">
            {formatCurrency(stats.totalDonations)}
          </div>
          <div class="text-sm text-emerald-100">Total Donated</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-emerald-200 mb-2">
            {stats.totalProjects}+
          </div>
          <div class="text-sm text-emerald-100">Active Projects</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-emerald-200 mb-2">
            {stats.totalDonors}+
          </div>
          <div class="text-sm text-emerald-100">Generous Donors</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-emerald-200 mb-2">
            {stats.impactReached}+
          </div>
          <div class="text-sm text-emerald-100">Lives Impacted</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Featured Projects -->
{#if featuredProjectsList.length > 0}
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover high-impact projects that are making a real difference in communities across Kenya.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each featuredProjectsList as project}
          <ProjectCard {project} featured={true} />
        {/each}
      </div>
      
      <div class="text-center mt-12">
        <a href="/projects" class="btn btn-primary px-8 py-3 text-lg">
          View All Projects
          <ArrowRight class="h-5 w-5 ml-2" />
        </a>
      </div>
    </div>
  </section>
{/if}

<!-- Categories Section -->
<section class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Support What Matters to You
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Choose from various categories and find projects that align with your passion for change.
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {#each categories as category}
        <a
          href="/projects?category={category.name.toUpperCase()}"
          class="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div class="text-4xl mb-3">{category.icon}</div>
          <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {category.name}
          </h3>
          <div class="text-sm text-gray-500">{category.count} projects</div>
          <div class="w-full {category.color} h-1 rounded-full mt-3 opacity-20 group-hover:opacity-100 transition-opacity"></div>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Why Choose DonateKE?
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        We're committed to making your giving experience secure, transparent, and impactful.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each features as feature}
        <div class="text-center group">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6 group-hover:bg-emerald-200 transition-colors">
            <svelte:component this={feature.icon} class="h-8 w-8 text-emerald-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {feature.title}
          </h3>
          <p class="text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Recent Projects -->
{#if recentProjects.length > 0}
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-12">
        <div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recent Projects
          </h2>
          <p class="text-xl text-gray-600">
            Latest projects that need your support
          </p>
        </div>
        <a href="/projects" class="btn btn-outline hidden md:flex">
          View All
          <ArrowRight class="h-4 w-4 ml-2" />
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each recentProjects as project}
          <ProjectCard {project} />
        {/each}
      </div>

      <div class="text-center mt-8 md:hidden">
        <a href="/projects" class="btn btn-outline">
          View All Projects
          <ArrowRight class="h-4 w-4 ml-2" />
        </a>
      </div>
    </div>
  </section>
{/if}

<!-- Call to Action -->
<section class="py-16 bg-emerald-600 text-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-6">
      Ready to Make a Difference?
    </h2>
    <p class="text-xl mb-8 text-emerald-100">
      Join thousands of donors who are creating positive change across Kenya.
      Your contribution, no matter the size, can transform lives.
    </p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/projects" class="btn bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold">
        <Heart class="h-5 w-5 mr-2" />
        Browse Projects
      </a>
      <a href="/about" class="btn border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold">
        Learn Our Story
      </a>
    </div>
  </div>
</section>
