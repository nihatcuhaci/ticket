import { DayPrice, FarePrice, Journey, RouteDefinition } from '../types';

/**
 * Deterministic "pricing engine" for the MVP.
 *
 * There is no live Rail Europe inventory/pricing feed available for this
 * case (see routes.ts). Instead of Math.random() (which would make the
 * same search return different results on every render — confusing for
 * a demo and untestable), fares are derived from a seeded hash of the
 * route + date + time slot. Same input -> same output, every time,
 * while still looking like realistic day-to-day price variation.
 */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Returns a stable pseudo-random float in [0, 1) for a given seed string. */
function seededFloat(seed: string): number {
  const h = hashString(seed);
  return (h % 100000) / 100000;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function daysUntil(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateISO + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/**
 * Demand multiplier in [0, 1]: higher = closer to peakFare.
 * Combines day-of-week (weekend travel is pricier), how far out the
 * booking is (last-minute is pricier, matching the real Eurostar Snap /
 * "book early for less" pattern), and a per-slot seeded wobble.
 */
function demandFactor(route: RouteDefinition, dateISO: string, slot: string): number {
  const date = new Date(dateISO + 'T00:00:00');
  const dow = date.getDay(); // 0 Sun .. 6 Sat
  const weekendBoost = dow === 0 || dow === 5 || dow === 6 ? 0.18 : 0;

  const out = daysUntil(dateISO);
  let leadTimeBoost = 0;
  if (out <= 1) leadTimeBoost = 0.35;
  else if (out <= 3) leadTimeBoost = 0.2;
  else if (out <= 7) leadTimeBoost = 0.08;
  else if (out >= 45) leadTimeBoost = -0.1;

  const wobble = seededFloat(`${route.originId}-${route.destinationId}-${dateISO}-${slot}`) * 0.5;

  const raw = 0.15 + weekendBoost + leadTimeBoost + wobble;
  return Math.max(0, Math.min(1, raw));
}

function priceForSlot(route: RouteDefinition, dateISO: string, slot: string): number {
  const factor = demandFactor(route, dateISO, slot);
  const price = route.baseFare + (route.peakFare - route.baseFare) * factor;
  return Math.round(price / 1) ; // whole euros, matches Eurostar's display
}

const PLUS_MULTIPLIER = 1.28;
const PREMIER_MULTIPLIER = 1.58;

function buildFares(route: RouteDefinition, dateISO: string, slot: string): FarePrice[] {
  const standardPrice = priceForSlot(route, dateISO, slot);
  const plusPrice = Math.round((standardPrice * PLUS_MULTIPLIER) / 1);
  const premierPrice = Math.round((standardPrice * PREMIER_MULTIPLIER) / 1);

  // Occasionally sell out the cheaper classes on high-demand slots, same
  // "Not available" pattern observed on eurostar.com search results.
  const demand = demandFactor(route, dateISO, slot);
  const standardSoldOut = demand > 0.82 && seededFloat(`std-${route.originId}${route.destinationId}${dateISO}${slot}`) > 0.5;
  const plusSoldOut = demand > 0.9 && seededFloat(`plus-${route.originId}${route.destinationId}${dateISO}${slot}`) > 0.6;

  const seatsSeed = (suffix: string) =>
    Math.round(seededFloat(`seats-${suffix}-${route.originId}${route.destinationId}${dateISO}${slot}`) * 40) + 2;

  return [
    {
      classId: 'standard',
      price: standardSoldOut ? null : standardPrice,
      seatsLeft: standardSoldOut ? null : seatsSeed('std'),
    },
    {
      classId: 'plus',
      price: plusSoldOut ? null : plusPrice,
      seatsLeft: plusSoldOut ? null : seatsSeed('plus'),
    },
    {
      classId: 'premier',
      price: premierPrice,
      seatsLeft: seatsSeed('premier'),
    },
  ];
}

export function generateJourneys(route: RouteDefinition, dateISO: string): Journey[] {
  return route.departureSlots.map((slot, idx) => {
    const fares = buildFares(route, dateISO, slot);
    return {
      id: `${route.originId}-${route.destinationId}-${dateISO}-${idx}`,
      originId: route.originId,
      destinationId: route.destinationId,
      date: dateISO,
      departureTime: slot,
      arrivalTime: addMinutes(slot, route.durationMinutes),
      durationMinutes: route.durationMinutes,
      direct: route.direct,
      fares,
    };
  });
}

/** Cheapest available Standard-or-above fare for a given day (for the date strip). */
export function generateDayPrice(route: RouteDefinition, dateISO: string): DayPrice {
  const journeys = generateJourneys(route, dateISO);
  const available = journeys
    .flatMap((j) => j.fares)
    .filter((f) => f.price !== null)
    .map((f) => f.price as number);

  if (available.length === 0) {
    return { date: dateISO, lowestFare: null, soldOut: true };
  }
  return { date: dateISO, lowestFare: Math.min(...available) };
}

export function isoDateAddDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
