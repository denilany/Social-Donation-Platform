<script>
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import NotificationToast from '$lib/components/ui/NotificationToast.svelte';
  import { onMount } from 'svelte';
  import { user, theme, language } from '$lib/stores';

  onMount(() => {
    // Initialize stores
    user.init();
    theme.init();
    language.init();
  });
</script>

<svelte:head>
  <title>DonateKE - Anonymous Donations for Kenyan Communities</title>
  <meta name="description" content="Support social projects across Kenya through secure, anonymous donations. Make a difference in education, healthcare, environment, and community development." />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <Header />
  
  <main class="flex-1">
    <slot />
  </main>
  
  <Footer />
  
  <!-- Global Notifications -->
  <NotificationToast />
</div>
