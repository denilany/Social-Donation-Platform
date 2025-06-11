import { writable } from 'svelte/store';

/**
 * Notifications store for managing toast notifications
 */
function createNotificationsStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    update,
    add: (notification) => {
      const id = Date.now().toString();
      const newNotification = {
        id,
        timestamp: Date.now(),
        type: 'info',
        ...notification
      };
      
      update(notifications => [...notifications, newNotification]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        update(notifications => notifications.filter(n => n.id !== id));
      }, 5000);
      
      return id;
    },
    remove: (id) => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    clear: () => set([]),
    success: (message, title) => {
      return createNotificationsStore().add({ type: 'success', message, title });
    },
    error: (message, title) => {
      return createNotificationsStore().add({ type: 'error', message, title });
    },
    warning: (message, title) => {
      return createNotificationsStore().add({ type: 'warning', message, title });
    },
    info: (message, title) => {
      return createNotificationsStore().add({ type: 'info', message, title });
    }
  };
}

export const notifications = createNotificationsStore();
