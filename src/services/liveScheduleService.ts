import { Journey, RouteDefinition } from '../types';
import { buildFares } from './journeyGenerator';

/**
 * Real, periodically-refreshed departure times sourced from Eurostar's
 * official open GTFS feed, with a graceful offline/no-coverage fallback —
 * same pattern as currencyService.ts's live FX rates.
 *
 * How the data gets here: a GitHub Actions workflow
 * (.github/workflows/refresh-schedules.yml) runs scripts/fetch-live-schedules.mjs
 * on a schedule, which downloads + parses Eurostar's GTFS static/real-time
 * feeds and publishes a compact JSON file to this repo's `data` branch.
 * This service just fetches that JSON straight from
 * raw.githubusercontent.com — no server of our own to run or pay for.
 *
 * IMPORTANT — one-time setup: LIVE_SCHEDULE_REPO below is a placeholder.
 * After you push this project to your own GitHub repo, replace it with
 * "your-github-username/your-repo-name" (one line) so this points at
 * your repo's `data` branch instead of a repo that doesn't exist. Until
 * then — and any time the live fetch fails or has no data for the
 * requested route/date — getLiveJourneys() returns null and
 * ResultsScreen falls back to the fully-synthetic generator, exactly the
 * same as it does today. See README -> APIs & Data Strategy.
 *
 * What's genuinely live here: departure/arrival times and delay minutes.
 * What's still modelled: prices and seat availability — Eurostar's GTFS
 * feed doesn't publish those, and Rail Europe's actual booking/pricing
 * API is a partner-only B2B integration out of reach for this case (see
 * routes.ts). Live-sourced times are priced through the same
 * deterministic engine as synthetic ones (buildFares), so the two look
 * and behave consistently in the UI.
 */

const LIVE_SCHEDULE_REPO = 'nihatcuhaci/ticket';
const LIVE_SCHEDULE_URL = `https://raw.githubusercontent.com/${LIVE_SCHEDULE_REPO}/data/live-schedules.json`;
const FETCH_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 5 * 60 * 1000; // matches the workflow's 15-min refresh cadence closely enough

if (__DEV__ && LIVE_SCHEDULE_REPO.startsWith('YOUR_GITHUB_USERNAME')) {
  // eslint-disable-next-line no-console
  console.warn(
    '[liveScheduleService] LIVE_SCHEDULE_REPO is still a placeholder — live schedules will ' +
      'never be found and every search will silently use the synthetic generator. Set it to ' +
      '"your-github-username/your-repo-name" once this project is pushed to GitHub.'
  );
}

interface LiveScheduleEntry {
  date: string; // ISO yyyy-mm-dd
  departureTime: string; // HH:MM
  arrivalTime: string; // HH:MM
  delayMinutes: number;
  tripId: string;
}

interface LiveSchedulePayload {
  generatedAt: string;
  source: string;
  coverageDays: number;
  routes: Record<string, LiveScheduleEntry[]>;
}

let cache: { payload: LiveSchedulePayload; fetchedAt: number } | null = null;
let inFlight: Promise<LiveSchedulePayload | null> | null = null;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isPayloadShapeValid(json: any): json is LiveSchedulePayload {
  return !!json && typeof json === 'object' && json.routes && typeof json.routes === 'object';
}

async function fetchPayload(): Promise<LiveSchedulePayload | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.payload;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetchWithTimeout(LIVE_SCHEDULE_URL, FETCH_TIMEOUT_MS);
      if (!res.ok) throw new Error(`Live schedule fetch responded ${res.status}`);
      const json = await res.json();
      if (!isPayloadShapeValid(json)) throw new Error('Live schedule payload has unexpected shape');
      cache = { payload: json, fetchedAt: Date.now() };
      return json;
    } catch (err) {
      // Unreachable host, timeout, placeholder repo (404), stale/offline
      // device, malformed JSON — any of these just means "no live data
      // right now". Not logged as an error: this is an expected, handled
      // path (see file header), same as currencyService's FX fallback.
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function diffMinutesWrapping(departureTime: string, arrivalTime: string): number {
  const [dh, dm] = departureTime.split(':').map(Number);
  const [ah, am] = arrivalTime.split(':').map(Number);
  const depTotal = dh * 60 + dm;
  let arrTotal = ah * 60 + am;
  if (arrTotal < depTotal) arrTotal += 24 * 60; // arrival rolled past midnight
  return arrTotal - depTotal;
}

/**
 * Returns real GTFS-sourced journeys for this route+date, or null if
 * there's no live coverage (unreachable, no data yet, or this
 * origin/destination/date simply isn't in the feed — e.g. connections
 * that require changing trains aren't modelled, see gtfs-lib.mjs). Callers
 * should fall back to generateJourneys() from journeyGenerator.ts on null.
 */
export async function getLiveJourneys(
  route: RouteDefinition,
  dateISO: string
): Promise<Journey[] | null> {
  const payload = await fetchPayload();
  if (!payload) return null;

  const key = `${route.originId}-${route.destinationId}`;
  const entries = (payload.routes[key] ?? []).filter((e) => e.date === dateISO);
  if (entries.length === 0) return null;

  return entries
    .slice()
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
    .map((entry, idx) => ({
      id: `live-${route.originId}-${route.destinationId}-${dateISO}-${idx}`,
      originId: route.originId,
      destinationId: route.destinationId,
      date: dateISO,
      departureTime: entry.departureTime,
      arrivalTime: entry.arrivalTime,
      durationMinutes: diffMinutesWrapping(entry.departureTime, entry.arrivalTime),
      direct: true, // every leg here comes from one physical through-train, see gtfs-lib.mjs
      fares: buildFares(route, dateISO, entry.departureTime),
      live: true,
      delayMinutes: entry.delayMinutes,
    }));
}

/** Freshness info for a "Canlı sefer verisi" badge, mirroring CurrencyToggle's pattern. */
export async function getLiveScheduleFreshness(): Promise<{ generatedAt: string } | null> {
  const payload = await fetchPayload();
  return payload ? { generatedAt: payload.generatedAt } : null;
}
