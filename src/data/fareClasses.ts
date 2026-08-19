import { FareClassInfo } from '../types';

/**
 * Fare class definitions and their perks, closely modelled on the real
 * conditions publicly listed on eurostar.com at the time of research
 * (Aug 2026) — exchange/refund policy, luggage allowance, on-board
 * services. Wording rewritten in our own voice, not copied verbatim.
 */
export const FARE_CLASSES: FareClassInfo[] = [
  {
    id: 'standard',
    label: 'EuroTrain Standard',
    shortLabel: 'Standard',
    description: 'Great value for a comfortable, no-frills journey.',
    perks: [
      'Exchange free up to 1 hour before departure (fare difference may apply)',
      'Refundable up to 7 days before departure for a small fee',
      '2 pieces of luggage + 1 small bag',
      'Buy snacks and drinks on board',
      'Free on-board wi-fi',
    ],
  },
  {
    id: 'plus',
    label: 'EuroTrain Plus',
    shortLabel: 'Plus',
    description: 'Extra legroom, a bigger seat and a light meal included.',
    perks: [
      'Everything in Standard',
      'Wider, more spacious seating',
      'Light meal and drink served at your seat',
      'Priority boarding',
    ],
  },
  {
    id: 'premier',
    label: 'EuroTrain Premier',
    shortLabel: 'Premier',
    description: 'The most flexible, most comfortable way to travel.',
    perks: [
      'Everything in Plus',
      'Fully flexible: free exchanges and refunds',
      'Full at-seat meal service',
      'Access to partner lounges where available',
    ],
  },
];

export const fareClassById = (id: string): FareClassInfo | undefined =>
  FARE_CLASSES.find((f) => f.id === id);
