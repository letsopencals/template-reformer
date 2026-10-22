# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/classes/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx`: `<Button variant size fullWidth>`. Variants:
  `primary` (ink fill), `outline` (1px ink), `ghost`, `inverse` (paper, for ink
  or photo backgrounds), `urgent` (spring red, "last beds" only). Sizes
  `sm|md|lg`. **Tensile buttons are squared-ish (2px radius) ink instruments**;
  no pills, no spring colours. Links that look like buttons use
  `buttonClasses({ variant, size, fullWidth, className })`. Pass only layout
  classes via `className` (no tailwind-merge: use `max-sm:hidden`, not `hidden`).
- `components/ui/input.tsx` — `<Input>`, `<Textarea>`, `<Select>`, `<FieldLabel>`.
- `components/ui/chip.tsx` — `<Chip selected>` toggle chips (filters, pickers) and `<Tag tone>`.
- `components/ui/sheet.tsx` (slide-over right ≥768px, bottom sheet below) and
  `components/ui/dialog.tsx`; both trap focus and lock Lenis.
- Leave genuinely-different controls inline: selection/toggle chips with an
  active/selected state (staff/time/day/variant/location/department pickers, step
  indicator/progress, pagination), destructive buttons (no destructive variant),
  `<select>`, checkboxes/radios, icon-only controls, and navigation rendered as
  `next/link` `<Link>` (Button renders a `<button>` and has no anchor mode).

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones (`hooks/use-booking-flow.ts`).

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/booking/step-indicator.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is never
  in the initial bundle: it loads on demand inside
  `components/checkout/payment-step.tsx`.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## Tensile: reformer Pilates studio (Berlin, EUR, `Europe/Berlin`)

Three studios (Mitte, Kreuzberg, Prenzlauer Berg) plus "Tensile at Home"
(online), eight instructors, group classes capped at the beds in the room,
private 1:1 and duet sessions, dated workshops. Seed dataset `reformer_studio`.
Design contract: **DESIGN.md** (tokens, type, motifs, motion, ownership).

### Foundation files (owned by the template foundation; raise changes as `TODO(lead)`, don't fork)
`DESIGN.md`, `lib/site-config.ts`, `lib/catalog.ts`, `lib/timetable.ts`,
`lib/level-path.ts`, `lib/server-data.ts`, `lib/booking-meta.ts`,
`lib/policy.ts`, `lib/calendar.ts`, `lib/format.ts`, `app/globals.css`,
`app/layout.tsx`, `app/template.tsx`, `components/{ui,motion,motifs,layout,auth,cart}/*`,
`contexts/*`, `hooks/*` and every `app/api/*` route. `public/images`,
`public/videos`, `public/logo*.svg` and `app/icon.png` belong to the media
pipeline. Page agents own their route folders and `components/<area>/*`
(DESIGN.md §8); each stub page has a `TODO(Pn)` comment.

### Data model (`lib/catalog.ts`): derived from the API, keyed by slugs
- **Class type** = a product group (`productId`). Its `key` is the longest
  `siteConfig.classes` key that prefixes the variant slugs
  (`flow-mitte-lena` → `flow`, `online-mat-online-mika` → `online-mat`);
  unknown groups fall back to `slugify(title)` and still render.
- **Series** = one variant = class × studio × instructor. Studio and
  instructor come from the variant's own `locations[0]` / `staffMembers`,
  **never from the title**. `capacity` = `maxAttendees` = beds in the room;
  `room` comes from `siteConfig.classes[key].rooms[studioKey]`.
- **Kind**: `workshop` / `private` from the `workshops` / `privates`
  collections first, then all-online locations → `online`, 1 seat → `private`,
  `workshop-` slug → `workshop`, else `class`.
- **Privates**: group `private`, variants `private-<studio>-solo|duet`, one
  seat each, every studio teacher as staff, a shared product pool per studio.
  A duet is one booking for two: send `people: 2` to `/api/book`, which writes
  `customAttributes.people = "2"`.
- Studios are keyed by location slug in site-config (`tensile-mitte`), exposed
  as short keys (`mitte`) for URLs (`/studios/mitte`). Instructors by staff slug
  (`lena-hoffmann`; a leading `staff-` is ignored). Classes by class key
  (`/classes/flow`).
- `getCatalog()` (server) returns `{ classTypes, privates, workshops, studios,
  instructors, starterKeys }`; query helpers: `findClassType`, `findSeries`,
  `findStudio`, `findInstructor`, `physicalStudios`, `privatesAt`, `allSeries`.
  Everything is plain JSON (RSC props and `unstable_cache` safe).

### The timetable and Full inference (`lib/timetable.ts`)
- `getTimetable()` fans out one merged-availability call per series
  (`ProductService.getCurrentAvailabilitiesMerged`, 6 at a time) and caches
  the result for 300 s (`unstable_cache`). Privates are excluded (their times
  are live studio-hours slots; read them with `/api/products/[slug]/availability`).
- Each range is one class (split if it's an exact multiple of the duration).
  `seatsLeft = maxAttendees − attendees`; `status` is `open`, `low`
  (≤ `siteConfig.lowSeatsThreshold`) or `full`.
- **The API drops full slots.** For each weekly series we collect its pattern
  (Berlin weekday + local start time). A pattern slot missing on a date
  between today and the **last start the API returned for any series** is
  added as `status: 'full', inferred: true` (never inside the product's
  `advanceScheduleThreshold`). Workshops and privates are never inferred; a
  full workshop just disappears. A cancelled or blocked class also reads as
  Full: that's accepted. **Known gap:** a series that is full in *every* week
  of the horizon has no observed slot, so no pattern, and vanishes instead of
  showing Full (keep seed density below that, or add a fallback pattern
  source in site-config if it matters).
- Pattern keys are local time, so the 25 Oct / 29 Mar DST switches don't
  create phantom twins (tests in `lib/timetable.test.ts`).
- Helpers: `nextWithSpace(occ, all)` (same class type, any studio, later, not
  full), `filterOccurrences(occs, { studio, class, level, instructor, time })`
  for the URL filters, `groupByDay`, `upcomingFor`, `localParts`,
  `localDates`, `weekStart`, `timeOfDay`, `isOffPeak` (Mon–Fri 10:00–16:00,
  matching the automatic Off-peak discount).
- Level path: `levelPath(countCompleted(appointments))` in `lib/level-path.ts`.
  Guidance only; it never blocks booking.

### Booking, cart and checkout
- Add a class to the cart: `POST /api/book` with `{ slot: { productId,
  fromDate, fromTime, toDate, toTime, staffMemberId, locationId },
  numberOfAttendees, addOns, people? }` and the `X-Cart-Id` header; then
  `setCart(data.cart)` from `useCart()`. Slots are UTC
  (`Occurrence.start/end` → `YYYY-MM-DD` / `HH:mm:ss`).
- Checkout is `/checkout` (ported from HAAR): `CheckoutProvider` +
  `components/checkout/*`: customer → questions (incl. the required waiver
  checkbox) → payment (Stripe or pay at the studio). Discount codes go
  through `/api/cart/discount-code` (raw fetch with `X-Api-Version: 1`).
  The intro and off-peak discounts are automatic; the cart totals show them.
- **Discounts never combine:** the best single one wins per line (intro 30% >
  off-peak 20% > `TENSILE10` 10%). When an automatic discount beats an entered
  code, the code comes back `codeStatus: 'applied'` but is absent from
  `appliedDiscounts`: detect that and say "A better offer is already applied"
  instead of showing the code as active. Off-peak = class **start** Mon–Fri
  10:00–16:00 inclusive, Berlin (`isOffPeak`).
- **SDK 0.3.18:** `checkout/submit` returns `auth` only for a trusted
  customer. Without it, the confirmation page must say "sign in with a code to
  see this booking in your account" rather than assume a session.
- Policies: 12 h cancel/reschedule (`cancelGap` 43200 s; copy via
  `lib/policy.ts` `formatGap`), 21-day booking window
  (`siteConfig.policies.bookingWindowDays`).
- Online classes: the Tensile at Home location's `link` is the live URL;
  `getBookingMeta(appt).joinUrl` + `getJoinState(from, to)` drive the Join
  button (`siteConfig.joinWindowMinutes` before start until the end).

### Times
**Always Berlin.** Every time renders in `siteConfig.timezone` on the server
and in the browser (the timezone context is pinned to it), so SSR and
hydration agree and a visitor abroad sees studio time. 24 h clock, `en-GB`
formatting, EUR.

### Auth
Passwordless only: `/login` (email → 6-digit code, `login-code` provider) and
`/link/[token]` magic links (`lib/link-redirect.ts` maps
`/account/appointments/{id}/view?action=…` to `/account/appointments/{id}?action=…`).
`/auth/sign-in` redirects to `/login`. The middleware refreshes tokens and
protects `/account/*`. Account API routes read the token via `requireAuth()`.

### Gotchas
- The SDK runs with `throwOnError: true` (`lib/opencals.ts`). Catch
  `OpencalsApiError` in routes and pass it through `handleApiError`. Types
  still mark `data` optional unless the call passes `throwOnError: true`;
  pass it per call rather than writing `data!`.
- Next 15 route `params` and `searchParams` are Promises. Page and route
  files can only export Next's own names; helpers live in `lib/`.
- Server code can't call functions exported from a `'use client'` file. Pure
  helpers live in `lib/`.
- `lib/server-data.ts` is server-only; client components get data as props or
  through the `/api/*` routes with SWR.
- No AI images exist yet. Every image goes through `SafeImage` inside an
  `.image-placeholder` container.
- In shell commands, quote bracketed paths (`'app/classes/[slug]/page.tsx'`).

## Verifying changes

- `npm run typecheck`, `npm run lint` (plus `npx eslint .` for hooks/contexts)
  and `npm test` (vitest: `lib/timetable.test.ts`, `lib/catalog.test.ts`,
  `app/api/_lib/guards.test.ts`) must pass.
- `npm run build` must pass before release. While several agents work in this
  folder, only the lead runs `next build` / `next dev`; others build in a
  scratchpad copy (rsync without `node_modules`/`.next`, symlink
  `node_modules`). Read-only pages should be `○`/`●` (static/ISR) or `ƒ`
  Server Components, not pure client pages.
- Smoke test (seeded `reformer_studio` store): `/timetable` shows classes with
  bed pips and some Full rows with "next with space"; a Flow class books end to
  end with the intro offer applied; a duet private books with
  `customAttributes.people = "2"`; the account shows Join for an online class.
