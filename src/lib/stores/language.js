import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Language store for managing internationalization
 */
function createLanguageStore() {
  const { subscribe, set, update } = writable('en');

  return {
    subscribe,
    set,
    update,
    setLanguage: (lang) => {
      set(lang);
      if (browser) {
        localStorage.setItem('language', lang);
      }
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('language');
        const browserLang = navigator.language.split('-')[0];
        const supportedLangs = ['en', 'sw']; // English and Swahili
        
        const lang = stored || (supportedLangs.includes(browserLang) ? browserLang : 'en');
        set(lang);
      }
    }
  };
}

export const language = createLanguageStore();
