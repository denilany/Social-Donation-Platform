import { writable, derived } from 'svelte/store';

/**
 * Projects store for managing project data
 */
export const projects = writable([]);

/**
 * Derived store for featured projects
 */
export const featuredProjects = derived(
  projects, 
  $projects => $projects.filter(p => p.featured)
);

/**
 * Derived store for active projects
 */
export const activeProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'ACTIVE')
);

/**
 * Derived store for urgent projects
 */
export const urgentProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'URGENT')
);
