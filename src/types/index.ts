export type FareClassId = 'standard' | 'plus' | 'premier';

export interface Station {
  id: string;
  code: string;
  city: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
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
  date: string; // ISO yyyy-mm-dd
  passengers: PassengerCounts;
  wheelchairUser: boolean;
}

export interface SelectedFare {
  journey: Journey;
  fareClassId: FareClassId;
  price: number;
}

export type TravelReason = 'business' | 'holiday' | 'family_friends';

export type PaymentMethodId = 'card' | 'apple_pay' | 'paypal';

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingConfirmation {
  pnr: string;
  createdAt: string;
  selection: SelectedFare;
  passenger: PassengerDetails;
  totalPaid: number;
  currency: string;
}
