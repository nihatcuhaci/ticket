/**
 * Pure parsing/matching helpers for the live-schedule pipeline, split out
 * of fetch-live-schedules.mjs so they can be unit-tested against a small
 * synthetic GTFS fixture without needing network access (see
 * scripts/fetch-live-schedules.test.mjs). No I/O in this file.
 */

// ---- CSV -------------------------------------------------------------

/** Parses one RFC4180-ish CSV line into an array of field strings. */
export function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/** Parses a full GTFS text file (with header row) into an array of row objects. */
export function parseCsv(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (fields[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

// ---- Station matching --------------------------------------------------

/**
 * Keyword fragments (normalized: lowercase, accents stripped) used to
 * match a GTFS stop_name to one of EuroTrain's 9 seed stations. Matching
 * on the name rather than a GTFS stop_id because stop_ids are internal
 * to Eurostar's feed and not documented anywhere we could hard-code them
 * from — this heuristic is the same kind of manual, best-effort mapping
 * used for the eurostarId deep-link ids (see stations.ts), just applied
 * automatically instead of by hand.
 */
export const STATION_KEYWORDS = {
  lon: ['st pancras'],
  par: ['gare du nord', 'paris nord'],
  dlp: ['marne-la-vallee', 'marne la vallee', 'disneyland'],
  bru: ['bruxelles-midi', 'bruxelles midi', 'brussel-zuid', 'brussels-midi', 'brussel zuid'],
  ams: ['amsterdam centraal'],
  rtd: ['rotterdam centraal'],
  lil: ['lille europe'],
  cgn: ['koln hbf', 'koln hauptbahnhof', 'cologne'],
  brg: ['brugge', 'bruges'],
};

/** Lowercases and strips diacritics so "Köln" and "koln" compare equal. */
export function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Builds a Map<gtfsStopId, ourStationId> by matching every stop's name
 * against STATION_KEYWORDS. A GTFS feed often has several stop_ids per
 * physical station (platforms, entrances); all of them map to the same
 * station id here, which is what we want — any of them counts as "the
 * train called at this station".
 */
export function matchStops(stopsRows) {
  const stopIdToStation = new Map();
  for (const row of stopsRows) {
    const normalized = normalizeName(row.stop_name || '');
    for (const [stationId, keywords] of Object.entries(STATION_KEYWORDS)) {
      if (keywords.some((kw) => normalized.includes(kw))) {
        stopIdToStation.set(row.stop_id, stationId);
        break;
      }
    }
  }
  return stopIdToStation;
}

// ---- Service calendar resolution ---------------------------------------

const DOW_FIELDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Builds a Map<serviceId, Set<'YYYY-MM-DD'>> of every date each service actually runs. */
export function buildServiceDates(calendarRows, calendarDatesRows, coverageDates) {
  const coverageSet = new Set(coverageDates);
  const serviceDates = new Map();

  for (const row of calendarRows) {
    const dates = new Set();
    const start = gtfsDateToISO(row.start_date);
    const end = gtfsDateToISO(row.end_date);
    for (const dateISO of coverageDates) {
      if (dateISO < start || dateISO > end) continue;
      const dow = DOW_FIELDS[new Date(dateISO + 'T00:00:00Z').getUTCDay()];
      if (row[dow] === '1') dates.add(dateISO);
    }
    serviceDates.set(row.service_id, dates);
  }

  for (const row of calendarDatesRows) {
    const dateISO = gtfsDateToISO(row.date);
    if (!coverageSet.has(dateISO)) continue;
    if (!serviceDates.has(row.service_id)) serviceDates.set(row.service_id, new Set());
    const set = serviceDates.get(row.service_id);
    if (row.exception_type === '1') set.add(dateISO);
    else if (row.exception_type === '2') set.delete(dateISO);
  }

  return serviceDates;
}

/** GTFS dates are "YYYYMMDD" -> "YYYY-MM-DD". */
export function gtfsDateToISO(gtfsDate) {
  return `${gtfsDate.slice(0, 4)}-${gtfsDate.slice(4, 6)}-${gtfsDate.slice(6, 8)}`;
}

/** Builds the list of ISO dates from `startISO` for `days` days (inclusive of startISO). */
export function dateRange(startISO, days) {
  const out = [];
  const d = new Date(startISO + 'T00:00:00Z');
  for (let i = 0; i < days; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

// ---- GTFS time handling -------------------------------------------------

/**
 * GTFS times can exceed 24:00:00 for trips that run past midnight
 * relative to their service-day start. Normalizes to a plain "HH:MM"
 * wall-clock string (wrapping past midnight) for display purposes.
 */
export function normalizeGtfsTime(hhmmss) {
  const [h, m] = hhmmss.split(':').map(Number);
  const wrapped = ((h % 24) + 24) % 24;
  return `${String(wrapped).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---- Trip -> legs --------------------------------------------------------

/**
 * From one trip's ordered, already-time-sorted stop_times rows (only the
 * ones that matched one of our 9 stations), yields one leg per ordered
 * pair of stops the train calls at — e.g. a Paris->Brussels->Amsterdam
 * service yields par-bru, bru-ams and par-ams legs, each a real
 * board-here/alight-there option on that physical train.
 */
export function legsForTrip(orderedStationStops) {
  const legs = [];
  for (let i = 0; i < orderedStationStops.length; i++) {
    for (let j = i + 1; j < orderedStationStops.length; j++) {
      const from = orderedStationStops[i];
      const to = orderedStationStops[j];
      if (from.stationId === to.stationId) continue;
      legs.push({
        originId: from.stationId,
        destinationId: to.stationId,
        departureTime: normalizeGtfsTime(from.departure_time || from.arrival_time),
        arrivalTime: normalizeGtfsTime(to.arrival_time || to.departure_time),
      });
    }
  }
  return legs;
}
