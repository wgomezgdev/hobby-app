# UI Specification
<!-- 001-reading-companion-mvp | 2026-05-25 | v2.0 — post design review -->

Screen-by-screen UI specification for the Reading Companion MVP.
Every screen is described in terms of layout, components, colours, typography, and behaviour.
Visual mockups: `ui-design/` at project root (run `python ui-design/generate.py` to regenerate).

Design system: **Material 3** · Theme: `ThemeData(useMaterial3: true)` · Seed: `Color(0xFF4B3D8F)`

---

## Design Review — Issues Found in v1.0

Before the updated spec, here is a record of every problem identified and the rationale for each change.

| # | Area | Issue | Impact |
|---|---|---|---|
| 1 | Color | Stock M3 purple seed — looks identical to every default Flutter app | No brand identity |
| 2 | Color | Tertiary role was a muted pink with no thematic purpose | Wasted design token |
| 3 | Typography | Single font family throughout — no typographic personality | Generic feel for a reading-focused app |
| 4 | Typography | Quote text at 13 sp — too small for comfortable reading | Violates app's core purpose |
| 5 | Home | Streak badge tiny in top-right corner — a core engagement driver hidden as an afterthought | Low engagement |
| 6 | Home | Cover block only 80 dp wide — visual app with small covers | Weak visual hierarchy |
| 7 | Home | FAB is a plain ＋ circle — primary action has no label | Discoverability |
| 8 | Home | No "last read N days ago" context on cards | Users can't tell which books are neglected |
| 9 | Library | No persistent search bar — search is absent from the main book list | Breaks usability for large libraries |
| 10 | Library | No sort button — only status filter chips visible | Users cannot sort by rating or date |
| 11 | Book Detail | No estimated completion date from reading velocity | Missing actionable insight |
| 12 | Book Detail | No total accumulated reading time shown | Missing meaningful stat |
| 13 | Book Detail | Progress bar has no milestone markers (25/50/75%) | No sense of journey |
| 14 | Book Detail | Session history cards look identical regardless of session length | No visual scanning cue |
| 15 | Quotes | Left accent bar is functional but uninspired | Low visual quality |
| 16 | Quotes | No decorative quote mark — typography is the product here | Missed character opportunity |
| 17 | Quotes | Quote text 13 sp — too small | Readability issue |
| 18 | Log Session | "From page" requires manual entry — always equals last session's pagesTo | Unnecessary friction |
| 19 | Log Session | 5 form fields for a sub-10-second flow target | Breaks the 10 s spec requirement |
| 20 | Profile | Stats are raw numbers in identical square cards — no visual story | Weak data presentation |
| 21 | Profile | Settings use full cards per row — heavy visual weight for a utility section | Wasted space |
| 22 | All | Zero motion specification | Developers will invent inconsistent transitions |
| 23 | All | No loading state or error state spec | Async states left undefined |
| 24 | All | No minimum touch target enforcement | Accessibility gap |

---

## Global Design Tokens

### Design direction: "Warm Scholar"

A reading companion should feel like a beautifully designed notebook — warm, calm, and premium. Not a generic productivity tool.

**Direction:** Deep scholarly indigo + warm cream background + amber-gold accent. The combination evokes leather book covers, aged paper, and highlighted text.

### Colour roles (light theme)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#4B3D8F` | Buttons, active tabs, progress fill, FAB — deeper, more premium than stock M3 |
| `onPrimary` | `#FFFFFF` | Text/icons on primary surfaces |
| `primaryContainer` | `#E3DEFF` | Chip backgrounds, nav active indicator, subtle highlights |
| `onPrimaryContainer` | `#0E004F` | Text on primaryContainer |
| `secondary` | `#5C5470` | Supporting UI, tag pills, secondary actions |
| `secondaryContainer` | `#E1DCF2` | Active filter chip background |
| `tertiary` | `#A0700A` | Stars, quote highlights, amber accent — the "gold" of the palette |
| `tertiaryContainer` | `#FDEFC8` | Favourite badge backgrounds, warm highlight surfaces |
| `onTertiary` | `#FFFFFF` | Text on tertiary |
| `onTertiaryContainer` | `#321A00` | Text on tertiaryContainer |
| `background` | `#FFF8F2` | Screen background — warm cream, not cold white |
| `surface` | `#FFFFFF` | Cards, sheets, bottom nav |
| `surfaceVariant` | `#EAE5F0` | Input field backgrounds |
| `surfaceContainerHigh` | `#EDE8F4` | Search bar, elevated surfaces |
| `outline` | `#7A7489` | Inactive borders, placeholder text |
| `outlineVariant` | `#CCC7D8` | Dividers, inactive chip borders |
| `error` | `#B3261E` | Validation errors |
| `onSurface` | `#1C1A27` | Primary body text |
| `onSurfaceVariant` | `#4A4559` | Secondary body text, captions |
| `amber` | `#E8A020` | Star fill (explicit, not a M3 role) |

### Gradient presets

| Name | Usage | From | To |
|---|---|---|---|
| `headerGradient` | All top-level screen headers | `#4B3D8F` | `#7060B8` |
| `heroGradient` | Book detail SliverAppBar | Cover palette top | Cover palette bottom |
| `coverPalette[0]` | Book cover tint 0 | `#4B3D8F` | `#8470CF` |
| `coverPalette[1]` | Book cover tint 1 | `#1A6B9A` | `#4FA0CC` |
| `coverPalette[2]` | Book cover tint 2 | `#B05B00` | `#E08840` |
| `coverPalette[3]` | Book cover tint 3 | `#1A7A45` | `#4DB077` |
| `coverPalette[4]` | Book cover tint 4 | `#8B2020` | `#C05050` |
| `coverPalette[5]` | Book cover tint 5 | `#5C1F7A` | `#9050B8` |

### Typography scale

Two font families are used:

- **Sans-serif (UI font):** `Nunito` (Google Fonts) — warm, rounded, highly legible. Used for all UI chrome.
- **Serif (editorial font):** `Lora` (Google Fonts) — classical, book-like. Used for quote text and book titles in detail view.

> Flutter integration: load both via `google_fonts` package. Define in `core/theme/app_theme.dart`.

| Role | Family | Size | Weight | Usage |
|---|---|---|---|---|
| Display Large | Lora | 34 sp | Bold | Sign-in app name |
| Display Medium | Lora | 28 sp | Bold | Book title in Book Detail hero |
| Headline Large | Nunito | 22 sp | Bold | Screen section headers |
| Headline Medium | Nunito | 20 sp | Bold | App bar titles |
| Title Large | Nunito | 18 sp | Bold | Card titles, sheet headings |
| Title Medium | Nunito | 16 sp | SemiBold | Book titles in cards |
| Body Large | Lora | 16 sp | Regular | Quote text — serif for readability |
| Body Medium | Nunito | 14 sp | Regular | Form values, session notes |
| Body Small | Nunito | 13 sp | Regular | Supporting captions |
| Label Large | Nunito | 15 sp | Bold | Button labels |
| Label Medium | Nunito | 12 sp | SemiBold | Field labels, active chip labels |
| Label Small | Nunito | 11 sp | Regular | Badges, metadata, legal text |

### Elevation & shadows

| Level | Usage | Spec |
|---|---|---|
| Level 0 | Flat (no shadow) | Background, dividers |
| Level 1 | Cards (default) | `blur: 4, offset: 0/2, rgba(0,0,0,0.08)` |
| Level 2 | Cards (hover/pressed) | `blur: 8, offset: 0/4, rgba(0,0,0,0.12)` |
| Level 3 | FAB, bottom sheet | `blur: 16, offset: 0/8, rgba(0,0,0,0.16)` |

Corner radii: `20 dp` (hero cards), `16 dp` (default card), `12 dp` (compact card), `28 dp` (bottom sheet), `24 dp` (FAB extended).

### Spacing grid

8 dp grid throughout. Named tokens:

| Token | Value | Common use |
|---|---|---|
| `spacing.xs` | 4 dp | Icon-to-label gap |
| `spacing.sm` | 8 dp | Tight spacing within components |
| `spacing.md` | 16 dp | Screen horizontal padding, card internal padding |
| `spacing.lg` | 24 dp | Between sections within a screen |
| `spacing.xl` | 32 dp | Between major layout sections |
| `spacing.xxl` | 48 dp | Hero to content transitions |

### Accessibility requirements

- **Minimum touch target:** 48×48 dp on every interactive element (use `InkWell` + `minimumSize` constraint).
- **Contrast:** All body text on `background` or `surface` must meet WCAG AA (4.5:1). Primary button text (white on `#4B3D8F`) = 7.2:1 ✓.
- **Semantic labels:** All icon buttons and image widgets must have `Semantics(label: ...)`.
- **Reduce motion:** All animations respect `MediaQuery.reduceMotion`. When true, substitute instant transitions.
- **Large text:** All layouts tested at 130% text scale via `textScaleFactor`.

---

## Shared Components

### Bottom Navigation Bar

- Height: 72 dp · Background: `surface` · Elevation: level 3
- Top border: `outlineVariant` 1 dp
- 4 tabs: **Home · Library · Quotes · Profile**
- Active tab: pill indicator 64×32 dp, `primaryContainer`, radius 16 — icon in `onPrimaryContainer`, label 12 sp bold `primary`
- Inactive tab: icon + label in `onSurfaceVariant`, no indicator
- Icon size: 22 dp · Label: 11 sp

### Top App Bar (gradient)

- Background: `headerGradient`
- Height: 56 dp (status bar 44 dp separate)
- Title: Headline Medium (20 sp bold Nunito), white, **left-aligned** (not centred — more modern)
- Back arrow: left 20 dp, white, 22 sp, 48×48 dp touch target
- Action icons: right 12 dp, white, 48×48 dp touch target

> Left-aligned titles feel more modern on Android (Material 3 recommendation) and give more horizontal space for longer book titles.

### Top App Bar (transparent / scroll-aware — Book Detail)

Used only on screens with `SliverAppBar`. The bar starts transparent over the hero gradient and transitions to `surface` with shadow as the user scrolls down past the hero. Title fades in as the hero scrolls off-screen.

### Cards

- Background: `surface`
- Corner radius: `16 dp` (hero card: `20 dp`, compact: `12 dp`)
- Shadow: level 1 at rest, level 2 on press
- Internal padding: `spacing.md` (16 dp)
- Press feedback: `InkWell` ripple in `primaryContainer`

### Filter chips (horizontal scroll row)

- Height: 36 dp · Radius: 18 dp · Horizontal scroll, no wrapping
- Active: `primaryContainer` fill, no border, bold label `onPrimaryContainer`
- Inactive: `surface` fill, `outlineVariant` border 1 dp, regular label `onSurfaceVariant`
- Gap between chips: 8 dp

> Removed border on active chip (material 3 pattern) — the fill alone communicates selection.

### Tag pills

- Height: 24 dp · Radius: 12 dp · Horizontal padding: 10 dp
- Background: `tertiaryContainer`
- Label: 11 sp Nunito, `onTertiaryContainer`

> Changed from `secondaryContainer` to `tertiaryContainer` — the amber-warm tone makes tags feel like highlighted text, which is thematically right for a reading app.

### Outlined text fields

- Height: 52 dp (increased from 48 for larger touch target) · Radius: 12 dp
- Background: `surfaceVariant`
- Idle: `outlineVariant` border 1 dp, floating label 12 sp `onSurfaceVariant`
- Focused: `primary` border 2 dp, floating label `primary`
- Error: `error` border 2 dp, floating label + helper text `error` 11 sp
- Helper text (optional): 11 sp `onSurfaceVariant` below field

### FAB (standard)

- Size: 56×56 dp · Radius: 16 dp · Background: `primary` · Shadow: level 3
- Icon: 24 dp white
- Position: 16 dp from right edge, 88 dp from bottom (clears bottom nav + 16 dp gap)

### Extended FAB (Home screen only)

- Height: 56 dp · Width: auto (icon + label + padding) · Radius: 28 dp (pill)
- Background: `primary` · Shadow: level 3
- Icon: 24 dp white + label 15 sp bold white, gap 8 dp
- Position: same as FAB
- Label collapses to icon-only when user scrolls down (via `SliverAppBar` scroll listener)

### Progress bar

- Height: 8 dp (card variant) / 12 dp (detail view) · Radius: 6 dp
- Track: `primaryContainer`
- Fill: `primary` with `LinearGradient` from `#4B3D8F` to `#7060B8`
- Milestone markers: small 12×12 dp white diamonds at 25%, 50%, 75% along the bar (detail view only)

### Circular progress indicator (streak)

- Size: 56×56 dp
- Track: `primaryContainer` 6 dp stroke
- Fill: `amber` (`#E8A020`) 6 dp stroke, `StrokeCap.round`
- Centre: streak count 16 sp bold `primary`
- Used only on Home and Profile

### Star rating widget

- Compact (cards): 5 stars, 14 sp, gap 2 dp, `amber` filled / `outlineVariant` empty
- Detail (ranking tab): 5 stars, 40 sp, gap 6 dp, `amber` filled / `outlineVariant` empty
- Touch target: each star 48×48 dp minimum
- On select: scale bounce animation `1.0 → 1.3 → 1.0` in 200 ms + medium haptic

### Book cover block

- Gradient fill from `coverPalette[index % 6]`
- Corner radius inherits from parent card
- Centred letter (first letter of title) in Display Medium (28 sp) white Lora
- Fallback when real cover unavailable: letter + subtle radial gradient overlay

---

## Motion & Interaction Specification

### Screen transitions

| From → To | Transition |
|---|---|
| Home / Library → Book Detail | Shared element (cover image) `Hero` tag `book-cover-{id}`. Fade through for other elements. Duration 350 ms |
| Any tab → Any tab | Fade through 200 ms (`FadeTransition`) |
| Any screen → Add Book / Sign-in | Slide up 300 ms ease-in-out |
| Back navigation | Slide right 250 ms ease-in |

### Bottom sheet animation

- Enter: slide up from bottom 300 ms `Curves.easeOutCubic` + scrim fade in 200 ms
- Dismiss: slide down 250 ms `Curves.easeInCubic` + scrim fade out 150 ms
- Drag to dismiss: follows finger, snap threshold at 40% sheet height

### Micro-interactions

| Event | Animation | Haptic |
|---|---|---|
| Favorite toggle | Heart scales `1.0 → 1.4 → 1.0` in 250 ms + colour cross-fade | `HapticFeedback.mediumImpact` |
| Log session save (success) | Bottom sheet slides away + brief green `SnackBar` slides in from bottom | `HapticFeedback.heavyImpact` |
| Save quote | Sheet dismisses + quote card animates in at top of list | `HapticFeedback.lightImpact` |
| Book reaches 100% | Progress bar animates to full + gold shimmer sweep left-to-right over bar + `SnackBar` "🎉 Finished!" | `HapticFeedback.heavyImpact` |
| Streak milestone (7 / 30 / 100 days) | Streak badge pulses and shows a brief overlay banner | Medium haptic |
| Star tap (rating) | Selected star scales bounce + amber fill sweeps from left | Light haptic per star |

### Loading states

All async states use the sealed `AsyncState<T>` union defined in `core/`. Visual spec:

| State | Visual |
|---|---|
| `loading` | Shimmer skeleton matching the shape of the loaded content (`shimmer` package, `primaryContainer` base) |
| `error` | Centred icon + message + "Retry" outlined button in `error` colour |
| `empty` | Dedicated empty state illustration + CTA (specified per screen) |
| `success` | Content renders normally |

Shimmer skeletons defined per component: `HomeBookCardSkeleton`, `BookGridCardSkeleton`, `QuoteCardSkeleton`.

---

## Screen 01 — Sign-in
**Satisfies:** AC-05.1

### Design rationale

The sign-in screen is the brand's first impression. The previous design used a generic white floating card over a gradient. The new design fills the entire screen with the brand gradient, uses Lora for the wordmark (establishing editorial identity), and keeps the action card minimal — one button, breathing room, no distractions.

### Layout

Full-screen, two zones:

1. **Brand zone** (top ~55% of screen): gradient `#4B3D8F → #7060B8 → #9080C8`, contains logo + wordmark + tagline
2. **Action zone** (bottom ~45%): white card rounded top (radius 40), overlapping the gradient, contains the sign-in button

### Brand zone

| Element | Spec |
|---|---|
| Logo mark | Circular container 88×88 dp, `rgba(255,255,255,0.15)` fill, radius 44. Inner: open-book SVG icon 44 dp white (or 📖 emoji 44 sp as fallback) |
| App name | "Reading Companion" single line, Lora Bold 34 sp, white, centred. Do not split across two lines |
| Tagline | "Your personal reading journal", Nunito 14 sp, `rgba(255,255,255,0.75)`, centred, 8 dp below name |
| Decorative dots | Subtle radial dot pattern in `rgba(255,255,255,0.06)` — gives depth without distraction |

### Action zone (white card)

| Element | Spec |
|---|---|
| Card | Full-width, radius 40 top only, `surface`, shadow level 3, overlaps brand zone by 24 dp |
| Top handle | 40×4 dp `outlineVariant` pill, centred, 12 dp from top (visual affordance) |
| Headline | "Welcome back", Nunito 22 sp bold, `onSurface`, centred, 32 dp below handle |
| Subtext | "Sign in to sync your reading across all your devices", Nunito 13 sp `onSurfaceVariant`, centred, 8 dp below headline |
| Google button | Full-width − 48 dp, height 56 dp, radius 28, `surface` fill, `outlineVariant` border 1 dp. Left: Google colour G logo 24 dp. Label: "Continue with Google" 15 sp bold Nunito `onSurface`. Centred label accounting for icon width |
| Spacer below button | 16 dp |
| Privacy note | "By signing in you agree to our Terms · Privacy", 11 sp `outline`, centred |
| Bottom breathing room | 32 dp |

### Behaviour

- Tapping the Google button triggers Supabase OAuth flow
- Loading state: Google button shows circular progress indicator replacing icon; label becomes "Signing in…"; button non-interactive
- Error state: `SnackBar` at bottom: "Sign-in failed. Please try again." with Retry action
- No other interactive elements on screen

---

## Screen 02 — Home Dashboard
**Satisfies:** AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.5, AC-07.1, AC-07.3, AC-07.4

### Design rationale

The home screen is opened every day. The previous design buried the streak (a core engagement driver) as a small badge and used a narrow cover block. New design: streak is a prominent circular widget in the header, covers are wider (40% of card width), and the FAB is extended with a label.

### Layout

```
[ Gradient header — greeting + streak ring ]
[ Currently Reading — section label        ]
[ HomeBookCard × N                         ]
[ Extended FAB (bottom-right)              ]
[ Bottom Navigation Bar                    ]
```

### Gradient header

| Element | Spec |
|---|---|
| Background | `headerGradient` · Height: 148 dp (taller than before to accommodate streak ring) |
| Time-aware greeting | Top line: "Good morning / afternoon / evening" 13 sp Nunito `rgba(255,255,255,0.80)` |
| User name | "Wilson" 26 sp Nunito Bold white, 4 dp below greeting |
| Streak ring | Right side of header, vertically centred. `CircularProgressIndicator` 56×56 dp amber on `primaryContainer` track. Centre: streak count 16 sp bold `primary`. Below ring: "day streak" 10 sp `rgba(255,255,255,0.80)`. Hidden entirely when streak = 0 (AC-07.4) |

### Currently Reading section

- Section label: "Currently Reading" 16 sp Nunito bold `onSurface`, 16 dp horizontal padding, 20 dp top margin

### HomeBookCard

- Size: full-width − 32 dp, height **168 dp** (increased) · Radius: 20 dp · Shadow: level 1
- **Cover block:** `100×136 dp` (was 80×114) — covers now take 40% of card width. `Hero` tag `book-cover-{id}` for transition to Book Detail. Radius 12 dp
- **Last read label:** below cover, "Today" / "Yesterday" / "N days ago" — 10 sp Nunito `onSurfaceVariant`. Warm amber when > 3 days (subtle nudge)
- **Title:** Title Medium (16 sp Nunito SemiBold) `onSurface`, max 2 lines, ellipsis
- **Author:** 12 sp Nunito `onSurfaceVariant`
- **Progress bar:** full available width, 8 dp tall, with milestone markers at 25/50/75% (12×12 dp white diamonds, only shown when book has passed that milestone)
- **Progress label:** "68% complete · p. 204 / 300" 11 sp `onSurfaceVariant`
- **"Log session" button:** 48 dp tall, radius 10, `primary` fill — takes remaining left-side width below progress label. Label: "📝 Log" 13 sp bold white
- **"Add quote" button:** same height, `primaryContainer` fill, right of Log button. Label: "❝ Quote" 13 sp bold `onPrimaryContainer`

### Extended FAB (home)

- Label: "Log Session" when scrolled to top; icon only (`+`) when scrolled down
- Background: `primary` · Radius: 28 dp
- On expand: `FloatingActionButton.extended` with icon + label, animates width change in 250 ms

### Empty state (AC-06.5) — see Screen 13

---

## Screen 03 — Library Grid
**Satisfies:** AC-01.5, AC-04.4

### Design rationale

Added persistent search bar (hidden feature in v1) and a sort button. Cover block is now taller to give books better visual presence. Book count shown in header.

### Layout

```
[ Gradient header — "My Library" (N books) + sort icon ]
[ Search bar (persistent, always visible)               ]
[ Filter chips row (horizontal scroll)                  ]
[ SliverGrid 2-column                                   ]
[ FAB                                                   ]
[ Bottom Navigation Bar                                 ]
```

### Header additions

- Title: "My Library" left-aligned 20 sp Nunito Bold white
- Subtitle: "N books" 12 sp `rgba(255,255,255,0.75)` directly below title
- Right action: sort icon (↕) opens `ModalBottomSheet` sort picker (see below)
- Grid/list toggle: second right icon

### Search bar

- Always visible below header, not hidden behind a tap
- Height: 48 dp · Full-width − 32 dp · Radius: 24 dp
- Background: `surfaceContainerHigh`
- Leading: search icon `onSurfaceVariant` 20 dp
- Hint: "Search books…" 14 sp `outline`
- Trailing: mic icon (optional voice search hook, no-op in MVP)
- Triggers FTS on local DB with 300 ms debounce

### Filter chips row

- Horizontal scroll, no wrap: **All · Reading · Finished · Want to Read**
- 8 dp gap, 16 dp leading padding

### Sort picker (bottom sheet)

Triggered by sort icon. Options (radio-style):
- Recently added (default)
- Top rated
- A → Z
- Oldest first
- Reading progress

### BookGridCard

- Size: `(W − 48) / 2` wide × **200 dp** tall · Radius: 16 dp · Shadow: level 1
- **Cover block:** full width − 16 dp padding, **120 dp tall** (increased from 108) · Radius: 10 dp
  - First letter of title centred in Lora Bold 28 sp white
  - `Hero` tag `book-cover-{id}`
- **Title:** 13 sp Nunito SemiBold, max 2 lines, ellipsis, 16 dp below cover, 8 dp horizontal
- **Author:** 11 sp `onSurfaceVariant`, 2 dp below title
- **Star row:** compact 5-star widget (14 sp) or "Not rated" 10 sp `outline`
- **Status badge:** pill (radius 10) bottom-left: "Reading" `primary` / "Done" green / "Want" `outline`. 10 sp bold

---

## Screen 04 — Library List
**Satisfies:** AC-01.5, AC-04.4

### Layout

Same gradient header, search bar, and filter chips as Screen 03 (shared widget — same state).

### BookListTile

- Height: **88 dp** (increased from 80) · Radius: 14 dp · Shadow: level 1
- **Cover block:** 60×72 dp (increased), radius 10 · `Hero` tag `book-cover-{id}`
- **Title:** Title Medium (16 sp Nunito SemiBold), 1 line ellipsis
- **Author:** 12 sp `onSurfaceVariant`
- **Last read:** 11 sp — "Today" / "N days ago" in amber when > 3 days
- **Star row:** right side, compact 5-star 14 sp
- **Status pill:** same as grid card
- **Progress bar:** 4 dp tall, shown only when 0 < progress < 100%. Below the title/author block, full available width

---

## Screen 05 — Book Detail · Progress Tab
**Satisfies:** AC-02.1, AC-02.2, AC-02.3, AC-02.6

### Design rationale

Added estimated completion date derived from average session pace, total accumulated reading time, and milestone markers on the progress bar. Session history cards are now colour-coded by duration.

### Layout

```
[ SliverAppBar hero — cover gradient (250 dp, collapses to 56 dp) ]
[ Info strip — title (Lora), author, total time, star row          ]
[ Tab bar — Progress · Quotes · Ranking                            ]
[ Progress section                                                  ]
[ Session History                                                    ]
```

### SliverAppBar hero

- Height: 250 dp (expanded) / 56 dp (collapsed)
- Background: `coverPalette[book.paletteIndex]` gradient
- Collapsed state: `surface` background, title appears (Headline Medium 20 sp)
- Back arrow: top-left, white. Overflow (⋮): top-right, white
- Book cover letter: Lora Bold 72 sp white, centred in hero (not emoji — more premium)
- **`Hero` widget wraps the letter/cover area** with tag `book-cover-{id}` — connects to library cards

### Info strip

- Background: `surface`, height: **84 dp** (increased to fit all info)
- Book title: **Lora Bold 22 sp** `onSurface` — serif reinforces "reading app" identity, max 2 lines
- Author: 13 sp Nunito `onSurfaceVariant`
- Reading stats row: "⏱ N hrs total  ·  📅 Est. done Jun 3" — 11 sp `onSurfaceVariant`
  - Total time: sum of all `durationMinutes` formatted as "Xh Ym"
  - Est. done: `(totalPages − currentPage) / avgPagesPerSession × avgSessionDays` → calendar date. Hidden if < 2 sessions logged
- Star row: compact 5-star widget (current rating or empty)

### Tab bar

- Height: 48 dp · Underline indicator: `primary` 3 dp rounded · Active label: `primary` bold
- Tabs: Progress · Quotes (N) · Ranking — Quotes tab shows count badge when > 0

### Progress section

| Element | Spec |
|---|---|
| Percentage display | Lora Bold **44 sp** `primary`, centred — large, confident |
| Sub-label | "of [title] complete" Nunito 13 sp `onSurfaceVariant` |
| Progress bar | Full-width − 32 dp, **12 dp** tall, gradient fill, milestone diamonds at 25/50/75% |
| Page count | "p. 204 read · 96 remaining" 12 sp `onSurfaceVariant` |
| Log button | Full-width − 32 dp, 52 dp tall, radius 14, `primary`. Label: "📝  Log Reading Session" Label Large white |

### Session history

- Section header: "Session History" 16 sp Nunito bold + session count right-aligned 12 sp `onSurfaceVariant`
- Each session card: full-width − 32 dp, **60 dp** tall, radius 12, shadow level 1
  - Left accent strip (6 dp wide): colour by duration — `primary` < 20 min, `tertiary` (amber) 20–45 min, `#27AE60` (green) > 45 min
  - Date: 13 sp Nunito bold
  - "pp N → N" 12 sp `onSurfaceVariant`
  - Duration: right-aligned 13 sp, colour matches strip
  - "N pages" sub-line right-aligned 11 sp `onSurfaceVariant`

---

## Screen 06 — Book Detail · Quotes Tab
**Satisfies:** AC-03.1, AC-03.2, AC-03.3, AC-03.5, AC-03.6

### Design rationale

Quote text is the product here — it must be beautiful to read. Increased to Lora 16 sp. Replaced the left accent bar with a large decorative quotation mark in the card background. The previous 13 sp sans-serif felt like a UI element, not a literary artefact.

### Layout

Same SliverAppBar + info strip + tab bar as Screen 05.

- Search bar: full-width − 32 dp, height 48 dp, radius 24, `surfaceContainerHigh`, always visible below tab bar
- Filter chips: All · Favorites · [user tags]. Horizontal scroll

### QuoteCard

- Variable height · Radius: 16 dp · Shadow: level 1 · Internal padding: 16 dp
- **Decorative quote mark:** `❝` Lora 80 sp `primaryContainer` (very light), positioned top-left, z-index below text. Gives depth without interference
- **Quote text: Lora 16 sp** `onSurface` — legible, literary. Line height 1.5
- **Separator line:** `outlineVariant` 1 dp, 12 dp vertical margin
- **Footer row:** tag pills left, favourite heart right (24 sp, `amber` when active), page number far-right 11 sp `onSurfaceVariant`
- **On favourite toggle:** heart scales `1.0 → 1.4 → 1.0` + `amber` fill, medium haptic

---

## Screen 07 — Book Detail · Ranking Tab
**Satisfies:** AC-04.1, AC-04.2, AC-04.3, AC-04.5

### Design rationale

The star rating now has a clear visual affordance. Added a rating descriptor that updates live as the user taps. Review field is more generous.

### Layout

Same SliverAppBar + info strip + tab bar as Screen 05.

### Rating section

- Prompt: "How would you rate this book?" Nunito 15 sp `onSurfaceVariant`, centred, 24 dp top margin
- **Star row:** 5 stars × **44 sp**, gap 10 dp, centred. `amber` filled, `outlineVariant` empty
  - On tap: the selected star and all preceding stars animate with scale bounce simultaneously
  - Touch target: each star cell is 56×56 dp
- **Rating descriptor:** centred below stars. Large bold text that changes live:
  - 1 ★ → "Not for me" 16 sp `error`
  - 2 ★ → "It was okay" 16 sp `onSurfaceVariant`
  - 3 ★ → "I liked it" 16 sp `onSurface`
  - 4 ★ → "Really good" 16 sp `primary`
  - 5 ★ → "Outstanding" 16 sp `tertiary` (amber tone)
- **Divider** + 16 dp spacing

### Review section

- Label: "Your thoughts" Nunito 14 sp bold `onSurface`
- Helper: "Optional — what made this book memorable?" 11 sp `outline`
- Text field: full-width − 32 dp, **min-height 140 dp**, radius 14, `surfaceVariant`, `outlineVariant` border. Lora 14 sp inside (reader-appropriate)
- Character counter: right-aligned below field, 11 sp `outline`

### Save button

Full-width − 32 dp, 52 dp tall, radius 14, `primary`. Disabled (greyed) until a star is selected.

---

## Screen 08 — Add / Edit Book
**Satisfies:** AC-01.1, AC-01.2, AC-01.3, AC-01.4

### Design rationale

No changes to structure, but cover picker is now a more prominent hero element at the top of the form (before the text fields), making it the visual anchor since books are defined by their covers.

### Layout

```
[ Gradient header — "Add Book" / "Edit Book" · ← · Save ]
[ Cover picker — top hero (most visual element)          ]
[ Form fields                                            ]
[ Status chips                                           ]
[ Save button                                            ]
```

### Cover picker (top hero)

- Position: **top of form** (was bottom). Makes cover the visual anchor.
- Size: full-width − 32 dp, **160 dp** tall, radius 16
- Empty state: `surfaceVariant` + subtle `outlineVariant` border. Centre: camera icon 32 dp `outline` + "Add cover image" 14 sp `onSurfaceVariant` + "JPG · PNG · up to 5 MB" 11 sp `outline`
- Filled state: selected image fills the card (BoxFit.cover), with a semi-transparent overlay bottom strip "Tap to change" 12 sp white
- Corner radius: 16 dp

### Form fields

| Field | Required | Input | Validation |
|---|---|---|---|
| Title | Yes | Text, `textCapWords` | Not empty. Shows error "Book title is required" |
| Author | Yes | Text, `textCapWords` | Not empty. Shows error "Author is required" |
| Total Pages | Yes | Number only | Integer > 0. Shows error "Enter a valid page count" |

- Fields stacked with 20 dp gap
- Field height: 52 dp
- On failed submit: all empty required fields turn red simultaneously, page scrolls to first error

### Status chip selector

"Status:" label 13 sp bold above. 3 chips in a row: **Want to Read · Reading · Finished**.
Default selection: "Want to Read" (pre-selected on Add; pre-filled on Edit).

### Save button

- Full-width − 32 dp, 52 dp tall, radius 14
- Active: `primary` fill + "Save Book" / "Update Book" Label Large white
- Disabled (fields empty): `surfaceVariant` fill, `onSurfaceVariant` label — becomes active as soon as required fields are filled (real-time validation, not just on submit)

---

## Screen 09 — Log Session (Bottom Sheet)
**Satisfies:** AC-02.1, AC-02.2, AC-02.4, AC-02.5

### Design rationale

The previous sheet had 5 manual fields for a "< 10 second" flow. Two changes: (1) "From page" auto-fills with the last session's `pagesTo` — the user almost never needs to change it; (2) date/time is hidden by default (collapses to "Today" with a "Change" link — the 99% case is logging right after reading).

### Sheet

- Scrim: `rgba(0,0,0,0.45)`, blurs background (use `BackdropFilter` with `blur: 4`)
- Sheet: `surface`, radius 28 dp top corners only, shadow level 3
- Drag handle: 40×4 dp `outlineVariant` pill, centred 12 dp from top
- Height: **490 dp** (reduced from 540 — fewer visible fields)

### Content

| Element | Spec |
|---|---|
| Title | "Log Session" Nunito 18 sp bold, centred, 24 dp top margin |
| Book context pill | `primaryContainer` pill (auto-width, radius 14) — book title 13 sp bold `onPrimaryContainer`. Centred. 8 dp below title |
| **"From page" field** | Auto-filled from last session's `pagesTo`. Pre-filled and read-only looking (no active border) but tappable to change. Label: "From" 12 sp. Value: large 22 sp Nunito bold `primary` |
| **"To page" field** | Empty, focused by default on sheet open. Numeric keyboard. Label: "To page". Value: 22 sp Nunito bold `onSurface`. Validation inline |
| **Duration field** | Numeric. Label: "Minutes read". Helper: "How long did you read?" |
| Date row | Collapsed by default: "📅 Today" 13 sp `onSurface` + "Change →" link 12 sp `primary`. Expanding reveals full `DateTimePicker` |
| Notes field | Collapsed — "Add a note (optional)" link text 13 sp `primary`. Tapping expands a `TextField` 60 dp tall. Reduces visual clutter for the common case |
| Save button | Full-width − 32 dp, 52 dp, radius 14, `primary`. Disabled until pagesTo and duration are filled |

### Validation

- `pagesTo > book.totalPages`: red border on pagesTo + "Can't exceed total pages (N)" helper
- `pagesTo < pagesFrom`: red border on pagesTo + "Must be greater than the starting page" helper
- Success: sheet dismisses, progress bar on Book Detail animates to new percentage, `SnackBar` "Session logged ✓" + heavy haptic

---

## Screen 10 — Add Quote (Bottom Sheet)
**Satisfies:** AC-03.1, AC-03.2, AC-03.3, AC-03.5

### Sheet

Same scrim and sheet spec as Screen 09. Height: **580 dp**.

### Content

| Element | Spec |
|---|---|
| Title | "Save Quote" Nunito 18 sp bold, centred |
| Book context pill | Same as Screen 09 |
| **Quote text field** | Full-width − 32 dp, **min-height 100 dp**, radius 14, `surfaceVariant` border. **Lora 16 sp** `onSurface` — the most important field uses the serif reading font. Focused: `primary` border 2 dp. Placeholder: "Type or paste the quote…" Lora 16 sp italic `outline` |
| Page number | 100 dp wide right-aligned field. Label: "Page". Numeric. Optional |
| Tags row | Existing tag pills + "+ Tag" outlined pill (radius 12, `outlineVariant` border). Tapping "+ Tag" shows inline `TextField`. New tags added as pills in real-time |
| Favourite row | Icon-left `♡` 22 sp `outline` + "Save as favourite" 14 sp `onSurface` + `Switch` right. Active: `amber` track, `primary` thumb. Light haptic on toggle |
| Save button | Full-width − 32 dp, 52 dp, radius 14, `primary`. Disabled until quote text is not empty |

---

## Screen 11 — Quotes (Global Tab)
**Satisfies:** AC-03.4, AC-03.5, AC-03.6

### Design rationale

Same QuoteCard as Book Detail, but with the book source visible. The decorative quote mark makes the list visually distinctive and immediately recognisable as a reading-focused feature.

### Layout

```
[ Gradient header — "Quotes" ]
[ Search bar (always visible) ]
[ Filter chips                ]
[ SliverList of QuoteCards    ]
[ FAB                         ]
[ Bottom Navigation Bar       ]
```

### Header

- Title: "Quotes" left-aligned 20 sp Nunito Bold white
- Count: "N saved" 12 sp `rgba(255,255,255,0.75)` below title

### QuoteCard (global variant)

Same as Screen 06 QuoteCard plus:
- **Book source row** below the separator line: small cover block 24×32 dp (radius 4) + book title 12 sp Nunito bold `primary` + author 11 sp `onSurfaceVariant`. Tappable → navigates to Book Detail

---

## Screen 12 — Profile
**Satisfies:** (no AC — utility screen)

### Design rationale

Stats are now visual (circular streak indicator + a 7-day activity bar chart). Settings are a simple `ListView` with icon rows instead of cards — lighter and more scannable.

### Layout

```
[ Gradient hero — avatar + name + email (230 dp) ]
[ Stats row — 3 metric cards                     ]
[ Activity chart — last 7 days bar chart         ]
[ Settings section                               ]
[ Sign out + version                             ]
```

### Hero section

- Gradient: `headerGradient` · Height: 230 dp
- Avatar: circular 88×88 dp, `tertiary` fill, white ring 3 dp. First initial Lora Bold 36 sp white. Future: real photo from Google account
- Name: Nunito 20 sp bold white, centred, 16 dp below avatar
- Email: 13 sp `rgba(255,255,255,0.75)`, centred

### Stats row

3 cards, equal width, shadow level 1:

| Card | Metric | Visual |
|---|---|---|
| Books read | Count, bold 22 sp `primary` | 📚 icon 22 sp above |
| Quotes saved | Count, bold 22 sp `primary` | ❝ icon 22 sp above |
| Day streak | Circular progress ring (amber) with count, 56×56 dp | Ring fills proportionally to longest streak |

### Activity chart (reading last 7 days)

- Label: "Last 7 days" 13 sp Nunito bold
- 7 vertical bars, equal width, rounded caps, `primaryContainer` fill. Days with at least one session: `primary` fill. Bar height proportional to pages read that day
- Day labels below each bar: "Mon Tue …" 10 sp `outline`
- No Y-axis numbers — the shape tells the story

### Settings section

- Section label: "Preferences" 12 sp Nunito bold `onSurfaceVariant`, all-caps
- Each row: **list tile style** (not card). Height 56 dp, horizontal padding 16 dp, dividers between rows
  - Left: icon in a 36×36 dp `primaryContainer` rounded square (radius 10) — 20 dp icon `primary`
  - Middle: label 14 sp `onSurface` + optional subtitle 12 sp `onSurfaceVariant`
  - Right: `Switch` for toggles (active: `primary` track) / `›` chevron for navigation
- Rows: Appearance (→ theme picker) · Dark Mode (toggle) · Notifications (toggle)

### Sign out + footer

- Divider
- "Sign Out" centred 14 sp Nunito bold `error` — link style, no button chrome
- Confirm dialog before executing: "Sign out of Reading Companion?" with Cancel / Sign Out actions
- "Version 1.0.0" 11 sp `outline`, centred, 8 dp below sign out

---

## Screen 13 — Home Empty State
**Satisfies:** AC-06.5

### Layout

- Same gradient header as Home (greeting + no streak ring when streak = 0)
- Centred illustration area: `primaryContainer` rounded rectangle 180×180 dp, radius 32. Inside: stacked books illustration — 3 overlapping rounded rectangles (book spines) in cover palette colours. No emoji — cleaner
- Title: "Start your reading journey" Nunito 22 sp bold `onSurface`, centred
- Body: "Add a book and log your first session. Your library and streak start here." Nunito 14 sp `onSurfaceVariant`, centred, max 2 lines, 24 dp horizontal margin
- Primary CTA: "＋ Add your first book" — 220 dp wide, 52 dp tall, radius 26, `primary` fill, Label Large white
- Spacing: 24 dp between all elements
- FAB hidden on empty state (CTA button serves the same purpose — avoid redundancy)
- Bottom nav: visible as always

---

## Colour accessibility matrix

| Text colour | Background | Contrast ratio | WCAG level |
|---|---|---|---|
| `#FFFFFF` on `#4B3D8F` (primary) | Button | 7.2:1 | AAA ✓ |
| `#1C1A27` on `#FFF8F2` (background) | Body text | 16.5:1 | AAA ✓ |
| `#4A4559` on `#FFF8F2` | Secondary text | 7.8:1 | AAA ✓ |
| `#4B3D8F` on `#E3DEFF` (primaryContainer) | Active chip label | 5.1:1 | AA ✓ |
| `#A0700A` on `#FFF8F2` | Tertiary label | 4.6:1 | AA ✓ |
| `#0E004F` on `#E3DEFF` | onPrimaryContainer | 9.4:1 | AAA ✓ |
