import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiBaseUrl, fetchCollection } from '../api';

/** Cache raw API data, so cached and live responses use the same validation. */
export function useRemoteCollection<T>(
  path: 'media' | 'districts',
  normalize: (items: unknown[]) => T[],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const key = `lfc-api-v1:${apiBaseUrl}:${path}`;
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const items = await fetchCollection(path, controller.signal);
      if (controller.signal.aborted) return;
      setData(normalize(items));
      setCached(false);
      try {
        await AsyncStorage.setItem(key, JSON.stringify(items));
      } catch {
        if (!controller.signal.aborted) setStorageError(true);
      }
    } catch {
      if (!controller.signal.aborted)
        setError('Unable to refresh. Check your connection and try again.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [key, normalize, path]);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const items: unknown = raw ? JSON.parse(raw) : null;
        if (active && Array.isArray(items)) {
          setData(normalize(items));
          setCached(true);
        }
      } catch {
        if (active) setStorageError(true);
      }
      if (active) void refresh();
    })();
    return () => {
      active = false;
      request.current?.abort();
    };
  }, [key, normalize, refresh]);
  return { data, loading, error, cached, storageError, refresh };
}
