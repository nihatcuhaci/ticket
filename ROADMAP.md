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
- A stronger connectivity check: an active reachability probe, not just `navigator.onLine`/OS-reported state
- Open-jaw trips (returning from a different city than you arrived in)
- Push notifications for live train status, built on top of the real-time delay data this MVP already has
- Funnel drop-off analytics (search → results → checkout → handoff-click) to validate the core journey with real users
- Sign in with Google (account linking): lets saved searches, and any future booking history, follow a user across devices without a bespoke email/password flow, and taps into the widely used Google Calendar integration to automatically add planned trips to the user's calendar. A deliberate move to lower signup friction and prioritize user convenience.
- Push notifications for promotions and updates, layered on top of the live train-status alerts above rather than replacing them
- In-app campaign pop-ups, for surfacing seasonal offers or announcements without standing up a separate email channel
- Firebase integration for crash and error reporting, so real-world failures surface automatically instead of relying on manual QA

## Future

- Loyalty / points program
- An AI trip-planning assistant as an actual end-user feature (e.g. "plan me a 4-day Benelux trip" turning into a pre-filled multi-city search), rather than a generic support chatbot (deliberately excluded from this MVP; see README §9 for why)
- B2B / travel-agency booking mode for Odamigo's existing customer base
- Russian language support, to fully cover the TR/CY/AZ markets (Turkish/English already shipped in this MVP)
- An in-app support chat on the Help screen, replacing today's static FAQ + link-out, if usage data shows static content isn't enough
- A full accessibility audit, beyond the wheelchair-user search flag already in this MVP
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
