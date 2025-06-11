import { writable } from 'svelte/store';

/**
 * Filters store for managing project filtering state
 */
function createFiltersStore() {
  const { subscribe, set, update } = writable({
    category: '',
    status: '',
    search: '',
    sortBy: 'recent',
    location: ''
  });

  return {
    subscribe,
    set,
    update,
    reset: () => set({
      category: '',
      status: '',
      search: '',
      sortBy: 'recent',
      location: ''
    }),
    setCategory: (category) => update(filters => ({ ...filters, category })),
    setStatus: (status) => update(filters => ({ ...filters, status })),
    setSearch: (search) => update(filters => ({ ...filters, search })),
    setSortBy: (sortBy) => update(filters => ({ ...filters, sortBy })),
    setLocation: (location) => update(filters => ({ ...filters, location }))
  };
}

export const filters = createFiltersStore();
