# EuroTrain — Mobile Experience MVP

A take-home submission for Odamigo's **AI Product Development Case: EuroTrain Mobile Experience**.

Built with React Native (Expo) + TypeScript. Runs on iOS, Android and web from a single codebase.

---

## 1. What I Built

A mobile-first MVP covering the one journey the case explicitly calls out — *"discover, plan and move toward purchasing"* — end to end:

**Home** — origin/destination search with a real station list, date picker, passenger counts (with age bands, matching how Eurostar/Rail Europe actually price fares), a wheelchair-accessibility flag, and quick-pick popular routes.

**Results** — a date strip showing the cheapest fare for nearby days (so users can shop by date before committing), a per-departure list with three fare classes (Standard / Plus / Premier) shown side by side, sold-out/low-availability signals, a live EUR→TRY/USD/GBP currency toggle, and fare-conditions detail sheets.

**Checkout** — guest checkout (no forced account creation), passenger details with inline validation, a mocked payment-method selector, and a persistent order-summary footer.

**Confirmation** — a generated PNR and booking summary, explicitly labelled as a demo booking.

Loading, empty ("no direct route" / "no departures that day") and error (simulated network failure with retry) states are implemented on the two screens where they matter most, rather than only on the happy path.

I did **not** build: authentication/accounts, a "My Bookings" area, multi-leg/interline journeys, seat maps, or a real payment integration. See [§3 Product Scope](#3-product-scope--prioritization) for why.

## 2. Quick Start

```bash
npm install
npx expo start          # then press "w" for web, or scan the QR code with Expo Go
```

Web build used for automated testing during development:

```bash
EXPO_OFFLINE=1 npx expo export --platform web   # -> dist/, serve with any static server
```

(`EXPO_OFFLINE=1` is only needed in network-restricted CI/sandbox environments where Expo's own update-check call is blocked — see §7.)

## 3. Product Scope & Prioritization

The brief deliberately withholds a feature list, so here's the reasoning behind what's in vs. out.

**In scope**, because it *is* the core value proposition ("discover, plan, move toward purchasing"):
search with a real station set and sensible passenger/accessibility inputs; comparing price across dates and fare classes (this is the single biggest UX differentiator on the real eurostar.com — I verified this by walking their live site before designing this MVP, see `eurostar-analiz.md`); a checkout flow that *feels* complete without requiring an account; a confirmation that closes the loop.

**Deliberately left out**, and why:

- **Accounts / login / loyalty (Club Eurostar-style points)** — real value, but orthogonal to proving the core booking journey works. Guest checkout alone already demonstrates the "purchase" step end-to-end.
- **Seat selection / seat maps** — high implementation cost, low signal for a product-thinking exercise; Standard/Plus/Premier class selection already demonstrates the pricing-tier UX.
- **Multi-leg / connecting journeys** (e.g. London → Cologne via Brussels) — the real Rail Europe network supports this, but it roughly doubles the pricing-model complexity for a case that rewards *focus*.
- **Real payments** — explicitly out of scope per the brief (§4/§6 of the case).
- **Push notifications for live train status** — genuinely valuable (it's the #1 reason Eurostar's own app exists, per their marketing copy), but needs a backend/notification service that doesn't add product-decision signal here.

## 4. Core User Journey

Home → Results → (select fare) → Checkout → Confirmation, with exactly one required decision per screen (where to go, when/which fare, who's travelling, pay). The trip summary is always visible once a fare is selected (a sticky bottom bar), mirroring the pattern I observed being effective on eurostar.com — the user always knows what they're about to pay before committing.

## 5. UX/UI Thinking

- **Information hierarchy**: price and time are the two things a rail traveller scans for first, so both get the largest type on the results list; everything else (duration, luggage rules, seats-left) is secondary.
- **Feedback**: every async action (searching, paying) has a visible loading state; the results date-strip updates immediately on tap so date-shopping feels instant.
- **Empty/error states are first-class**, not an afterthought: an invalid origin/destination pair disables the search button *and* explains why (bad request should never be reachable); a simulated network failure on Results shows a retry action instead of a blank screen; a date with no departures says so instead of showing an empty list.
- **Currency fallback is visible, not silent**: when the live FX call fails, the UI says so ("live" vs "cached" badge) instead of pretending the number is fresh.

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo (TypeScript) | One codebase → iOS/Android/web; Expo's managed workflow removes native-build overhead, which matters for a 4-6h case; large hiring pool overlap with a JS/TS-heavy product org. |
| Navigation | React Navigation (native-stack) | De facto standard, native performance, small API surface for 4 screens. |
| State | React Context (`AppState`) | The shared state (search criteria, selected fare, passenger, confirmation) is small and shallow — Redux/Zustand would be unjustified overhead at this scope. Documented as a conscious choice, not an oversight. |
| Styling | `StyleSheet` + a small hand-rolled token system (`src/theme`) | No design-system dependency to install/learn; tokens keep colors/spacing consistent and swappable. |
| Data | Local TypeScript modules (`src/data`, `src/services`) | See §7. |

## 7. APIs & Data Strategy

This is the decision I want to be most explicit about, because the brief specifically asks for it.

**Rail Europe's real booking/pricing API is not reachable for this case.** Odamigo holds that integration as a B2B partner relationship — it's not a self-service API a candidate can sign up for in a few days. Attempting to reverse-engineer or scrape eurostar.com's live search as a backend was considered and rejected: it would violate their terms of use, is brittle (breaks on any front-end change), and is exactly the kind of production-readiness red flag the case's evaluation criteria call out.

**What I did instead — a hybrid:**

1. **Real, static reference data** (`src/data/stations.ts`, `src/data/routes.ts`): actual Eurostar-network station names, cities, countries and coordinates, plus route durations and fare ranges gathered by manually browsing live search results on eurostar.com (documented separately in `eurostar-analiz.md`, produced as research before this build). This is not live data and does not claim to be — it's a realistic, honestly-sourced seed set.
2. **A deterministic pricing engine** (`src/services/journeyGenerator.ts`): fares are derived from a seeded hash of route+date+time-slot, not `Math.random()`. Same search always returns the same result, which makes the app demoable and testable, while still producing believable day-to-day and lead-time-based price variation (weekend/last-minute markup, occasional sold-out fare classes) — patterns I observed on the real site.
3. **One genuinely live, external API** (`src/services/currencyService.ts`): EUR→TRY/USD/GBP conversion via `frankfurter.app` (free, keyless, ECB-backed). This is real, not mocked — chosen because Odamigo's core markets are Türkiye, Cyprus and Azerbaijan, so showing a EUR fare converted to TRY is genuine product value, not a demo flourish. It's called with a 4s timeout and falls back to a hard-coded rate snapshot on failure, with the UI honestly labelling which one is showing. (In the sandboxed environment this was built in, outbound network is allow-listed to package registries only, so the live call fails there by design and you'll see the fallback path — it will succeed on a normal device or CI runner with open internet.)

**Trade-off, stated plainly**: nothing about pricing/availability in this build is real. In exchange, the app is fully offline-capable, has zero API-key/secret management surface, and every screen state (including sold-out and error states) is reachable on demand for a demo rather than dependent on real-world timing.

## 8. Architecture

```
App.tsx                    entry: providers (gesture handler, safe area, app state) + navigator
src/
  navigation/               React Navigation stack + route param types
  screens/                  one file per screen, composed from components
  components/               presentational + modal components, no business logic
  services/                 journeyGenerator (pricing), currencyService (FX), bookingService (mock checkout)
  state/                    AppState — cross-screen search/selection/booking context
  hooks/                    useExchangeRates
  data/                     stations.ts, routes.ts, fareClasses.ts — the seed dataset
  theme/                    design tokens
  types/                    shared TypeScript interfaces
```

Screens own layout and user interaction; components are reusable and presentational; services own all business/data logic and are the seam where a real backend would plug in later (see §12). This separation is the main thing making "swap mock data for a real API" a services-layer change rather than a screen rewrite.

## 9. AI-Assisted Development

Built end-to-end with Claude (Sonnet) as a pair-programmer inside an agentic coding environment (Claude Code / Cowork). Concretely:

- Product framing and scope decisions (§3) were reasoned through in conversation before any code was written, anchored on the actual case brief and on hands-on research of the real eurostar.com booking flow (browser automation was used to walk the live site — search, fare selection, checkout, account, loyalty program — to ground the seed data and UX patterns in something real rather than invented).
- All application code (types, data, services, components, screens, navigation) was AI-generated, then verified by me by actually running it: `tsc --noEmit` for type-safety, `expo export --platform web` to confirm the Metro bundle builds cleanly, and a scripted Playwright walk-through of the full Home → Results → Checkout → Confirmation flow (including the error/retry and no-route-warning states) against the exported build, with console/page errors asserted empty.
- One real bug this caught and I fixed: a `react`/`react-dom` version mismatch (19.2.3 vs 19.2.0) that crashed the app at runtime with a minified React error — invisible from source review or type-checking alone, only caught by actually loading the page in a browser and reading the console.
- AI as an **end-user-facing feature was deliberately not included**. The obvious candidate would be a chat assistant (the real eurostar.com has one — "Ask AI" — which I saw during research). I left it out because it would add UI surface without adding signal about the core booking journey this case asks for; it's called out explicitly as future work in the roadmap instead.

## 10. Assumptions

- "MVP" targets an individual leisure/business traveller booking directly, not Odamigo's B2B travel-agency customers (a materially different, permissions-heavy product).
- Fare rules text (exchange/refund/luggage policy) is paraphrased from what's publicly displayed on eurostar.com's real fare-conditions panel, not copied verbatim, and is illustrative rather than legally binding copy.
- Only the 14 routes in `src/data/routes.ts` are "servable" — searching an unconnected pair correctly shows a "no direct route" state rather than crashing or inventing a route.

## 11. Security & Production Considerations

Per the brief, production-grade auth/payments/security hardening was intentionally not built. What exists today and what a real launch would need:

| Area | Current state (MVP) | What production needs |
|---|---|---|
| Payments | Fully simulated; no card data collected, transmitted or stored | A PCI-DSS-scoped PSP integration (Stripe, or iyzico given the TR/CY/AZ market) using hosted fields/tokenization so card data never touches Odamigo's servers; 3-D Secure; webhook-driven payment confirmation instead of trusting the client; idempotency keys to prevent double-charging on retry. |
| Auth | None — guest-only flow | Real auth would need secure token storage (not AsyncStorage for anything sensitive), refresh-token rotation, and rate-limited login to resist credential stuffing. |
| Secrets | None in the client — the one real API call (FX rates) needs no key | Any real backend/API key must never ship in the client bundle; use a thin backend-for-frontend to hold secrets and proxy requests. |
| Personal data | Passenger name/email/phone stored only in-memory for the session, never persisted or transmitted anywhere | GDPR/KVKK-compliant handling: encryption at rest, defined retention periods, explicit consent capture (the real eurostar.com's separate marketing-opt-in checkbox, which I preserved as a UX pattern, is a good model), data-subject deletion support. |
| Reliability | Simulated latency/failure only; no real network dependency to fail except the FX call, which already degrades gracefully | Real integration needs retry/backoff, circuit-breaking around the Rail Europe API, and monitoring/alerting on booking-flow error rates. |
| Input validation | Client-side only (email format, required fields) | Never trust client validation for a real booking — the same rules must be re-enforced server-side. |

## 12. Known Limitations

- Prices and availability are not real (§7). Nothing here should be read as an actual Rail Europe fare.
- No persistence: closing the app loses search state and the last booking confirmation (there's no "My Bookings").
- No localization — UI copy is Turkish (the case's own market), station data is in English; a real product for TR/CY/AZ would need at minimum TR/EN/RU.
- No automated test suite (unit/e2e) beyond the manual Playwright smoke-walk used during development — see roadmap.
- Only tested on web (Chromium) during development due to this being a headless build environment without a device/simulator attached; TypeScript compiles cleanly and the code uses only cross-platform RN APIs, but native iOS/Android behavior (safe-area insets, gesture conflicts) has not been visually verified on-device.

## 13. Roadmap

**MVP (this submission)** — search, date/fare comparison, guest checkout, mocked payment, confirmation, core empty/loading/error states, live FX conversion with fallback.

**Post-MVP** (next, still pre-launch): accounts + saved bookings ("My Bookings" / PNR retrieval, mirroring what I saw is a guest-friendly PNR+surname lookup pattern on the real site); real Rail Europe partner API integration behind the existing `services/` seam; real PSP integration (iyzico/Stripe) replacing `bookingService`; seat selection; multi-leg/interline journeys; push notifications for live train status (the single most-cited reason to install a rail app, per Eurostar's own app marketing); basic analytics on funnel drop-off (search → results → checkout → confirmation) to validate the core-journey assumption with real users; automated test coverage (unit tests on `journeyGenerator`'s pricing logic, e2e on the booking flow).

**Future**: loyalty/points program; an AI itinerary/trip-planning assistant as an actual end-user feature (deliberately excluded from MVP, §9) — e.g. "help me plan a 4-day Benelux trip" turning into a pre-filled multi-city search, which is a much stronger AI product bet than a generic support chatbot; B2B/travel-agency booking mode for Odamigo's existing customer base; multilingual support (TR/EN/RU minimum); full accessibility audit beyond the wheelchair-user search flag already in the MVP.
