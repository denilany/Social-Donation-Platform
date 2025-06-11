<script>
  import { Heart, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-svelte';
  
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: '/projects', label: 'Browse Projects' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' }
  ];
  
  const supportLinks = [
    { href: '/help', label: 'Help Center' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/transparency', label: 'Transparency' }
  ];
  
  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' }
  ];
</script>

<footer class="bg-gray-900 text-white mt-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Brand Section -->
      <div class="lg:col-span-2">
        <div class="flex items-center space-x-2 mb-4">
          <Heart class="h-8 w-8 text-emerald-400" />
          <span class="text-xl font-bold">DonateKE</span>
        </div>
        <p class="text-gray-400 mb-6 max-w-md">
          Empowering communities through transparent and impactful donations. 
          Every contribution makes a difference in building a better Kenya.
        </p>
        
        <!-- Contact Info -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-gray-400">
            <Mail class="h-4 w-4 mr-2" />
            <span class="text-sm">info@donateke.org</span>
          </div>
          <div class="flex items-center text-gray-400">
            <Phone class="h-4 w-4 mr-2" />
            <span class="text-sm">+254 700 000 000</span>
          </div>
          <div class="flex items-center text-gray-400">
            <MapPin class="h-4 w-4 mr-2" />
            <span class="text-sm">Nairobi, Kenya</span>
          </div>
        </div>
        
        <!-- Social Links -->
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a 
              href={social.href} 
              class="text-gray-400 hover:text-emerald-400 transition-colors"
              aria-label={social.label}
            >
              <svelte:component this={social.icon} class="h-5 w-5" />
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-sm font-semibold mb-4 text-white">Quick Links</h4>
        <ul class="space-y-2">
          {#each quickLinks as link}
            <li>
              <a 
                href={link.href} 
                class="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Support -->
      <div>
        <h4 class="text-sm font-semibold mb-4 text-white">Support</h4>
        <ul class="space-y-2">
          {#each supportLinks as link}
            <li>
              <a 
                href={link.href} 
                class="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    
    <!-- Bottom Section -->
    <div class="border-t border-gray-800 mt-8 pt-8">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          &copy; {currentYear} DonateKE. All rights reserved.
        </p>
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <span class="text-gray-400 text-sm">Made with</span>
          <Heart class="h-4 w-4 text-red-500" />
          <span class="text-gray-400 text-sm">in Kenya</span>
        </div>
      </div>
    </div>
  </div>
</footer>
