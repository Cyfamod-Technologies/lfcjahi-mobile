import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
/** Wait for hydration before writes, so startup never overwrites saved data. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw && active) {
          const parsed: unknown = JSON.parse(raw);
          if (validate(parsed)) setValue(parsed);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key, validate]);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => setError(true));
  }, [key, ready, value]);
  return { value, setValue, ready, error };
}
export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((x) => typeof x === 'string');
export const isTheme = (value: unknown): value is 'dark' | 'light' =>
  value === 'dark' || value === 'light';
