import { PassengerCounts } from '../types';
import { stationById } from '../data/stations';

/**
 * Metasearch / "click-out" checkout.
 *
 * EuroTrain's own Search → Results run entirely against local seed data
 * (see README -> "APIs & Data"). Rather than faking a payment for a
 * ticket the app cannot actually issue, checkout hands the traveler off
 * to eurotrain.net's real search-results page for the same route, date
 * and passenger mix — the same pattern Skyscanner or Google Flights use:
 * compare in-app, buy on the real provider's site. This is what lets the
 * MVP show genuinely real, live prices and let a real purchase happen,
 * without building or mocking a payment system.
 *
 * URL shape and city/station slugs were captured by hand by walking
 * eurotrain.net's own search form and reading the resulting URL — there
 * is no public station-lookup API to pull this from live. See
 * `Station.bookingSlug` in src/data/stations.ts.
 *
 * Traded off: eurotrain.net's passenger picker only has four age bands
 * (adult/youth/senior/child) — there's no separate "infant" category the
 * way the in-app picker has, so `passengers.infant` isn't representable
 * on the target URL and is intentionally dropped here rather than folded
 * into another band.
 */
export function buildBookingSearchUrl(
  originId: string,
  destinationId: string,
  date: string,
  passengers: PassengerCounts,
  returnDate?: string | null
): string | null {
  const origin = stationById(originId);
  const destination = stationById(destinationId);
  if (!origin?.bookingSlug || !destination?.bookingSlug) return null;

  const params = new URLSearchParams({
    origin: `${origin.countryCode}:${origin.bookingSlug}`,
    destination: `${destination.countryCode}:${destination.bookingSlug}`,
    date: `${date}T06:00:00`,
    adults: String(passengers.adult > 0 ? passengers.adult : 1),
    youths: String(passengers.youth || 0),
    seniors: String(passengers.senior || 0),
    children: String(passengers.child || 0),
  });
  // Round trip: eurotrain.net's own round-trip search adds a plain-date
  // `returnDate` (no time component, unlike `date`) alongside `tripType`
  // — verified by walking a real round-trip search on the live site.
  if (returnDate) {
    params.set('returnDate', returnDate);
    params.set('tripType', 'roundtrip');
  } else {
    params.set('tripType', 'oneway');
  }

  return `https://eurotrain.net/tr/search?${params.toString()}`;
}
