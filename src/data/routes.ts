import { RouteDefinition } from '../types';

/**
 * Route network seed data.
 *
 * Durations and fare ranges are realistic figures gathered by manually
 * browsing eurostar.com's live search results in Aug 2026 (see
 * eurostar-analiz.md). They are NOT fetched live — Rail Europe's actual
 * booking/pricing API is a partner-only B2B integration Odamigo already
 * holds, which is out of reach for this take-home case. Treat these as
 * "realistic seed data", not authoritative fares.
 *
 * Stored one-directional; `findRoute` below checks both directions since
 * duration/fares are treated as symmetric for this MVP.
 */
export const ROUTES: RouteDefinition[] = [
  {
    originId: 'lon',
    destinationId: 'par',
    durationMinutes: 164,
    direct: true,
    baseFare: 44,
    peakFare: 262,
    departureSlots: ['06:24', '07:55', '09:31', '11:04', '13:31', '16:31', '18:13', '20:04'],
  },
  {
    originId: 'lon',
    destinationId: 'bru',
    durationMinutes: 121,
    direct: true,
    baseFare: 39,
    peakFare: 220,
    departureSlots: ['07:01', '09:04', '12:04', '15:04', '17:56', '19:34'],
  },
  {
    originId: 'lon',
    destinationId: 'ams',
    durationMinutes: 237,
    direct: true,
    baseFare: 45,
    peakFare: 250,
    departureSlots: ['07:31', '10:31', '13:02', '16:04'],
  },
  {
    originId: 'lon',
    destinationId: 'rtd',
    durationMinutes: 220,
    direct: true,
    baseFare: 40,
    peakFare: 230,
    departureSlots: ['08:04', '11:31', '15:31', '18:31'],
  },
  {
    originId: 'lon',
    destinationId: 'lil',
    durationMinutes: 82,
    direct: true,
    baseFare: 39,
    peakFare: 180,
    departureSlots: ['06:24', '09:31', '13:31', '18:13'],
  },
  {
    originId: 'lon',
    destinationId: 'dlp',
    durationMinutes: 150,
    direct: true,
    baseFare: 60,
    peakFare: 210,
    departureSlots: ['09:03', '14:02'],
  },
  {
    originId: 'par',
    destinationId: 'ams',
    durationMinutes: 199,
    direct: true,
    baseFare: 35,
    peakFare: 190,
    departureSlots: ['07:17', '10:23', '13:17', '16:23', '19:17'],
  },
  {
    originId: 'par',
    destinationId: 'bru',
    durationMinutes: 82,
    direct: true,
    baseFare: 29,
    peakFare: 140,
    departureSlots: ['06:56', '08:25', '10:56', '13:25', '16:56', '19:25'],
  },
  {
    originId: 'par',
    destinationId: 'cgn',
    durationMinutes: 198,
    direct: true,
    baseFare: 35,
    peakFare: 170,
    departureSlots: ['07:25', '11:25', '15:25'],
  },
  {
    originId: 'par',
    destinationId: 'rtd',
    durationMinutes: 172,
    direct: true,
    baseFare: 39,
    peakFare: 180,
    departureSlots: ['08:17', '13:17', '17:17'],
  },
  {
    originId: 'bru',
    destinationId: 'ams',
    durationMinutes: 113,
    direct: true,
    baseFare: 25,
    peakFare: 120,
    departureSlots: ['06:35', '08:35', '10:35', '13:35', '16:35', '19:35'],
  },
  {
    originId: 'bru',
    destinationId: 'cgn',
    durationMinutes: 105,
    direct: true,
    baseFare: 29,
    peakFare: 130,
    departureSlots: ['07:04', '11:04', '15:04', '18:04'],
  },
  {
    originId: 'bru',
    destinationId: 'brg',
    durationMinutes: 65,
    direct: true,
    baseFare: 19,
    peakFare: 75,
    departureSlots: ['08:12', '11:12', '14:12', '17:12'],
  },
  {
    originId: 'lon',
    destinationId: 'brg',
    durationMinutes: 195,
    direct: false,
    baseFare: 49,
    peakFare: 210,
    departureSlots: ['07:01', '12:04'],
  },
];

export const findRoute = (originId: string, destinationId: string): RouteDefinition | undefined => {
  const stored = ROUTES.find(
    (r) =>
      (r.originId === originId && r.destinationId === destinationId) ||
      (r.originId === destinationId && r.destinationId === originId)
  );
  if (!stored) return undefined;
  if (stored.originId === originId && stored.destinationId === destinationId) return stored;
  // Routes are stored once per pair; durations/fares are symmetric (see
  // file header), so orient a copy to match the direction actually
  // requested (this matters for the return leg of a round trip, and for
  // building a correctly-directed Journey/deep-link either way).
  return { ...stored, originId, destinationId };
};

/** All destination ids reachable from a given origin (either direction). */
export const reachableDestinations = (originId: string): string[] => {
  const set = new Set<string>();
  ROUTES.forEach((r) => {
    if (r.originId === originId) set.add(r.destinationId);
    if (r.destinationId === originId) set.add(r.originId);
  });
  return Array.from(set);
};
