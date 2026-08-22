import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecentSearch, SearchCriteria } from '../types';

/**
 * Locally-persisted "recent searches" for Home's one-tap search-again list.
 *
 * This is the app's only persisted state (everything else — search
 * criteria, fare selection — lives in memory only, see AppState and
 * README -> "Known limitations"). Kept intentionally separate from
 * AppState rather than folded into it: recent searches need to survive
 * an app restart, while the rest of the session state deliberately
 * doesn't, and mixing the two would make that distinction easy to lose
 * track of later.
 */

const STORAGE_KEY = '@eurotrain/recent_searches';
const MAX_ENTRIES = 5;

function idFor(originId: string, destinationId: string, tripType: string): string {
  return `${originId}-${destinationId}-${tripType}`;
}

export async function loadRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Recent searches are a convenience on top of the real app, not core
    // state — corrupt JSON or an unavailable store should never crash
    // Home, just behave as if there were no history yet.
    return [];
  }
}

async function persist(entries: RecentSearch[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Best-effort; a failed write just means this search won't be
    // remembered next launch, which is a silent no-op, not an error.
  }
}

/**
 * Records a search, moving it to the front. Deduped by route + trip type
 * (not by date/passengers) — searching London→Paris one-way twice with
 * different passenger counts updates the one existing entry rather than
 * creating a second "London → Paris" row.
 */
export async function addRecentSearch(criteria: SearchCriteria): Promise<RecentSearch[]> {
  const existing = await loadRecentSearches();
  const id = idFor(criteria.originId, criteria.destinationId, criteria.tripType);
  const entry: RecentSearch = {
    id,
    originId: criteria.originId,
    destinationId: criteria.destinationId,
    tripType: criteria.tripType,
    passengers: criteria.passengers,
    wheelchairUser: criteria.wheelchairUser,
    savedAt: Date.now(),
  };
  const next = [entry, ...existing.filter((e) => e.id !== id)].slice(0, MAX_ENTRIES);
  await persist(next);
  return next;
}

export async function removeRecentSearch(id: string): Promise<RecentSearch[]> {
  const next = (await loadRecentSearches()).filter((e) => e.id !== id);
  await persist(next);
  return next;
}

export async function clearRecentSearches(): Promise<void> {
  await persist([]);
}
