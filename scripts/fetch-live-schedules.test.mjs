/**
 * Unit tests for the GTFS parsing/matching pipeline, run against a small
 * hand-built synthetic GTFS fixture instead of the real Eurostar feed.
 *
 * Why a fixture instead of the real feed: this sandbox's outbound
 * network is allow-listed to package registries only, so
 * integration-storage.dm.eurostar.com is unreachable here (confirmed via
 * `curl -sI` -> HTTP 403). That's a sandbox limitation, not a real-world
 * problem — the real fetch runs fine in GitHub Actions (see
 * .github/workflows/refresh-schedules.yml) or on a normal dev machine.
 * This fixture exercises exactly the same parsing/matching/date-resolution
 * code paths the real feed would, just with representative made-up rows.
 *
 * Run with: node --test scripts/fetch-live-schedules.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, matchStops, buildServiceDates, dateRange, legsForTrip } from './gtfs-lib.mjs';
import { buildLiveSchedule } from './fetch-live-schedules.mjs';

// A Paris -> Brussels -> Amsterdam through-service, running weekdays only,
// plus a London -> Paris service running daily, plus one calendar_dates.txt
// exception (service added on a normally-inactive day, and one cancelled).
const FIXTURE = {
  stops: parseCsv(
    [
      'stop_id,stop_name',
      'STOP_PAR_1,Paris Gare du Nord',
      'STOP_PAR_2,Paris Nord Voie 3', // second stop_id for the same station
      'STOP_BRU_1,Bruxelles-Midi',
      'STOP_AMS_1,Amsterdam Centraal',
      'STOP_LON_1,London St Pancras International',
      'STOP_UNMATCHED,Some Random Depot', // should not match any station
    ].join('\n')
  ),
  trips: parseCsv(
    [
      'trip_id,service_id,route_id',
      'TRIP_PAR_BRU_AMS,SVC_WEEKDAY,ROUTE_1',
      'TRIP_LON_PAR,SVC_DAILY,ROUTE_2',
    ].join('\n')
  ),
  stopTimes: parseCsv(
    [
      'trip_id,stop_id,stop_sequence,arrival_time,departure_time',
      'TRIP_PAR_BRU_AMS,STOP_PAR_1,1,07:17:00,07:17:00',
      'TRIP_PAR_BRU_AMS,STOP_BRU_1,2,08:39:00,08:44:00',
      'TRIP_PAR_BRU_AMS,STOP_AMS_1,3,10:36:00,10:36:00',
      'TRIP_LON_PAR,STOP_LON_1,1,06:24:00,06:24:00',
      'TRIP_LON_PAR,STOP_UNMATCHED,2,07:00:00,07:05:00',
      'TRIP_LON_PAR,STOP_PAR_1,3,09:08:00,09:08:00',
    ].join('\n')
  ),
  calendar: parseCsv(
    [
      'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date',
      'SVC_WEEKDAY,1,1,1,1,1,0,0,20260101,20261231',
      'SVC_DAILY,1,1,1,1,1,1,1,20260101,20261231',
    ].join('\n')
  ),
  calendarDates: parseCsv(
    [
      'service_id,date,exception_type',
      // SVC_WEEKDAY explicitly added on a Sunday it wouldn't normally run
      'SVC_WEEKDAY,20260823,1',
    ].join('\n')
  ),
};

test('matchStops maps GTFS stop_ids to EuroTrain station ids by name, ignoring unmatched stops', () => {
  const map = matchStops(FIXTURE.stops);
  assert.equal(map.get('STOP_PAR_1'), 'par');
  assert.equal(map.get('STOP_PAR_2'), 'par'); // second platform, same station
  assert.equal(map.get('STOP_BRU_1'), 'bru');
  assert.equal(map.get('STOP_AMS_1'), 'ams');
  assert.equal(map.get('STOP_LON_1'), 'lon');
  assert.equal(map.has('STOP_UNMATCHED'), false);
});

test('matchStops handles the real feed\'s hyphenated stop_name style', () => {
  // Regression test: a live run against the real Eurostar GTFS feed
  // initially matched only 3/9 stations because the feed hyphenates
  // multi-word names ("Amsterdam-Centraal", "St-Pancras-International")
  // while STATION_KEYWORDS was written space-separated. Fixed in
  // normalizeName() by folding hyphens to spaces before matching; this
  // locks that fix in with the exact real names from that run's log.
  const realStops = parseCsv(
    [
      'stop_id,stop_name',
      'S1,St-Pancras-International',
      'S2,Paris-Nord',
      'S3,Amsterdam-Centraal',
      'S4,Rotterdam-Centraal',
      'S5,Lille-Europe',
      'S6,Marne-la-Vallée-Chessy',
      'S7,Bruxelles-Midi',
      'S8,Köln Hbf',
      'S9,Antwerpen-Centraal', // not one of our 9 stations — must not match anything
    ].join('\n')
  );
  const map = matchStops(realStops);
  assert.equal(map.get('S1'), 'lon');
  assert.equal(map.get('S2'), 'par');
  assert.equal(map.get('S3'), 'ams');
  assert.equal(map.get('S4'), 'rtd');
  assert.equal(map.get('S5'), 'lil');
  assert.equal(map.get('S6'), 'dlp');
  assert.equal(map.get('S7'), 'bru');
  assert.equal(map.get('S8'), 'cgn');
  assert.equal(map.has('S9'), false);
});

test('dateRange produces `days` consecutive ISO dates starting from startISO', () => {
  const dates = dateRange('2026-08-20', 5);
  assert.deepEqual(dates, [
    '2026-08-20',
    '2026-08-21',
    '2026-08-22',
    '2026-08-23',
    '2026-08-24',
  ]);
});

test('buildServiceDates resolves weekday calendar + calendar_dates exceptions correctly', () => {
  // 2026-08-17 is a Monday; the 7-day window covers Mon..Sun.
  const coverage = dateRange('2026-08-17', 7);
  const serviceDates = buildServiceDates(FIXTURE.calendar, FIXTURE.calendarDates, coverage);

  const weekday = serviceDates.get('SVC_WEEKDAY');
  // Mon-Fri (17th-21st) from calendar.txt, NOT Sat 22nd, but Sun 23rd
  // because of the calendar_dates.txt "added" exception.
  assert.deepEqual(
    [...weekday].sort(),
    ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-23'].sort()
  );

  const daily = serviceDates.get('SVC_DAILY');
  assert.equal(daily.size, 7);
});

test('legsForTrip generates every ordered board/alight pair for a through-service', () => {
  const orderedStops = [
    { stationId: 'par', arrival_time: '07:17:00', departure_time: '07:17:00' },
    { stationId: 'bru', arrival_time: '08:39:00', departure_time: '08:44:00' },
    { stationId: 'ams', arrival_time: '10:36:00', departure_time: '10:36:00' },
  ];
  const legs = legsForTrip(orderedStops);
  assert.equal(legs.length, 3); // par-bru, par-ams, bru-ams

  const parBru = legs.find((l) => l.originId === 'par' && l.destinationId === 'bru');
  assert.equal(parBru.departureTime, '07:17');
  assert.equal(parBru.arrivalTime, '08:39');

  const parAms = legs.find((l) => l.originId === 'par' && l.destinationId === 'ams');
  assert.equal(parAms.departureTime, '07:17');
  assert.equal(parAms.arrivalTime, '10:36');

  const bruAms = legs.find((l) => l.originId === 'bru' && l.destinationId === 'ams');
  assert.equal(bruAms.departureTime, '08:44');
  assert.equal(bruAms.arrivalTime, '10:36');
});

test('buildLiveSchedule end-to-end: fixture -> compact per-route-direction journey list', () => {
  // Anchor "today" to the Monday used above so the assertions are stable.
  const delayByTrip = new Map([['TRIP_PAR_BRU_AMS', 4]]);
  const output = buildLiveSchedule(FIXTURE, delayByTrip, '2026-08-17', 7);

  assert.equal(output.source, 'eurostar-open-gtfs');
  assert.equal(output.coverageDays, 7);

  // par-bru, par-ams, bru-ams from the through-service; lon-par from the
  // other trip. STOP_UNMATCHED never produces a route key.
  const keys = Object.keys(output.routes).sort();
  assert.deepEqual(keys, ['bru-ams', 'lon-par', 'par-ams', 'par-bru']);

  // SVC_WEEKDAY runs Mon-Fri + the one added Sunday -> 6 dates.
  assert.equal(output.routes['par-bru'].length, 6);
  assert.equal(output.routes['par-bru'][0].departureTime, '07:17');
  assert.equal(output.routes['par-bru'][0].arrivalTime, '08:39');
  assert.equal(output.routes['par-bru'][0].delayMinutes, 4);
  assert.equal(output.routes['par-bru'][0].tripId, 'TRIP_PAR_BRU_AMS');
  // Sorted chronologically: the added Sunday (23rd) sorts last.
  assert.equal(output.routes['par-bru'].at(-1).date, '2026-08-23');

  // SVC_DAILY runs all 7 days.
  assert.equal(output.routes['lon-par'].length, 7);
  assert.equal(output.routes['lon-par'][0].delayMinutes, 0); // no RT delay for this trip
});
