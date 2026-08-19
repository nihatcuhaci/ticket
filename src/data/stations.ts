import { Station } from '../types';

/**
 * Curated, real-world station list.
 *
 * Names, cities, countries and approximate coordinates are real public
 * information (the stations Eurostar/Rail Europe's network actually
 * serves). This is NOT pulled live from any API — it is a static seed
 * compiled by hand from public sources, which keeps the MVP fast and
 * fully offline-capable while still being geographically honest.
 *
 * See README.md -> "APIs & Data" for the reasoning behind this choice.
 */
export const STATIONS: Station[] = [
  {
    id: 'lon',
    code: 'QQS',
    city: 'London',
    name: "London St Pancras Int'l",
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5308,
    lng: -0.1257,
  },
  {
    id: 'par',
    code: 'XPG',
    city: 'Paris',
    name: 'Paris Gare du Nord',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8809,
    lng: 2.3553,
  },
  {
    id: 'dlp',
    code: 'XED',
    city: 'Paris',
    name: 'Disneyland Paris (Marne-la-Vallée)',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8722,
    lng: 2.7828,
  },
  {
    id: 'bru',
    code: 'XBZ',
    city: 'Brussels',
    name: 'Brussels-Midi/Zuid',
    country: 'Belgium',
    countryCode: 'BE',
    lat: 50.8357,
    lng: 4.3358,
  },
  {
    id: 'ams',
    code: 'ZYA',
    city: 'Amsterdam',
    name: 'Amsterdam Centraal',
    country: 'Netherlands',
    countryCode: 'NL',
    lat: 52.3791,
    lng: 4.9003,
  },
  {
    id: 'rtd',
    code: 'ZRD',
    city: 'Rotterdam',
    name: 'Rotterdam Centraal',
    country: 'Netherlands',
    countryCode: 'NL',
    lat: 51.9244,
    lng: 4.4691,
  },
  {
    id: 'lil',
    code: 'XDB',
    city: 'Lille',
    name: 'Lille Europe',
    country: 'France',
    countryCode: 'FR',
    lat: 50.6395,
    lng: 3.0752,
  },
  {
    id: 'cgn',
    code: 'XFB',
    city: 'Cologne',
    name: 'Köln Hauptbahnhof',
    country: 'Germany',
    countryCode: 'DE',
    lat: 50.9432,
    lng: 6.9583,
  },
  {
    id: 'brg',
    code: 'XBG',
    city: 'Bruges',
    name: 'Brugge',
    country: 'Belgium',
    countryCode: 'BE',
    lat: 51.1969,
    lng: 3.2167,
  },
];

export const stationById = (id: string): Station | undefined =>
  STATIONS.find((s) => s.id === id);

export const searchStations = (query: string, excludeId?: string): Station[] => {
  const q = query.trim().toLowerCase();
  return STATIONS.filter((s) => {
    if (excludeId && s.id === excludeId) return false;
    if (!q) return true;
    return (
      s.city.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
  });
};
