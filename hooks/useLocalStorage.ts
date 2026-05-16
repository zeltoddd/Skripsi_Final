import { useState, useEffect } from 'react';

interface StoredValueWithTTL<T> {
  value: T;
  expiresAt: number | null;
}

export function useLocalStorage<T>(key: string, initialValue: T, ttlMs: number | null = null) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed: StoredValueWithTTL<T> = JSON.parse(item);
      
      // Check TTL
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      // Backwards compatibility for values without TTL wrapper
      if (parsed.value === undefined && parsed.expiresAt === undefined) {
        return parsed as unknown as T;
      }
      
      return parsed.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        const itemToStore: StoredValueWithTTL<T> = {
          value: valueToStore,
          expiresAt: ttlMs ? Date.now() + ttlMs : null,
        };
        window.localStorage.setItem(key, JSON.stringify(itemToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
