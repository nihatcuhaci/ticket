# EuroTrain: Product Roadmap

A concise view of what's in this MVP submission, what comes right after it, and what's further out. For the reasoning behind each item, see `README.md` (particularly §7 APIs & Data Strategy and §9 Roadmap, which cover the same ground in full prose).

---

## MVP (this submission)

- One-way and round-trip search, with a full Turkish/English UI
- Quick-date presets (Today / Tomorrow / This weekend) and a cheapest-day highlight on the date strip
- Date and fare-class (Standard / Plus / Premier) comparison, with sold-out/low-availability signals
- Real, live-refreshed departure times and delays from Eurostar/Thalys's open GTFS feed, with a clearly-labelled synthetic fallback where there's no live coverage
- Deterministic (seeded, not random) fare pricing: same search always returns the same result
- On-device recent searches (last 5, persisted via AsyncStorage)
- Checkout: trip summary + a real deep-link handoff to eurotrain.net's live booking search, no in-app payment form, no card data collected
- In-app Help & contact screen, linking out to eurotrain.net's real help center and contact form
- A real device-connectivity gate (blocks the app with a retry action when there's no usable connection)
- Animated launch intro
- Core empty / loading / error states across Home, Results and Checkout
- Live EUR→TRY/USD/GBP currency conversion, with a labelled fallback rate on failure

## Post-MVP (next, still pre-launch)

- Real Rail Europe pricing/booking API integration behind the existing `services/` seam, so Results shows genuinely live *prices*, not just times
- Live schedule coverage extended to connecting/interline journeys (currently single-through-train only)
- Platform and delay data verified against the real GTFS feed once reachable (currently built and tested against a synthetic fixture only)
- Accounts, with saved searches synced across devices (today's recent searches are on-device only)
- An expanded station/route table beyond the current 9-station, 14-route seed set
- Seat-class-aware deep-linking (passing the user's Standard/Plus/Premier pick through to eurotrain.net, pending confirmation their URL scheme supports it)
- A stronger connectivity check: an active reachability probe, not just `navigator.onLine`/OS-reported state
- Open-jaw trips (returning from a different city than you arrived in)
- Push notifications for live train status, built on top of the real-time delay data this MVP already has
- Funnel drop-off analytics (search → results → checkout → handoff-click) to validate the core journey with real users
- Broader automated test coverage: unit tests on `journeyGenerator`, `bookingLink` and `recentSearches`, plus e2e on the full flow (today's verification is a manual Playwright smoke-walk done during development)

## Future

- Loyalty / points program
- An AI trip-planning assistant as an actual end-user feature (e.g. "plan me a 4-day Benelux trip" turning into a pre-filled multi-city search), rather than a generic support chatbot (deliberately excluded from this MVP; see README §9 for why)
- B2B / travel-agency booking mode for Odamigo's existing customer base
- Russian language support, to fully cover the TR/CY/AZ markets (Turkish/English already shipped in this MVP)
- An in-app support chat on the Help screen, replacing today's static FAQ + link-out, if usage data shows static content isn't enough
- A full accessibility audit, beyond the wheelchair-user search flag already in this MVP
