import { PassengerCounts } from '../types';
import { stationById } from '../data/stations';

/**
 * Metasearch / "click-out" checkout.
 *
 * EuroTrain's own Search → Results run entirely against local seed data
 * (see README -> "APIs & Data"). Rather than faking a payment for a
 * ticket the app cannot actually issue, checkout hands the traveler off
 * to eurostar.com's real search-results page for the same route, date
 * and passenger mix — the same pattern Skyscanner or Google Flights use:
 * compare in-app, buy on the real provider's site. This is what lets the
 * MVP show genuinely real, live prices and let a real purchase happen,
 * without building or mocking a payment system.
 *
 * Station IDs are eurostar.com's own internal numeric station codes,
 * captured by hand from real search results (Eurostar has no public
 * station-lookup API) — see `Station.eurostarId` in src/data/stations.ts.
 */
export function buildEurostarSearchUrl(
  originId: string,
  destinationId: string,
  date: string,
  passengers: PassengerCounts,
  returnDate?: string | null
): string | null {
  const origin = stationById(originId);
  const destination = stationById(destinationId);
  if (!origin?.eurostarId || !destination?.eurostarId) return null;

  const countParam = (n: number) => (n > 0 ? String(n) : '');

  const params = new URLSearchParams({
    origin: origin.eurostarId,
    destination: destination.eurostarId,
    adult: countParam(passengers.adult) || '1',
    youth: countParam(passengers.youth),
    child: countParam(passengers.child),
    senior: countParam(passengers.senior),
    infant: countParam(passengers.infant),
    outbound: date,
  });
  // Round trip: eurostar.com's own round-trip search results page adds a
  // single `inbound` date alongside `outbound` on the same URL — verified
  // by walking a real round-trip search on the live site — rather than
  // needing two separate searches/links.
  if (returnDate) params.set('inbound', returnDate);
  params.set('country', 'tr');

  return `https://www.eurostar.com/search/rw-en?${params.toString()}`;
}
