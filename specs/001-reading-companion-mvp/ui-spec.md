# UI Specification
<!-- 001-reading-companion-mvp | 2026-05-25 -->

Screen-by-screen UI specification for the Reading Companion MVP.
Every screen is described in terms of layout, components, colours, typography, and behaviour.
Mockup references point to `ui-design/` at the project root.

Design system: **Material 3** · Theme: `ThemeData(useMaterial3: true)` · Seed: `Color(0xFF6750A4)`

---

## Global Design Tokens

### Colour roles (light theme)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#6750A4` | Buttons, active tabs, progress fill, FAB |
| `onPrimary` | `#FFFFFF` | Text/icons on primary |
| `primaryContainer` | `#EADDFF` | Chip backgrounds, inactive nav indicator |
| `onPrimaryContainer` | `#21005D` | Text on primaryContainer |
| `secondary` | `#625B71` | Tag pills, secondary text |
| `secondaryContainer` | `#E8DEF8` | Active filter chip background |
| `tertiary` | `#7D5260` | Quote accent bar, favorite heart |
| `tertiaryContainer` | `#FFD8E4` | Tertiary surface |
| `background` | `#FFFBFE` | Screen background |
| `surface` | `#FFFFFF` | Cards, bottom sheets, bottom nav |
| `surfaceVariant` | `#E7E0EC` | Input field backgrounds |
| `surfaceContainerHigh` | `#ECE6F0` | Elevated surface variant |
| `outline` | `#79747E` | Inactive borders, placeholder text |
| `outlineVariant` | `#CAC4D0` | Dividers, inactive chip borders |
| `error` | `#B3261E` | Validation errors, sign-out |
| `onSurface` | `#1C1B1F` | Primary body text |
| `onSurfaceVariant` | `#49454F` | Secondary body text, captions |

### Gradient header (shared across screens)
All top-level screens use a vertical gradient app bar:
- **Top:** `#6750A4` (primary)
- **Bottom:** `#8C6EBE` (primary lightened ~20%)
- **Height:** 100 dp (status bar 44 dp + app bar 56 dp)
- **Title and icons:** white (`#FFFFFF`)

### Typography scale (Material 3)
| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | 30 sp | Bold | Sign-in app name |
| Headline Large | 24 sp | Bold | Screen section headers |
| Title Large | 20 sp | Bold | App bar titles |
| Title Medium | 18 sp | Bold | Book titles, card headers |
| Body Large | 14 sp | Regular | Form values, quote text |
| Body Medium | 13 sp | Regular | Supporting text, captions |
| Label Large | 15 sp | Bold | Button labels |
| Label Medium | 12 sp | Regular | Field labels, tags |
| Label Small | 11 sp | Regular | Badges, metadata |

### Elevation & shadows
Cards use a soft 4-layer drop shadow:
- Offset: `x+2, y+2` per layer
- Blur: simulated via colour gradient `rgba(0,0,0,0.06–0.18)`
- Corner radius: `16 dp` (default card), `12 dp` (compact card), `24 dp` (bottom sheet)

### Spacing grid
All spacing follows an **8 dp grid**: 8, 16, 24, 32, 48.
Standard screen horizontal padding: **16 dp** on each side.

---

## Shared Components

### Bottom Navigation Bar
- Height: 72 dp
- Background: `surface`
- Top border: `outlineVariant` 1 dp
- 4 tabs: **Home · Library · Quotes · Profile**
- Active tab: pill indicator (64×32 dp, `primaryContainer`, radius 16), bold label in `primary`
- Inactive tab: label in `onSurfaceVariant`, no indicator
- Icons: 18 sp centred above label

### Top App Bar (gradient variant)
- Background: gradient `#6750A4 → #8C6EBE`
- Height: 56 dp (below 44 dp status bar)
- Title: 20 sp bold, white, centred
- Back arrow (when present): left-aligned, white, 22 sp
- Action icons (when present): right-aligned, white

### Cards
- Background: `surface`
- Corner radius: `16 dp`
- Shadow: soft 4-layer (see Elevation)
- Internal padding: 12 dp

### Chips (filter)
- Height: 32 dp · Radius: 16 dp
- Active: `secondaryContainer` fill, `primary` border 2 dp, bold label
- Inactive: `surface` fill, `outlineVariant` border 1 dp, regular label

### Tag pills (quote tags)
- Height: 24 dp · Radius: 12 dp
- Background: `secondaryContainer`
- Label: 11 sp, `secondary`

### Outlined text fields
- Height: 48 dp · Radius: 10 dp
- Background: `surfaceVariant`
- Idle border: `outlineVariant` 1 dp + floating label in `onSurfaceVariant`
- Focused border: `primary` 2 dp + floating label in `primary`
- Error border: `error` 2 dp + label and helper text in `error`

### FAB (Floating Action Button)
- Size: 56×56 dp · Radius: 16 dp
- Background: `primary`
- Icon: `+` 24 sp bold, white
- Position: bottom-right, 16 dp from edges, 80 dp above bottom nav

### Progress Bar
- Height: 8 dp (detail view: 14 dp) · Radius: 4 dp
- Track: `primaryContainer`
- Fill: `primary`

### Star Rating
- 5 stars · Size: 20 sp (compact) / 42 sp (detail)
- Filled: `#FAB400` (amber)
- Empty: `outlineVariant`

### Book Cover Block
- Gradient fill (unique per book from a set of 6 palettes)
- Corner radius: 12 dp
- Centred emoji icon at 32–38 sp in white

---

## Screen 01 — Sign-in
**Mockup:** `ui-design/01-sign-in.png`
**Satisfies:** AC-05.1

### Layout
- Full-screen vertical gradient: `#6750A4` (top) → `#9B77D0` (mid, 460 dp) → `#FFFBFE` (bottom)
- Decorative translucent white circles in background (opacity 8–12%)

### Sections
| Element | Spec |
|---|---|
| App logo card | 104×104 dp white card, radius 32, centred at y=192. Book emoji 52 sp inside |
| App name | "Reading" + "Companion" two-line, 30 sp bold, white, centred |
| Tagline | "Track books · Save quotes · Stay inspired", 13 sp, `rgba(255,255,255,0.75)` |
| Bottom card | White card 340×280 dp, radius 24, shadow, floating at y=430 |
| Card title | "Welcome back", 20 sp bold, `onSurface`, centred |
| Card subtitle | 13 sp `onSurfaceVariant`, centred |
| Google button | Full-width (310 dp), height 56, radius 28, white fill, `outlineVariant` border. Google "G" icon left. "Continue with Google" 15 sp bold |
| Legal copy | 11 sp `outline`, centred |
| Tagline below | "No password needed · One tap sign in", 12 sp `primary` |

### Behaviour
- Single tap on Google button triggers Supabase OAuth flow
- No other interactive elements on this screen

---

## Screen 02 — Home Dashboard
**Mockup:** `ui-design/02-home-dashboard.png`
**Satisfies:** AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.5, AC-07.1, AC-07.3, AC-07.4

### Layout
- Gradient header (100 dp) with greeting and streak badge
- `SliverList` of `HomeBookCard` widgets below
- FAB bottom-right

### Header
| Element | Spec |
|---|---|
| Greeting line | "Good morning 👋" 13 sp, `rgba(255,255,255,0.75)`, y=58 |
| User name | User's display name, 24 sp bold, white, y=78 |
| Streak badge | White pill (radius 19) top-right. "🔥 N days" 13 sp bold `primary` inside |

### HomeBookCard
- Size: full-width, height 150 dp · Radius: 20 dp · Shadow: 4-layer
- **Cover block:** 80×114 dp, radius 12, left side (gradient palette by index)
- **Title:** 16 sp bold, `onSurface`, right of cover
- **Author:** 12 sp `onSurfaceVariant`
- **Progress bar:** 130 dp wide, 14 dp below author
- **Progress label:** "N% · p. X/Y", 11 sp `onSurfaceVariant`
- **"Log session" button:** 96 dp wide, 32 dp tall, radius 10, `primary` fill, white bold 12 sp
- **"Add quote" button:** 126 dp wide, 32 dp tall, radius 10, `primaryContainer` fill, `onPrimaryContainer` bold 12 sp

### Empty state (AC-06.5)
- Centred illustration: `primaryContainer` rounded square (160×160, radius 24) with 📚 emoji 64 sp
- Title: "No books in progress" 20 sp bold
- Body: 2-line description 14 sp `onSurfaceVariant`
- Primary CTA button: "＋  Start reading a book", full-width (220 dp), radius 24, `primary`
- Secondary CTA: "Browse suggestions", 160 dp, radius 20, `primaryContainer`

---

## Screen 03 — Library Grid
**Mockup:** `ui-design/03-library-grid.png`
**Satisfies:** AC-01.5, AC-04.4

### Layout
- Gradient header. Title: "My Library". Action: grid/list toggle icon (right)
- Filter chips row (horizontal scroll): All · Reading · Finished · Want
- `SliverGrid` 2-column below chips
- FAB: opens Add Book form

### BookGridCard
- Size: (screen_width − 48) / 2 wide × 188 dp tall · Radius: 16 dp
- **Cover block:** full width − 16 dp padding, 108 dp tall, radius 10
- **Title:** 13 sp bold, max 16 chars (truncate with …)
- **Author:** 11 sp `onSurfaceVariant`
- **Status:** 10 sp coloured label — `green` for Reading, `primary` for Finished, `outline` for Want
- **Stars:** 11 sp amber or "—" for unrated

---

## Screen 04 — Library List
**Mockup:** `ui-design/04-library-list.png`
**Satisfies:** AC-01.5, AC-04.4

### Layout
- Same gradient header and filter chips as grid view
- `SliverList` of `BookListTile` below
- Toggle icon in header switches between grid and list

### BookListTile
- Height: 80 dp · Radius: 14 dp · Shadow: 4-layer
- **Cover block:** 52×60 dp, radius 8, left side
- **Title:** 14 sp bold
- **Author:** 12 sp `onSurfaceVariant`
- **Status:** 11 sp coloured (same colour rules as grid)
- **Stars:** 14 sp amber, right-aligned
- **Progress bar:** 4 dp tall, only shown when 0 < progress < 100%

---

## Screen 05 — Book Detail · Progress Tab
**Mockup:** `ui-design/05-book-detail-progress.png`
**Satisfies:** AC-02.1, AC-02.2, AC-02.3, AC-02.6

### Layout
- **SliverAppBar:** 250 dp tall gradient hero with book cover emoji centred. Back arrow and overflow menu (⋮) in white
- **Info strip:** 70 dp white section below hero: title 19 sp bold, author + pages 12 sp, 5-star row
- **Tab bar:** 3 tabs — Progress · Quotes · Ranking. Active tab: bold `primary` label + 3 dp `primary` underline
- **Content area** below tabs

### Progress section
| Element | Spec |
|---|---|
| Percentage | 36 sp bold `primary`, centred |
| Sub-label | "of [Book title] complete", 12 sp `onSurfaceVariant` |
| Progress bar | Full-width − 48 dp, 14 dp tall |
| Page count | "N pages read · N remaining", 12 sp `onSurfaceVariant` |
| Log button | Full-width − 48 dp, 48 dp tall, radius 14, `primary`, "📝  Log Reading Session" 14 sp bold white |

### Session History
- Section header: "Session History" 14 sp bold
- Each session: card (full-width, 54 dp, radius 12) with date (13 sp bold), pages (12 sp `onSurfaceVariant`), duration right-aligned in `primary`
- Sessions ordered newest-first

---

## Screen 06 — Book Detail · Quotes Tab
**Mockup:** `ui-design/06-book-detail-quotes.png`
**Satisfies:** AC-03.1, AC-03.2, AC-03.3, AC-03.5, AC-03.6

### Layout
- Same SliverAppBar + info strip + tab bar as Screen 05
- Search bar below tabs: full-width − 32 dp, height 40, radius 20, `surfaceContainerHigh` fill

### QuoteCard
- Variable height card · Radius: 16 dp · Shadow: 4-layer
- Left accent bar: 6 dp wide, radius 3, `primary` fill (full card height)
- Quote text: 13 sp `onSurface`, left-padded 14 dp
- Tag pills: row below text
- Page number: 11 sp `onSurfaceVariant`, top-right
- Favorite heart: 18 sp, `tertiary` when active, `outlineVariant` when inactive; bottom-right

### FAB
Positioned above bottom nav. Tapping opens Add Quote sheet pre-filled with this book.

---

## Screen 07 — Book Detail · Ranking Tab
**Mockup:** `ui-design/07-book-detail-ranking.png`
**Satisfies:** AC-04.1, AC-04.2, AC-04.3, AC-04.5

### Layout
- Same SliverAppBar + info strip + tab bar as Screen 05

### Rating section
| Element | Spec |
|---|---|
| Prompt | "How would you rate this book?", 14 sp `onSurfaceVariant`, centred |
| Stars row | 5 stars × 42 sp, centred, horizontally spaced 8 dp. Tap to select |
| Sub-label | "N out of 5 · [descriptor]", 13 sp `onSurfaceVariant` |

Descriptors by star count: 1=Poor, 2=Fair, 3=Good, 4=Excellent, 5=Outstanding

### Review section
- Label: "Your review" 13 sp bold
- Multi-line text field: full-width − 32 dp, min-height 120 dp, radius 14, `surfaceContainerHigh`, `outlineVariant` border

### Save button
Full-width − 32 dp, 48 dp tall, radius 14, `primary`.

---

## Screen 08 — Add / Edit Book
**Mockup:** `ui-design/08-add-edit-book.png`
**Satisfies:** AC-01.1, AC-01.2, AC-01.3, AC-01.4

### Layout
- Gradient header. Back arrow (←) left. "Save" text right (disabled until all required fields filled)
- Form fields stack vertically, 72 dp apart (field + label)

### Form fields
| Field | Required | Keyboard | Validation |
|---|---|---|---|
| Title | Yes | Text | Not empty |
| Author | Yes | Text | Not empty |
| Total Pages | Yes | Number | Integer > 0 |
| Status | Yes | — | Chip selector |
| Cover Image | No | — | Gallery picker |

- Required fields show inline error below the field on failed submit
- Focused field: `primary` border 2 dp, floating label in `primary`
- Error field: `error` border 2 dp, error message in `error` 11 sp

### Status chip selector
3 chips in a row: "Want to Read" · "Reading" · "Finished". Single selection required.

### Cover image picker
- Tappable card (full-width − 32 dp, height 140 dp, radius 16)
- Empty state: gradient purple placeholder + 📷 emoji + "Tap to upload a cover image" + "JPG · PNG · max 5 MB"
- Filled state: shows selected image thumbnail (300×300 dp crop preview)

---

## Screen 09 — Log Session (Bottom Sheet)
**Mockup:** `ui-design/09-log-session-sheet.png`
**Satisfies:** AC-02.1, AC-02.2, AC-02.4, AC-02.5

### Sheet
- Background: modal scrim `rgba(0,0,0,0.5)` over dimmed screen content
- Sheet: white, radius 24 top corners, drag handle centred at top (40×4 dp, `outlineVariant`)
- Sheet height: ~540 dp

### Content
| Element | Spec |
|---|---|
| Title | "Log Reading Session" 18 sp bold, centred |
| Book pill | `primaryContainer` pill (128 dp, radius 12) with book name 13 sp bold `onPrimaryContainer`, centred |
| From/To page fields | Side-by-side, each half width − 24 dp. Outlined fields. Numeric keyboard |
| Duration field | Full-width. "Duration (minutes)". Numeric keyboard |
| Date & time field | Full-width. Defaults to current date/time. Tappable (opens DateTimePicker) |
| Notes field | Full-width, height 60 dp, optional. `surfaceVariant` fill |
| Save button | Full-width − 32 dp, 48 dp, radius 14, `primary` |

### Validation
- `pagesTo ≤ book.totalPages` — shown as inline error on pagesTo field
- `pagesTo > pagesFrom` — shown as inline error on pagesTo field
- Save button disabled until pagesFrom, pagesTo, and duration are filled

---

## Screen 10 — Add Quote (Bottom Sheet)
**Mockup:** `ui-design/10-add-quote-sheet.png`
**Satisfies:** AC-03.1, AC-03.2, AC-03.3, AC-03.5

### Sheet
Same modal scrim and drag handle as Screen 09. Height: ~620 dp.

### Content
| Element | Spec |
|---|---|
| Title | "Save Quote" 18 sp bold, centred |
| Book pill | Same style as session sheet |
| Quote text field | Full-width, min-height 88 dp (multi-line), outlined, `primary` border when focused |
| Page number field | 120 dp wide, optional, numeric |
| Tags section | Row of existing tag pills + "+ Add tag" outlined pill. Tapping "+ Add tag" opens inline text input |
| Favorite toggle | Row with "Mark as Favorite" label left, `Switch` widget right. Active: `primary` fill |
| Save button | Full-width − 32 dp, 48 dp, radius 14, `primary` |

### Validation
- Quote text must not be empty — inline error on attempted save

---

## Screen 11 — Quotes (Global Tab)
**Mockup:** `ui-design/11-quotes-global.png`
**Satisfies:** AC-03.4, AC-03.5, AC-03.6

### Layout
- Gradient header. Title: "Quotes"
- Search bar below header: full-width − 32 dp, height 42, radius 20, `surfaceContainerHigh`
- Filter chips row: All · Favorites · [tag chips from user's tags]
- `SliverList` of QuoteCards below

### QuoteCard (global variant)
Same as Screen 06 QuoteCard but includes:
- Book title: 11 sp bold `tertiary` below quote text (links to that book)
- Accent bar colour: `tertiary` (not `primary`)

---

## Screen 12 — Profile
**Mockup:** `ui-design/12-profile.png`

### Layout
- Gradient header (230 dp) with avatar and name overlapping the transition
- White content area below

### Header
| Element | Spec |
|---|---|
| Avatar ring | White ring (3 dp) around circular avatar (radius 44). `tertiary` fill. Initial letter 32 sp bold white |
| User name | 18 sp bold white, centred |
| Email | 12 sp `rgba(255,255,255,0.75)`, centred |

### Stats row
3 equal-width cards side by side:
- Each card: emoji (20 sp) + count (20 sp bold `primary`) + label (10 sp `onSurfaceVariant`)
- Books read · Quotes saved · Day streak

### Settings section
- Section label: "Settings" 12 sp bold `onSurfaceVariant`
- Each setting row: card (full-width, 56 dp, radius 14)
  - Left: icon in `primaryContainer` square (32×32, radius 10)
  - Right: `Switch` for toggles, `›` for navigation rows

### Sign out
- Centred link-style text: "Sign Out" 14 sp bold `error`
- App version footer: 11 sp `outline`

---

## Screen 13 — Home Empty State
**Mockup:** `ui-design/13-home-empty-state.png`
**Satisfies:** AC-06.5

### Layout
- Gradient header with greeting
- Centred illustration: `primaryContainer` rounded square (160×160, radius 24) with 📚 64 sp
- Title: "No books in progress" 20 sp bold, centred
- Body: 2-line explanation 14 sp `onSurfaceVariant`, centred
- Primary CTA: "＋  Start reading a book", 220 dp wide, 48 dp tall, radius 24, `primary`
- Secondary CTA: "Browse suggestions", 160 dp, radius 20, `primaryContainer`
- FAB visible (same as home dashboard)
