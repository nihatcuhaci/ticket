# EuroTrain: Mobile Experience MVP

A take-home submission for Odamigo's **AI Product Development Case: EuroTrain Mobile Experience**.

Built with React Native (Expo) + TypeScript. Runs on iOS, Android and web from a single codebase.

📍 **Looking for the roadmap?** See [`ROADMAP.md`](./ROADMAP.md) for a concise, bullet-point MVP / Post-MVP / Future breakdown. This README's [§9](#9-roadmap) covers the same ground in full prose with the reasoning behind each item.

## Live Preview

No install, no account needed to try it. Scan or open on a phone with the free **Expo Go** app installed ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)):

**[expo.dev/preview/update?...](https://expo.dev/preview/update?message=Fix&updateRuntimeVersion=exposdk%3A57.0.0&createdAt=2026-08-23T21%3A12%3A49.856Z&slug=exp&projectId=9d76b6ad-204e-478b-aacd-6ce673db112e&group=b7b47140-1ff4-47ff-8425-747209d7a2c7)** (on the page, choose **Expo Go**, not "Development build")

This opens the actual app running natively on your device via EAS Update, published from the `preview` branch: not a web preview or a mockup, the real `journeyGenerator`/`bookingLink`/`liveScheduleService` code from this repo. No login or Expo account required to open the link; it's a public preview page with a QR code and an "Open in Expo Go" option, verified working (logged out) on both Android and iOS. (For a browser-based preview instead, see §2 Quick Start for the local `expo export --platform web` build.)

Prefer a direct install on Android, no Expo Go needed? Download the APK straight from the EAS build page: **[expo.dev/.../builds/d6a0faa3-...](https://expo.dev/accounts/nhttt/projects/eurotrain/builds/d6a0faa3-4a37-48ec-b61a-342ad380d9bb)**. No login required there either, the project's unauthenticated-access setting for internal builds is on. This build link stays valid for about 30 days from when it was created (Aug 23, 2026).

---

## 1. What I Built

A mobile-first MVP covering the one journey the case explicitly calls out ("discover, plan and move toward purchasing"), end to end:

- **Launch**: a short animated intro overlaid on top of the real app while it's already loading behind it, rather than gating on it. See [§7](#7-apis--data-strategy).
- **Home**: origin/destination search with a real station list, one-way/round-trip toggle, quick-date chips, full date picker(s), passenger counts with age bands, a wheelchair-accessibility flag, popular-route quick picks, and a full Turkish/English toggle covering all UI copy. See [§6](#6-tech-stack).
- **Recent searches**: the last 5 distinct searches, persisted on-device, shown on Home; tapping one re-runs it dated to today; entries are removable. See [§7](#7-apis--data-strategy).
- **Results**: a date strip with the cheapest day highlighted, three fare classes (Standard / Plus / Premier) side by side, sold-out/low-availability signals, a live currency toggle, and fare-conditions detail sheets. Real departure times get a "Canlı" badge when a live feed covers that route/date; a clearly-labelled synthetic fallback otherwise. See [§7.6](#7-apis--data-strategy). Round trip reuses this screen twice, Outbound then Return.
- **Checkout / handoff**: a trip summary and a "Continue on eurotrain.net" action that deep-links to eurotrain.net's real, live search-results page for the exact trip configured. No payment form, no card data, no account ever touches this app. See [§7](#7-apis--data-strategy).
- **Confirmation**: restates the trip, makes clear no booking or charge happened in-app, and offers to reopen eurotrain.net or start a new search.
- **Help & contact**: an in-app FAQ covering what a reviewer is most likely to wonder about, plus links to eurotrain.net's real help center and contact form. See [§7](#7-apis--data-strategy).
- **No-connection gate**: a full-screen block whenever the device has no usable connection, with a retry action and automatic recovery. See [§7.5](#7-apis--data-strategy).
- Loading, empty and error states, implemented on the two screens where they matter most.
- **Not built**: authentication/accounts, a "My Bookings" area, multi-leg/interline journeys, seat maps, in-app payment collection. See [§3](#3-product-scope--prioritization) for why.

## 2. Quick Start

```bash
npm install
npx expo start          # then press "w" for web, or scan the QR code with Expo Go
```

Web build used for automated testing during development:

```bash
EXPO_OFFLINE=1 npx expo export --platform web   # -> dist/, serve with any static server
```

(`EXPO_OFFLINE=1` is only needed in network-restricted CI/sandbox environments where Expo's own update-check call is blocked. See §7.)

**Optional one-time step, to turn on real live departure times (§7.6):** the app works immediately without this. It just shows the clearly-labelled synthetic schedule until you do it.

1. Push this repo to your own GitHub repo (a normal `git push`, nothing special).
2. Open `src/services/liveScheduleService.ts` and change the one line:
   ```ts
   const LIVE_SCHEDULE_REPO = 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME';
   ```
   to your actual `owner/repo`, e.g. `'nihatcuhacii/eurotrain-mvp'`.
3. That's it. Nothing to deploy or sign up for. The `refresh-schedules` GitHub Actions workflow starts running automatically on its own schedule (every 15 minutes) as soon as the workflow file is on GitHub. Check progress under the repo's **Actions** tab; to trigger a run immediately instead of waiting, open the "Refresh live schedules" workflow there and click **Run workflow**.
4. Once the first run finishes, `https://raw.githubusercontent.com/<owner>/<repo>/data/live-schedules.json` is live, and Results will start showing real departure times (a "Canlı" badge) for the routes/dates the feed covers.

## 3. Product Scope & Prioritization

The brief deliberately withholds a feature list, so here's the reasoning behind what's in vs. out.

**In scope**, because it *is* the core value proposition ("discover, plan, move toward purchasing"):
search with a real station set and sensible passenger/accessibility inputs; one-way **and round-trip** search, since a return leg is one of the most common real-world trip shapes and the real eurostar.com treats it as core, not an add-on (confirmed by walking its live "Add return" flow during research); comparing price across dates and fare classes (this is the single biggest UX differentiator on the real eurostar.com, confirmed by walking their live site before designing this MVP; see `eurostar-analiz.md`); real, live-refreshed departure/arrival times and delay status sourced from Eurostar's own open GTFS feed, not just illustrative slots (§7.6); a checkout/handoff step that hands the traveller to a *real, live* eurostar.com search for the exact trip they configured, so "move toward purchasing" ends at an actual, bookable page instead of a fake success screen.

**Deliberately left out**, and why:

- **Accounts / login / loyalty (Club Eurostar-style points)**: real value, but orthogonal to proving the core booking journey works. A guest, click-out flow already demonstrates the "purchase" step end-to-end.
- **Seat selection / seat maps**: high implementation cost, low signal for a product-thinking exercise; Standard/Plus/Premier class selection already demonstrates the pricing-tier UX.
- **Multi-leg / connecting journeys** (e.g. London → Cologne via Brussels): the real Rail Europe network supports this, but it roughly doubles the pricing-model complexity for a case that rewards *focus*.
- **In-app payments**: explicitly out of scope per the brief (§4/§6 of the case); rather than mock a fake payment form, the MVP hands off to eurotrain.net's own real, secure checkout instead (§7).
- **Push notifications for live train status**: genuinely valuable (it's the #1 reason Eurostar's own app exists, per their marketing copy), but needs a backend/notification service that doesn't add product-decision signal here.

## 4. Core User Journey

One-way: Home → Results → (select fare) → Checkout (summary + handoff) → Confirmation (handoff summary), with exactly one required decision per screen (where to go, when/which fare, continue to eurotrain.net). Round trip: the same flow with one extra decision (Results is used for Outbound, then Return, before Checkout), matching the Outbound → Return → Checkout breadcrumb I found on eurostar.com's own booking flow during research, rather than inventing a different pattern. The trip summary is always visible once a fare is selected (a sticky bottom bar), mirroring the pattern I observed being effective on eurostar.com: the user always knows what trip they're about to continue with before leaving the app.

## 5. UX/UI Thinking

- **Information hierarchy**: price and time are the two things a rail traveller scans for first, so both get the largest type on the results list; everything else (duration, luggage rules, seats-left) is secondary.
- **Feedback**: every async action (searching, paying) has a visible loading state; the results date-strip updates immediately on tap so date-shopping feels instant.
- **Empty/error states are first-class**, not an afterthought: an invalid origin/destination pair disables the search button *and* explains why (bad request should never be reachable); a simulated network failure on Results shows a retry action instead of a blank screen; a date with no departures says so instead of showing an empty list.
- **Currency fallback is visible, not silent**: when the live FX call fails, the UI says so ("live" vs "cached" badge) instead of pretending the number is fresh.

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo (TypeScript) | One codebase for iOS/Android/web; Expo's managed workflow removes native-build overhead, which matters for a 4-6h case; large hiring pool overlap with a JS/TS-heavy product org. |
| Navigation | React Navigation (native-stack) | De facto standard, native performance, small API surface for 4 screens. |
| State | React Context (`AppState`) | The shared state (search criteria, selected fare) is small and shallow, so Redux/Zustand would be unjustified overhead at this scope. Documented as a conscious choice, not an oversight. |
| Styling | `StyleSheet` + a small hand-rolled token system (`src/theme`) | No design-system dependency to install/learn; tokens keep colors/spacing consistent and swappable. |
| Data | Local TypeScript modules (`src/data`, `src/services`) | See §7. |
| Connectivity | `expo-network` (`NetworkGate`, `useNetworkStatus`) | Official Expo module, zero native config in the managed workflow; reflects real device/browser connectivity rather than being simulated. See §7.5. |
| Localization | Hand-rolled i18n (`src/i18n/translations.ts`, `useTranslation`) | A single `Strings` TypeScript interface both the `tr` and `en` dictionaries must satisfy, so a missing translation is a compile-time error, not a silent runtime fallback to the wrong language; no library needed for 2 languages. |
| Local persistence | `@react-native-async-storage/async-storage` (`src/services/recentSearches.ts`) | The app's only genuinely persisted state (recent searches, §7.7) is isolated in its own storage-backed service rather than folded into `AppState`'s in-memory context, since it's the only thing that needs to survive an app restart. |
| Live schedule pipeline | Plain Node.js script (`scripts/fetch-live-schedules.mjs`) on a GitHub Actions schedule, output served from a `data` branch via `raw.githubusercontent.com` | No server to run or pay for; sidesteps Cloudflare Workers' free-tier 10ms-CPU-per-invocation limit, which a GTFS-zip-parsing job would blow through. See §7.6. |

## 7. APIs & Data Strategy

This is the decision I want to be most explicit about, because the brief specifically asks for it.

**Rail Europe's real booking/pricing API is not reachable for this case.** It's a B2B partner integration, not something a candidate can self-serve sign up for. Scraping eurostar.com's live search was considered and rejected: it violates their terms, is brittle, and is exactly the production-readiness red flag the brief warns against.

**Instead, a hybrid:**

1. **Real, static reference data** (`src/data/stations.ts`, `src/data/routes.ts`): real station names, cities, coordinates, route durations and fare ranges, gathered by manually browsing eurostar.com (see `eurostar-analiz.md`). Not live data, and doesn't claim to be.
2. **Deterministic pricing** (`src/services/journeyGenerator.ts`): fares come from a seeded hash of route+date+time-slot, not `Math.random()`. Same search always returns the same result; still varies realistically (weekend/last-minute markup, occasional sold-out classes), matching patterns observed on the real site.
3. **One genuinely live API** (`src/services/currencyService.ts`): EUR→TRY/USD/GBP via `frankfurter.app` (free, keyless, ECB-backed), 4s timeout with a labelled fallback rate on failure. Real product value for Odamigo's TR/CY/AZ markets, not a demo flourish.
4. **Real deep-link checkout** (`src/services/bookingLink.ts`): builds a URL into eurotrain.net's real search-results page using the user's actual origin/destination/date(s)/passengers (round trip in a single link), opened via `Linking.openURL`. Station ids are eurotrain.net's own `bookingSlug`s, captured by hand walking the live site. No payment form, no card data, no account ever touches this app. This is the same metasearch/click-out pattern as Skyscanner or Google Flights.
5. **Real connectivity gate** (`src/hooks/useNetworkStatus.ts`, `src/components/NetworkGate.tsx`): blocks the whole app behind a full-screen "no internet" state, with manual retry and automatic recovery, based on the device's actual reported network state. Known caveat: reflects "connected to a network," not "internet genuinely reachable" (e.g. a captive portal reads as online).
6. **Real, live-refreshed departures** (`scripts/fetch-live-schedules.mjs`, `src/services/liveScheduleService.ts`): a scheduled GitHub Actions job pulls Eurostar/Thalys's free, public GTFS feed, and the app reads the latest result with a short cache. Live departures get a "Canlı" badge; uncovered routes fall back to the synthetic generator, clearly labelled either way. One-time setup: point `LIVE_SCHEDULE_REPO` at your own repo (§2).
7. **On-device recent searches** (`src/services/recentSearches.ts`, `@react-native-async-storage/async-storage`): the only state that survives an app restart; everything else (`AppState`) is in-memory only by design. Last 5, deduped by route + trip-type, re-dated to today on rerun rather than replaying a stale date (§1), every read/write wrapped in try/catch.

**Trade-off**: fare *prices* stay illustrative (points 1–2); departure *times* are real where the feed has coverage (point 6). Checkout hands off to a real, live, bookable eurotrain.net page, the one place "is this real" matters most for price, without this app ever touching payment data or API secrets.

## 8. Architecture

```
App.tsx                    entry: providers (gesture handler, safe area, app state) + network gate + navigator,
                             with SplashIntro overlaid on top while the app underneath is already loading (§1)
src/
  navigation/               React Navigation stack + route param types
  screens/                  one file per screen, composed from components (incl. HelpScreen)
  components/               presentational + modal components, no business logic (incl. NetworkGate, SplashIntro)
  services/                 journeyGenerator (pricing), currencyService (FX), bookingLink (checkout deep-link, §7.4),
                             liveScheduleService (real GTFS-sourced departures, §7.6), recentSearches (on-device
                             persistence, §7.7)
  state/                    AppState: cross-screen search/selection context (in-memory only, §7.7)
  hooks/                    useExchangeRates, useNetworkStatus, useRecentSearches, useTranslation
  i18n/                     translations.ts: the TR/EN string dictionary (§6)
  data/                     stations.ts, routes.ts, fareClasses.ts: the seed dataset
  theme/                    design tokens
  types/                    shared TypeScript interfaces
scripts/                    fetch-live-schedules.mjs (+ gtfs-lib.mjs, its test): plain Node.js, outside the
                             app bundle entirely; run by GitHub Actions, not by the app (§7.6)
.github/workflows/          refresh-schedules.yml: the scheduled pipeline that runs scripts/ and
                             publishes live-schedules.json to the `data` branch
```

Screens own layout and user interaction; components are reusable and presentational; services own all business/data logic and are the seam where a real backend would plug in later. This separation is the main thing making "swap mock data for a real API" a services-layer change rather than a screen rewrite. `liveScheduleService.ts` is a working example of exactly that swap already having happened for schedules, with the same pattern ready for `journeyGenerator.ts`'s pricing once a real fares API is reachable.

## 9. Roadmap

*Also available as a standalone file: [`ROADMAP.md`](./ROADMAP.md).*

**MVP (this submission)**
- One-way and round-trip search, full Turkish/English UI (§6)
- Quick-date presets and a cheapest-day highlight; date/fare-class comparison
- Real GTFS-sourced departure times and delays where available (§7.6), synthetic fallback elsewhere
- On-device recent searches, last 5 (§7.7)
- Real eurotrain.net deep-link checkout handoff, both legs in one link (§7.4)
- In-app Help & contact screen linking out to eurotrain.net's real support pages
- Real device-connectivity gate (§7.5)
- Animated launch intro; core empty/loading/error states
- Live FX conversion with fallback

**Post-MVP** (next, still pre-launch)
- Real Rail Europe pricing/booking API behind the existing `services/` seam, for genuinely live *prices*, not just times
- Live coverage extended to connecting/interline journeys (currently single-through-train only)
- Platform/delay data verified against the real feed once reachable (currently tested only against a synthetic fixture)
- Accounts + saved searches, synced across devices (today's recent searches, §7.7, are on-device only)
- A stronger connectivity check: an active reachability probe, not just `navigator.onLine`/OS state
- Open-jaw trips (returning from a different city than you arrived in)
- Push notifications for live train status, built on the real-time delay data (§7.6) already in place
- Funnel drop-off analytics (search → results → checkout → handoff-click)
- Sign in with Google (account linking): lets saved searches, and any future booking history, follow a user across devices without a bespoke email/password flow, and taps into the widely used Google Calendar integration to automatically add planned trips to the user's calendar. A deliberate move to lower signup friction and prioritize user convenience.
- Push notifications for promotions and updates, layered on top of the live train-status alerts above rather than replacing them
- In-app campaign pop-ups, for surfacing seasonal offers or announcements without standing up a separate email channel
- Firebase integration for crash and error reporting, so real-world failures surface automatically instead of relying on manual QA

**Future**
- Loyalty / points program
- AI trip-planning assistant as an end-user feature (e.g. "plan me a 4-day Benelux trip" → pre-filled multi-city search), deliberately excluded from this MVP
- B2B / travel-agency booking mode
- Russian language support, to fully cover the TR/CY/AZ markets
- In-app support chat on the Help screen, replacing today's static FAQ + link-out, if usage data shows it's needed
- Full accessibility audit, beyond the wheelchair-user search flag already shipped
- Heatmap tracking of in-app taps and scrolling, to see where users actually engage and inform future UX priorities
- A "rate this app" pop-up, timed to appear after a positive moment (e.g. right after a completed handoff) rather than interrupting the search flow
- Firebase-based purchase funnel tracking, to pinpoint exactly which step (search, results, checkout, handoff) users drop off at
- A/B testing infrastructure (Firebase A/B Testing), to test pricing framing, plan names, or button colors across user cohorts
- Dynamic pricing, varying fare or plan presentation by geography or user segment
- Abandoned-cart recovery: if a user enters Checkout without completing the handoff, trigger an automatic discount notification (via Firebase Cloud Messaging or OneSignal) after a delay, e.g. 15 minutes or 1 hour
- Temporary seat locking: holds a selected seat in the database for a few minutes (e.g. 5) with an on-screen countdown, using urgency to nudge users toward completing checkout faster
- Apple Pay and Google Pay support at checkout, so users don't have to type a card number by hand
- Price/seat alarms: lets a user set an alert for a sold-out search or a fare they're waiting to drop, triggered via [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging) or [OneSignal](https://onesignal.com/) the moment a seat opens up or the price falls
- A "seats remaining" indicator, highlighting low availability (e.g. "3 seats left") in bold/red on the Results list once a departure is down to its last few seats
- Cross-sell integrations just before Checkout, offering travel insurance, an on-board meal add-on, or local transfer/car rental at the destination (e.g. via the [Uber API](https://developer.uber.com/) or the Rentalcars API) as opt-in checkboxes
