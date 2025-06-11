import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * User store for managing authentication state
 */
function createUserStore() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    set,
    update,
    login: (userData) => set(userData),
    logout: () => {
      set(null);
      if (browser) {
        localStorage.removeItem('user');
      }
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            set(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
            localStorage.removeItem('user');
          }
        }
      }
    }
  };
}

export const user = createUserStore();
