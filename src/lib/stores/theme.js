import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Theme store for managing dark/light mode
 */
function createThemeStore() {
  const { subscribe, set, update } = writable('light');

  return {
    subscribe,
    set,
    update,
    toggle: () => {
      update(theme => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        if (browser) {
          localStorage.setItem('theme', newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
        return newTheme;
      });
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        
        set(theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  };
}

export const theme = createThemeStore();
