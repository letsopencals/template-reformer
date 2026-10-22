# Tensile: design bible

> *Strength, under tension.*
> Small-room reformer Pilates in Berlin. Three studios (Mitte, Kreuzberg, Prenzlauer Berg), eight teachers, every class capped at the number of beds in the room.

This file is a **contract**. Every agent building this template reads it. Only the lead edits it. If you need something that isn't here, add a `TODO(lead):` note in your summary rather than inventing a parallel system.

---

## 1. Voice

- **Technical but warm.** A precision instrument in a calm room. Short sentences, concrete nouns, the vocabulary of the reformer (springs, carriage, footbar, straps, beds).
- **Show every number the API gives.** Beds left, prices, durations, the 12-hour cancel window. Never invent stats; zero values are hidden.
- **Never say "luxury", "transform", "journey" or "elevate".** No exclamation marks, no emoji in UI. Sentence case, except mono labels (`.eyebrow`), which are uppercase.
- German appears only in addresses and place names. Prices in euros (`€34`, en-GB formatting), times 24 h (`18:45`), dates `Tue 27 Oct`.
- "Bed" means a place in class. "Hold your bed", "3 beds left", "Full".

## 2. Colour tokens (`app/globals.css` `@theme`)

| Token | Hex | Use |
|---|---|---|
| `plaster` | `#EDEBE6` | page background |
| `plaster-deep` | `#E4E1DA` | bands, hover rows, image placeholders |
| `paper` | `#F6F5F1` | cards, sheets, fields |
| `ink` | `#121212` | text, **primary buttons**, taken beds, footer |
| `ink-soft` | `#2A2A28` | ink hover |
| `graphite` | `#55534E` | muted text |
| `steel` | `#8A8F95` | captions, dim text, rails |
| `concrete` | `#BDB9B0` | strong hairlines, empty beds |
| `line` | `#D6D3CC` | hairlines |
| `spring-green` / `-soft` | `#3E9B6A` / `#DCEBE2` | gentle (Foundations, Prenatal, Mat, Online) |
| `spring-yellow` / `-soft` | `#E2B42E` / `#F5ECD0` | flowing (Flow, privates) |
| `spring-blue` / `-soft` | `#2F5BD3` / `#DBE2F6` | strong (Sculpt, Jump Board, workshops) |
| `spring-red` / `-soft` | `#D9412B` / `#F6DCD6` | heavy (Tower) **and urgency** (last beds, Full) |

Aliases for scaffold code: `bg` = plaster, `surface` = paper, `ink-muted` = graphite, `ink-dim` = steel. Prefer the named tokens.

Rules:
- **The springs are the only saturated colours.** Never use them for decoration, backgrounds of large areas, or buttons (except `Button variant="urgent"`).
- A class's spring comes from `ClassType.spring` / `ClassSeries.spring` / `Occurrence.spring` (site-config, falling back to the product's dashboard colour). Never map class → colour in a component.
- Spring red doubles as urgency: "2 beds left", "Full", the hold timer under 2 minutes. Nothing else is red.
- Body text on plaster/paper is ink or graphite. On ink: `paper`, `paper/70`, `paper/50`.

## 3. Type

Fonts come from `next/font/google` in `app/layout.tsx`:

- **Archivo** (variable, `axes: ['wdth']`) → `--font-archivo`, for display and body.
- **IBM Plex Mono** (400/500/600) → `--font-plex-mono`, for data.

| Class | Use | Spec |
|---|---|---|
| `.display-xl` | hero headline | clamp(3.25rem, 9vw, 8.5rem), 800, wdth 125, tracking −0.045em, lh 0.92 |
| `.display-lg` | page titles | clamp(2.6rem, 6.2vw, 5.5rem), 800, wdth 125 |
| `.display-md` | section titles | clamp(2rem, 4.2vw, 3.5rem), 800, wdth 125 |
| `.display-sm` | card / sheet titles | clamp(1.5rem, 2.6vw, 2.1rem), 750, wdth 112 |
| `<em>` in display | the counterweight | same face, weight 300, normal width, no italics |
| `.headline` | h3, list titles | 700, wdth 112, tracking −0.02em |
| body | paragraphs | Archivo 400/500, 1rem/1.6, wdth 100 |
| `.eyebrow` | labels, chips, table heads | Plex Mono 500, 0.7rem, uppercase, tracking 0.14em |
| `.tabular` / `.data` | times, prices, counts, dates | Plex Mono, tabular figures |

Timetable typography: times in `.tabular` (`18:45`), class names in `.headline`, instructor and studio in body graphite, beds in `BedPips`.

## 4. Shape, space, elevation

- **Radius:** 2px on buttons, chips, fields and tags; 4px on cards, sheets and dialogs. Nothing round except the spring coil.
- **Borders over shadows.** Cards are `border border-line bg-paper`. `shadow-card` only for floating cards, `shadow-float` for sheets and the drawer.
- Layout: `.container-x` (max 1320px, 20px/40px gutters), `.section-y` (5rem/8rem).
- Images: `SafeImage` inside an `.image-placeholder` container (pale concrete with a faint diagonal grain). **No AI images exist yet**: every image must look fine missing.

## 5. Motifs (`components/motifs/`)

| Motif | Component | Use |
|---|---|---|
| Tension cable | `<TensionCable sag? delay? />`, CSS `.cable` + `.cable-draw` | hairline rules that draw on; section dividers, under page titles, connecting timetable rows |
| Carriage rail | `<CarriageRail value? progress? tone label? />` | progress: hold timer, privates wizard steps, scroll (bind `useScrollProgress()`) |
| Bed pips | `<BedPips capacity seatsLeft />` | one tiny bed per place; taken = ink (red when low), free = outlined; "3 beds left" / "Full" |
| Room plan | `<RoomPlan room taken? highlight? highlightColor? showLabels? />` | SVG beds in `layout.rows × cols`, headrest + footbar, front line with the room name. Class sheet, studio pages, check-in pass (`highlight` = your bed in the spring colour) |
| Spring chip | `<SpringChip spring label? text? />`, `<SpringCoil spring />`, `SPRING_VAR`, `SPRING_CLASSES` | intensity everywhere: class cards, timetable rows, filters, level path |
| Logo | `<Logo src? inverted? />` | store logo, else `/logo.svg` (media agent: `logo.svg`, `logo-mark.svg`, `logo-wordmark.svg`) |

Room data lives in `siteConfig.studios[*].rooms` (beds = `maxAttendees` in the seed). Rooms are not API entities.

## 6. Motion (`components/motion/`)

- **The carriage return:** `EASE_CARRIAGE = [0.34, 1.32, 0.5, 1]` (CSS `var(--ease-carriage)`): out fast, a slight overshoot, settle. Use it for things that *move into place*: sheets, chips, the rail carriage, selected states. `SPRING_CARRIAGE` is the spring equivalent.
- `EASE_OUT` (`--ease-settle`) for text and fades; nothing else bounces.
- Library: `Reveal`, `RevealText`, `PageTransition` (via `app/template.tsx`), `SmoothScroll` (Lenis; `useSmoothScroll()`), `CountUp`, `Marquee`, `ScrollProgress` / `useScrollProgress`, `ParallaxImage`, `MagneticButton`.
- **Reduced motion:** import `useReducedMotion` from `@/components/motion/use-reduced-motion` (hydration-safe), never from framer-motion. Every effect needs a static fallback; `globals.css` also kills CSS animations.
- Lenis owns scrolling: scrollable overlays need `data-lenis-prevent` (Sheet, Dialog, CartDrawer and the mobile menu already set it).

## 7. Z-index map

| Layer | z |
|---|---|
| ScrollProgress | 60 |
| Header (+ mobile menu) | 60 |
| Cart drawer | 65/66 |
| Sheet / Dialog scrim | 65 |
| Sheet / Dialog panel | 66 |
| Page transition curtain | 70 |

## 8. Component ownership (who builds what)

**Foundation [C]** (raise changes as `TODO(lead)`, don't fork):
`app/globals.css`, `app/layout.tsx`, `app/template.tsx`, `components/ui/*`, `components/motion/*`, `components/motifs/*`, `components/layout/*`, `components/auth/*`, `components/cart/*`, `components/checkout/*` (port; P2 restyles it), `contexts/*`, `hooks/*`, every `app/api/*` route, `lib/*` (`site-config`, `catalog`, `timetable`, `level-path`, `server-data`, `booking-meta`, `policy`, `calendar`, `format`).

**Page agents** own their route folders and a matching `components/<area>/` folder:

| Agent | Routes | Components |
|---|---|---|
| P1 home | `app/page.tsx` | `components/home/*` |
| P2 timetable + class sheet + checkout | `app/timetable/*`, `app/checkout/*` | `components/timetable/*`, `components/class-sheet/*`, restyle of `components/checkout/*` |
| P3 privates + workshops | `app/privates/*`, `app/workshops/*` | `components/privates/*`, `components/workshops/*` |
| P4 classes, studios, instructors | `app/classes/*`, `app/studios/*`, `app/instructors/*` | `components/classes/*`, `components/studios/*`, `components/instructors/*` |
| P5 account + confirmation | `app/account/*`, `app/thank-you/*` | `components/account/*`, `components/confirmation/*` |

Shared widgets that two pages need (e.g. a timetable row on the studio page) are built by the owner (P2) in `components/timetable/` and imported by the others. Every stub page carries a `TODO(Pn)` comment.

## 9. Page notes

- **Home:** hero video (`/videos/hero.mp4`, poster `/images/hero/hero.jpg`), "Today at Tensile" live board (from `getTimetable()`), class types with springs, studios, instructors, the intro offer (`siteConfig.introOffer`), how a first class works, FAQ.
- **Timetable:** week poster board on desktop, swipeable days on mobile. Filters `studio`, `class`, `level`, `instructor`, `time` as URL params (`filterOccurrences`). Bed pips, Full with "next with space →" (`nextWithSpace`), off-peak tags (`Occurrence.offPeak`).
- **Class sheet:** `<Sheet>` slide-over: room plan, teacher, spring, what to bring, prerequisite, level path; it becomes checkout (questions, add-ons, intro/off-peak price preview, code field, then Stripe or pay at studio).
- **Privates:** studio → 1:1 or Duet → instructor or first available → time. A duet is one seat, `people: "2"`.
- **Confirmation:** a check-in pass with your bed highlighted in the room plan, ICS/Google links, "same time next week?".
- **Account:** "Your week" with cancel/reschedule (12 h policy copy), Join for online, feedback, the level path.

## 10. Imagery direction (media agent)

Pale concrete, ash-wood reformers, black steel frames, linen. Soft overcast north light. Real bodies of mixed ages and ethnicities, candid, no influencer posing. Template art in `public/images/` (`hero/`, `studios/{mitte,kreuzberg,prenzlauer-berg}-{1,2}.jpg`, `editorial/1..8.jpg`, `about/founders.jpg`) and `public/videos/hero(.mp4|-mobile.mp4)`. Class images, instructor portraits, logo and banner come from the store.
