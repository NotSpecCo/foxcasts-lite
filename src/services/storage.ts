export enum StorageKey {
  Settings = 'settings',
}

export function getStorageItem<T>(key: StorageKey): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function setStorageItem<T>(key: StorageKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
