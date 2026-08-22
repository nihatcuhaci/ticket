import { useCallback, useEffect, useState } from 'react';
import { RecentSearch, SearchCriteria } from '../types';
import {
  addRecentSearch,
  clearRecentSearches,
  loadRecentSearches,
  removeRecentSearch,
} from '../services/recentSearches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadRecentSearches().then((entries) => {
      if (!cancelled) setRecentSearches(entries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const recordSearch = useCallback((criteria: SearchCriteria) => {
    addRecentSearch(criteria).then(setRecentSearches);
  }, []);

  const removeSearch = useCallback((id: string) => {
    removeRecentSearch(id).then(setRecentSearches);
  }, []);

  const clear = useCallback(() => {
    clearRecentSearches().then(() => setRecentSearches([]));
  }, []);

  return { recentSearches, recordSearch, removeSearch, clear };
}
