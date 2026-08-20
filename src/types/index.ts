export type FareClassId = 'standard' | 'plus' | 'premier';

export type TripType = 'oneway' | 'roundtrip';

export interface Station {
  id: string;
  code: string;
  city: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  /**
   * Eurostar.com's own numeric station id, used only to build the
   * outbound deep-link URL on checkout (see services/eurostarLink.ts).
   * Captured by hand from eurostar.com search results — there is no
   * public station-lookup API to pull this from live.
   */
  eurostarId: string;
}

export interface FareClassInfo {
  id: FareClassId;
  label: string;
  shortLabel: string;
  description: string;
  perks: string[];
}

export interface RouteDefinition {
  originId: string;
  destinationId: string;
  durationMinutes: number;
  direct: boolean;
  baseFare: number; // lowest observed Standard fare (EUR)
  peakFare: number; // highest typical Standard fare (EUR)
  departureSlots: string[]; // "HH:MM" local, used to generate journeys
}

export interface FarePrice {
  classId: FareClassId;
  price: number | null; // null = not available for this journey
  seatsLeft: number | null; // null = unknown/not shown, e.g. sold out
  lowestOfDay?: boolean;
}

export interface Journey {
  id: string;
  originId: string;
  destinationId: string;
  date: string; // ISO yyyy-mm-dd
  departureTime: string; // HH:MM
  arrivalTime: string; // HH:MM
  durationMinutes: number;
  direct: boolean;
  fares: FarePrice[];
  /**
   * Set when this journey's date/time came from Eurostar's real open
   * GTFS feed (see liveScheduleService.ts) rather than the synthetic
   * generator. Fares are still modelled either way — see buildFares.
   */
  live?: boolean;
  /** Minutes of delay reported by GTFS-RT at fetch time, live journeys only. */
  delayMinutes?: number;
}

export interface DayPrice {
  date: string; // ISO yyyy-mm-dd
  lowestFare: number | null;
  soldOut?: boolean;
}

export type PassengerCategory = 'adult' | 'youth' | 'child' | 'senior' | 'infant';

export interface PassengerCounts {
  adult: number;
  youth: number;
  child: number;
  senior: number;
  infant: number;
}

export interface SearchCriteria {
  originId: string;
  destinationId: string;
  date: string; // ISO yyyy-mm-dd — outbound date
  tripType: TripType;
  returnDate: string | null; // ISO yyyy-mm-dd — only meaningful when tripType is 'roundtrip'
  passengers: PassengerCounts;
  wheelchairUser: boolean;
}

export interface SelectedFare {
  journey: Journey;
  fareClassId: FareClassId;
  price: number;
}

export type TravelReason = 'business' | 'holiday' | 'family_friends';
