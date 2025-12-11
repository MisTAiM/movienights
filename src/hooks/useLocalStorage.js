/* ========================================
   useLocalStorage.js - LocalStorage Hook
   ======================================== */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - Storage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for simple boolean localStorage flags
 * @param {string} key - Storage key
 * @param {boolean} defaultValue - Default value
 * @returns {Array} [value, toggle, setValue]
 */
export function useLocalStorageFlag(key, defaultValue = false) {
  const [value, setValue] = useLocalStorage(key, defaultValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);
  
  return [value, toggle, setValue];
}

/**
 * Hook for localStorage with expiration
 * @param {string} key - Storage key
 * @param {*} initialValue - Default value
 * @param {number} expirationMs - Expiration time in milliseconds
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export function useLocalStorageWithExpiry(key, initialValue, expirationMs) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const { value, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      return value;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const item = {
        value: valueToStore,
        expiry: Date.now() + expirationMs
      };
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, expirationMs]);

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
