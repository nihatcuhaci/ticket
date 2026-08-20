#!/usr/bin/env node
/**
 * Fetches Eurostar's official open GTFS static + GTFS-RT feeds and
 * compiles a compact live-schedules.json covering the app's 9 seed
 * stations, for the next COVERAGE_DAYS days.
 *
 * Source: France's national open-data portal, published by Eurostar
 * International Ltd. under Licence Ouverte 2.0 (no registration, no API
 * key, ToS-compliant open data — not a scrape):
 *   https://transport.data.gouv.fr/datasets/eurostar-gtfs-plan-de-transport-et-temps-reel
 *
 * This script deliberately does NOT know anything about React
 * Native/Expo — it's a plain Node.js script, run by the GitHub Actions
 * workflow in .github/workflows/refresh-schedules.yml, completely
 * outside the app bundle. See README -> APIs & Data Strategy.
 *
 * IMPORTANT: this covers real schedules/delays only, not pricing or
 * seat availability — Eurostar's GTFS feed doesn't publish those, and
 * Rail Europe's actual booking/pricing API is a partner-only B2B
 * integration out of reach for this case (see journeyGenerator.ts).
 * Prices for live-sourced departure times are still produced by the
 * same deterministic pricing engine used for synthetic journeys.
 */

import { unzipSync } from 'fflate';
import protobuf from 'gtfs-realtime-bindings';
import { writeFileSync } from 'node:fs';
import {
  parseCsv,
  matchStops,
  buildServiceDates,
  dateRange,
  legsForTrip,
} from './gtfs-lib.mjs';

const STATIC_URL =
  'https://integration-storage.dm.eurostar.com/gtfs-prod/gtfs_static_commercial_v2.zip';
const RT_URL = 'https://integration-storage.dm.eurostar.com/gtfs-prod/gtfs_rt_v2.bin';
const OUT_PATH = new URL('../live-schedules.json', import.meta.url);
const COVERAGE_DAYS = 30;
const FETCH_TIMEOUT_MS = 30000;

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchStaticTables() {
  const res = await fetchWithTimeout(STATIC_URL, FETCH_TIMEOUT_MS);
  const buf = new Uint8Array(await res.arrayBuffer());
  const files = unzipSync(buf, {
    filter: (f) =>
      ['stops.txt', 'trips.txt', 'stop_times.txt', 'calendar.txt', 'calendar_dates.txt'].includes(
        f.name
      ),
  });
  const decoder = new TextDecoder();
  const asText = (name) => (files[name] ? decoder.decode(files[name]) : '');
  return {
    stops: parseCsv(asText('stops.txt')),
    trips: parseCsv(asText('trips.txt')),
    stopTimes: parseCsv(asText('stop_times.txt')),
    calendar: parseCsv(asText('calendar.txt')),
    calendarDates: parseCsv(asText('calendar_dates.txt')),
  };
}

async function fetchRealtimeDelays() {
  try {
    const res = await fetchWithTimeout(RT_URL, FETCH_TIMEOUT_MS);
    const buf = new Uint8Array(await res.arrayBuffer());
    const feed = protobuf.transit_realtime.FeedMessage.decode(buf);
    // Map<tripId, delayMinutes> — first non-zero delay found for the trip,
    // whichever stop it's reported at. Best-effort: if GTFS-RT is
    // unavailable this just means every live journey shows 0 delay,
    // which is a safe/quiet degradation, not a failure.
    const delayByTrip = new Map();
    for (const entity of feed.entity) {
      const tu = entity.tripUpdate;
      if (!tu?.trip?.tripId) continue;
      const stu = tu.stopTimeUpdate?.find(
        (u) => u.arrival?.delay || u.departure?.delay
      );
      const delaySec = stu?.arrival?.delay ?? stu?.departure?.delay ?? 0;
      if (delaySec) delayByTrip.set(tu.trip.tripId, Math.round(delaySec / 60));
    }
    return delayByTrip;
  } catch (err) {
    console.warn(`GTFS-RT fetch/parse failed, continuing with delayMinutes=0: ${err.message}`);
    return new Map();
  }
}

export function buildLiveSchedule(
  { stops, trips, stopTimes, calendar, calendarDates },
  delayByTrip,
  todayISO = new Date().toISOString().slice(0, 10),
  coverageDays = COVERAGE_DAYS
) {
  const stopIdToStation = matchStops(stops);
  console.log(`Matched ${stopIdToStation.size} GTFS stop_ids to EuroTrain stations.`);

  const tripIdToServiceId = new Map(trips.map((t) => [t.trip_id, t.service_id]));

  // Group stop_times by trip, keep only rows at a matched station, sorted
  // by stop_sequence so legsForTrip sees them in real travel order.
  const stopTimesByTrip = new Map();
  for (const row of stopTimes) {
    const stationId = stopIdToStation.get(row.stop_id);
    if (!stationId) continue;
    if (!stopTimesByTrip.has(row.trip_id)) stopTimesByTrip.set(row.trip_id, []);
    stopTimesByTrip.get(row.trip_id).push({ ...row, stationId });
  }
  for (const rows of stopTimesByTrip.values()) {
    rows.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));
  }

  const coverageDates = dateRange(todayISO, coverageDays);
  const serviceDates = buildServiceDates(calendar, calendarDates, coverageDates);

  /** @type {Record<string, Array<{date:string, departureTime:string, arrivalTime:string, delayMinutes:number, tripId:string}>>} */
  const routes = {};

  for (const [tripId, orderedStops] of stopTimesByTrip.entries()) {
    if (orderedStops.length < 2) continue;
    const serviceId = tripIdToServiceId.get(tripId);
    const activeDates = serviceDates.get(serviceId);
    if (!activeDates || activeDates.size === 0) continue;

    const legs = legsForTrip(orderedStops);
    if (legs.length === 0) continue;
    const delayMinutes = delayByTrip.get(tripId) ?? 0;

    for (const dateISO of activeDates) {
      for (const leg of legs) {
        const key = `${leg.originId}-${leg.destinationId}`;
        if (!routes[key]) routes[key] = [];
        routes[key].push({
          date: dateISO,
          departureTime: leg.departureTime,
          arrivalTime: leg.arrivalTime,
          delayMinutes,
          tripId,
        });
      }
    }
  }

  for (const key of Object.keys(routes)) {
    routes[key].sort((a, b) => (a.date + a.departureTime).localeCompare(b.date + b.departureTime));
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'eurostar-open-gtfs',
    sourceUrl: 'https://transport.data.gouv.fr/datasets/eurostar-gtfs-plan-de-transport-et-temps-reel',
    coverageDays,
    routeCount: Object.keys(routes).length,
    routes,
  };
}

async function main() {
  console.log('Fetching Eurostar GTFS static feed…');
  const staticTables = await fetchStaticTables();
  console.log(
    `Parsed ${staticTables.stops.length} stops, ${staticTables.trips.length} trips, ` +
      `${staticTables.stopTimes.length} stop_times rows.`
  );

  console.log('Fetching Eurostar GTFS-RT feed…');
  const delayByTrip = await fetchRealtimeDelays();
  console.log(`Got real-time delay data for ${delayByTrip.size} trips.`);

  const output = buildLiveSchedule(staticTables, delayByTrip);
  console.log(`Built live schedule for ${output.routeCount} route directions.`);

  writeFileSync(OUT_PATH, JSON.stringify(output));
  console.log(`Wrote ${OUT_PATH.pathname}`);
}

// Only run when executed directly (`node scripts/fetch-live-schedules.mjs`),
// not when imported — the unit test file imports buildLiveSchedule above
// and must not trigger a real network fetch as a side effect of that.
const isMain = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href;
if (isMain) {
  main().catch((err) => {
    console.error('fetch-live-schedules failed:', err);
    process.exit(1);
  });
}
