export interface PushSettings {
  enabled: boolean;
  jobs: boolean;
  results: boolean;
  admitCards: boolean;
  notifications: boolean;
}

const STORAGE_KEY = 'nokri_push_settings';

export const getPushSettings = (): PushSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    enabled: false,
    jobs: true,
    results: true,
    admitCards: true,
    notifications: true,
  };
};

export const savePushSettings = (settings: PushSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const requestBrowserNotificationPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
    }
  }
  return 'denied';
};

export const sendPushNotification = (title: string, body: string, icon = '/icon.png', url = '/') => {
  // 1. Try Native Browser Notification if supported and granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon,
        badge: icon,
      });
      n.onclick = () => {
        window.focus();
        if (url) window.location.href = url;
      };
    } catch (err) {
      console.warn('Native notification failed, falling back to in-app notification:', err);
    }
  }

  // 2. Dispatch custom event for in-app floating notification toast
  const event = new CustomEvent('nokri_push_event', {
    detail: { title, body, icon, url, timestamp: new Date().toISOString() },
  });
  window.dispatchEvent(event);
};
