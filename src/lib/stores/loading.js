import { writable } from 'svelte/store';

/**
 * Loading states store for managing loading indicators
 */
function createLoadingStore() {
  const { subscribe, set, update } = writable({
    projects: false,
    donations: false,
    payment: false,
    auth: false
  });

  return {
    subscribe,
    set,
    update,
    setLoading: (key, value) => {
      update(loading => ({ ...loading, [key]: value }));
    },
    setProjects: (value) => {
      update(loading => ({ ...loading, projects: value }));
    },
    setDonations: (value) => {
      update(loading => ({ ...loading, donations: value }));
    },
    setPayment: (value) => {
      update(loading => ({ ...loading, payment: value }));
    },
    setAuth: (value) => {
      update(loading => ({ ...loading, auth: value }));
    }
  };
}

export const loading = createLoadingStore();
