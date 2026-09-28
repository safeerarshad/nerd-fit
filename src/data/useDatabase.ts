import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { adaptExpo } from './sqlite/expoAdapter';
export function useDatabase() {
  const raw = useSQLiteContext();
  return useMemo(() => adaptExpo(raw), [raw]);
}
