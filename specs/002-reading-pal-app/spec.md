# Feature Specification: Reading Pal

**Feature Branch**: `002-reading-pal-app`

**Created**: 2026-05-26

**Status**: Draft

## User Scenarios & Testing

### User Story 8 - App Version Display (Priority: P1)

A user wants to see which version of the app is running so they know whether their phone has
received the latest updates after a deployment.

**Acceptance Scenarios**:

1. **Given** the app is open on any screen, **When** the user looks at the bottom of the
   page, **Then** the current version number (e.g. `v0.2.0`) is visible in a subtle footer.
2. **Given** a new version is deployed, **When** the user opens the updated app, **Then**
   the footer reflects the new version number.

---

### User Story 9 - Author Name Autocomplete (Priority: P2)

A reader wants the Author field to suggest real author names as they type, so they don't
have to remember exact spellings or full names.

**Acceptance Scenarios**:

1. **Given** the user types at least 2 characters in the Author field, **When** Open Library
   returns matches, **Then** a dropdown of author name suggestions appears.
2. **Given** suggestions appear, **When** the user clicks one, **Then** the full author name
   fills the field.
3. **Given** the user types a name not in the suggestions, **When** they continue typing,
   **Then** the field accepts any free-text input with no errors.
4. **Given** the network is unavailable, **When** the user types in the Author field, **Then**
   no suggestions appear and the field continues to work normally.

---

### User Story 7 - Search and Set a Book Cover Online (Priority: P2)

A reader wants to search for a book's cover image by title and author directly inside the
app, pick one from the results, and have it displayed throughout the app — without uploading
a file manually.

**Why this priority**: Finding covers manually and uploading files is friction. Searching
online is faster and produces better results. The cover URL is stored in the database; the
image is loaded from the network when displayed.

**Independent Test**: Open Add Book. Enter a title and author. Click "Search cover online".
Confirm a grid of covers appears. Select one. Confirm the preview updates in the form.
Save the book. Confirm the cover is shown on the BookCard and BookDetailPage header.

**Acceptance Scenarios**:

1. **Given** the user is on the Add or Edit Book form, **When** they click "Search cover
   online", **Then** the app searches Open Library using the current title and author values
   and displays matching covers as a thumbnail grid.
2. **Given** covers are returned, **When** the user clicks a thumbnail, **Then** the dialog
   closes and a preview of the selected cover appears in the form.
3. **Given** no covers are found for the search terms, **When** results load, **Then** a
   "No covers found" message is shown.
4. **Given** a cover has been selected from search, **When** the user saves the book, **Then**
   the cover URL is stored in the database and the cover is shown on the BookCard and
   BookDetailPage.
5. **Given** a book has an existing cover (uploaded or from a previous search), **When** the
   user searches and selects a new cover, **Then** the new selection replaces the previous one.

---

### User Story 6 - Delete a Book (Priority: P1)

A reader wants to permanently remove a book from their library, along with all its associated
sessions, quotes, and rating, when they no longer want to track it.

**Why this priority**: Deleting is a basic library management operation. Without it, mistakes
(wrong title, duplicate entry) are irreversible.

**Independent Test**: Add a book with at least one session and one quote. Delete it from the
book detail page. Confirm it no longer appears in the library. Confirm its sessions and quotes
are also gone (verify via export snapshot — they must not be present in the JSON).

**Acceptance Scenarios**:

1. **Given** a book exists, **When** the user triggers delete from the book detail page,
   **Then** a confirmation dialog appears warning that all sessions, quotes, and ratings for
   that book will also be permanently deleted.
2. **Given** the confirmation dialog is open, **When** the user confirms, **Then** the book
   and all its associated data are deleted and the user is navigated back to the library.
3. **Given** the confirmation dialog is open, **When** the user cancels, **Then** no data is
   changed and the dialog closes.
4. **Given** a book is deleted, **When** the user views the library, **Then** the deleted book
   no longer appears under any filter.

---

### User Story 1 - Build and Browse a Book Library (Priority: P1)

A reader wants to keep track of all the books they own, are reading, or plan to read. They
can add books with a title, author, optional cover image, and a reading status. Their full
library is visible at a glance in a filterable, sortable grid.

**Why this priority**: The library is the foundation of the app — every other feature
(sessions, quotes, ratings) depends on books existing. Without it, no other story is
testable.

**Independent Test**: Add three books with different statuses. Verify all three appear in the
library grid. Filter by each status and confirm only matching books show. Sort by title and
confirm alphabetical order.

**Acceptance Scenarios**:

1. **Given** the library is empty, **When** the user opens the app, **Then** an empty state
   with a clear call-to-action to add a first book is shown.
2. **Given** the library has books, **When** the user opens the app, **Then** all books are
   displayed as cover cards with title, author, and status visible.
3. **Given** books with mixed statuses exist, **When** the user selects a filter chip (All /
   Reading / Want to Read / Finished), **Then** only books matching that status are shown.
4. **Given** books exist, **When** the user changes the sort order (Recent / Title A–Z /
   Author A–Z), **Then** the grid reorders accordingly.
5. **Given** the user fills in title, author, and status, **When** they submit the Add Book
   form, **Then** the new book appears in the library immediately.
6. **Given** a book exists, **When** the user edits it and saves, **Then** the updated
   details are reflected everywhere the book appears.

---

### User Story 2 - Log Reading Sessions and Track Progress (Priority: P2)

A reader wants to record each reading session — how long they read, how much progress they
made, and any notes — so they can see their reading history and watch their progress grow
toward 100%.

**Why this priority**: Progress tracking is the primary engagement loop. It gives the app
daily utility beyond a static list.

**Independent Test**: Open a book. Log two sessions with different durations and progress
values. Verify the book's progress bar reflects the cumulative total. Log a session that
brings progress to 100% and confirm the book status changes to Finished automatically.

**Acceptance Scenarios**:

1. **Given** a book is open, **When** the user logs a session with a duration and progress
   amount, **Then** the session appears in the Sessions tab and the book's overall progress
   updates.
2. **Given** a book's progress reaches 100%, **When** a session is saved, **Then** the book
   status is automatically set to Finished.
3. **Given** sessions exist for a book, **When** the user views the Sessions tab, **Then**
   sessions are shown in chronological order with date, duration, progress added, and notes.
4. **Given** no sessions have been logged, **When** the user views the Sessions tab, **Then**
   an empty state with a prompt to log the first session is shown.

---

### User Story 3 - Save and Search Quotes (Priority: P3)

A reader wants to capture memorable passages from books, tag them for later retrieval, mark
favorites, and search across them quickly.

**Why this priority**: Quote capture adds depth to the app but is not required for core
reading tracking. It can be delivered and tested after stories 1 and 2.

**Independent Test**: Open a book. Add three quotes with different tags and mark one as a
favorite. Filter by favorite and confirm only that quote appears. Search by a word from the
quote text and confirm the correct result appears.

**Acceptance Scenarios**:

1. **Given** a book is open, **When** the user adds a quote with text, optional page number,
   tags, and a favorite toggle, **Then** the quote appears in the Quotes tab immediately.
2. **Given** quotes exist, **When** the user filters by favorite, **Then** only favorited
   quotes are shown.
3. **Given** quotes exist, **When** the user types in the search bar, **Then** only quotes
   whose text contains the search term (case-insensitive) are shown.
4. **Given** quotes exist, **When** the user filters by a tag, **Then** only quotes with
   that tag are shown.
5. **Given** no quotes have been saved, **When** the user views the Quotes tab, **Then** an
   empty state with a prompt to add the first quote is shown.

---

### User Story 4 - Rate Books and View a Ranking (Priority: P3)

A reader wants to give each finished book a star rating and optional review, then see all
their rated books ranked to reflect their personal reading preferences.

**Why this priority**: Ratings and ranking are a reflection feature — useful after a reader
has finished books, but not required for day-to-day tracking.

**Independent Test**: Rate two books with different star values. Open the Ranking screen and
confirm both appear sorted by stars descending. Unrated books must not appear in the ranking.

**Acceptance Scenarios**:

1. **Given** a book is open, **When** the user selects a star rating and optionally writes a
   review, **Then** the rating is saved and shown on the Rating tab.
2. **Given** rated books exist, **When** the user opens the Ranking screen, **Then** books
   are listed sorted by star rating highest to lowest.
3. **Given** a mix of rated and unrated books exist, **When** the Ranking screen loads,
   **Then** only rated books appear.
4. **Given** no books have been rated, **When** the Ranking screen loads, **Then** an empty
   state with guidance to rate some books is shown.

---

### User Story 5 - Export and Import a Data Snapshot (Priority: P2)

A reader wants to back up their entire library, sessions, quotes, and ratings to a file, and
restore it on another device or after a browser reset — without losing any data.

**Why this priority**: Data portability is a trust feature. Because the app stores everything
locally, users need a safety net. This should be available early.

**Independent Test**: Add books, sessions, and quotes. Export a snapshot. Clear all data.
Import the snapshot. Verify all books, sessions, and quotes are restored exactly.

**Acceptance Scenarios**:

1. **Given** the user opens Settings, **When** they trigger an export, **Then** a JSON file
   containing all their data is downloaded to their device.
2. **Given** the user has a previously exported file, **When** they import it and confirm the
   overwrite warning, **Then** all data is restored and the library reflects the imported
   state.
3. **Given** the user triggers an import, **When** the confirmation prompt appears, **Then**
   a clear warning states that all current data will be replaced.
4. **Given** the user cancels the import confirmation, **When** the dialog closes, **Then**
   no data is changed.

---

### Edge Cases

- What happens when a user adds a second session that would push progress past 100%? Progress
  is capped at 100 and the book is marked Finished.
- What happens when the user imports a snapshot file that is malformed or not a valid export?
  An error message is shown and no data is changed.
- What happens when a book has no cover image? A placeholder graphic is shown in its place.
- What happens when the user tries to add a book with no title or author? The form prevents
  submission and highlights the missing required fields.
- What happens when the quotes search returns no results? A "no results" state is shown
  distinct from the empty-library state.

---

## UI Design

> Reference designs: `misc/ui-design/` (screen1_home.png, screen2_add.png, screen3_stats.png, screen4_detail.png)

### Design Language

- **Theme**: Light warm — cream background (`#FFF8F2`), white paper surfaces (`#FFFFFF`).
- **Accent color**: Terracotta-orange (`#E07940`) for primary CTAs, active states, FAB, and progress bars. Soft peach (`#F4A261`) for secondary elements.
- **Typography**: Clean sans-serif; large bold numbers for stats; uppercase small labels for form field captions. Primary text `#2D1600`, secondary text `#7B5E3E`.
- **Icons**: Material Icons (Google Fonts) throughout — `home`, `menu_book`, `bar_chart`, `person`, `add`, `check_circle`, `edit`, `share`, `arrow_back`, `more_vert`, `trending_up`, `photo_alt`.
- **Cards**: Rounded corners (12 px radius), warm shadow `rgba(120,60,0,0.08)`; bottom nav uses white background with top border `#F0E0D0`.

### Navigation Structure

Five-tab bottom navigation bar, always visible:

| Tab | Icon | Label |
|-----|------|-------|
| 1 | `home` | Home |
| 2 | `menu_book` | Library |
| 3 | `add` (FAB) | — |
| 4 | `bar_chart` | Stats |
| 5 | `person` | Profile |

The center tab is a raised FAB (terracotta circle with white `add` icon) that opens the Add Book screen. App version is displayed in a small caption above the nav bar.

### Screen 1 — Home

- **Header**: Personalized time-of-day greeting ("Good morning/afternoon/evening 👋") derived from local time.
- **Stats row**: Three mini-cards side by side — Read (finished count), In Progress (reading count), Pending (want-to-read count).
- **"Currently Reading" section**: Full-width card for the active book showing cover thumbnail, `● ACTIVE` badge, title, author, "Page X of Y", and a terracotta progress bar with percentage. When no active book, a "Start reading →" CTA links to the Library.
- **"Completed" section**: Horizontal scrollable row of finished book cover cards with title and star rating below each. "See all →" link navigates to the Library filtered to Finished books. Section is hidden when no books are finished.

### Screen 2 — Add / Edit Book

- **Header**: Back arrow (`arrow_back`) + screen title.
- **Cover area**: Centered dashed-border rectangle with `photo_alt` icon and "Add cover" label; tapping opens camera/file picker. Buttons row: Upload · Camera · Search online · Remove.
- **Form fields** (in order):
  1. BOOK TITLE — full-width text input.
  2. AUTHOR + YEAR — two-column row (text + 4-digit numeric).
  3. STATUS — single-select toggle chips: `📖 Reading` / `✅ Read` / `⏳ Pending`.
  4. TOTAL PAGES + CURRENT PAGE — two-column numeric row.
  5. GENRE — multi-select chips: Fantasy · Adventure · Science Fiction · Romance · Thriller.
- **Save button**: Full-width terracotta button "check_circle Save Book" pinned to the bottom.

### Screen 3 — Stats

- **Header**: "Statistics" title + "Your reading progress" subtitle.
- **Year filter**: Row of pill chips — current year (selected/filled), prior years, and "All".
- **Books read card**: Large bold count + "Books read · Annual goal: 50" sub-label + `trending_up` badge with YoY change percentage.
- **Books per month chart**: Monthly bar chart (Jan–Dec, terracotta bars); average per month shown top-right.
- **Side-by-side summary row**:
  - Left: Genre donut chart with legend (genre name + percentage, up to 4 entries).
  - Right (stacked): PAGES READ large number + time scope label; BEST MONTH name + book count.

### Screen 4 — Book Detail

- **Header**: Back arrow + delete icon (top-right) + edit icon.
- **Cover hero**: Book cover image, full-width.
- **Metadata**: Genre badge chip, title (large bold), "Author · Year" subtitle, star display with numeric value.
- **Progress section**: Terracotta LinearProgress bar + "Page X of Y" text.
- **Reading pace stats 2×2 grid** (shown when sessions exist):
  - 📅 Started reading — date of first session
  - ⏱ Days reading — count of unique reading days
  - 🔥 Avg pace — pages per day
  - 🎯 To finish — estimated days remaining
- **Tabs**: Progress · Sessions · Quotes · Rating

### Design Decisions

- Progress is tracked **by page** (current page + total pages), displayed as both "Page X of Y" and a derived percentage. This supersedes the earlier assumption that progress is percentage-only.
- Genre is a **multi-select chip field** (predefined values: Fantasy, Adventure, Science Fiction, Romance, Thriller).
- **Year** is a metadata field on the book alongside title, author, status, and cover.
- The **Home screen** is the app's default landing screen (`/`) and is distinct from the Library screen (`/library`).
- All UI text is in **English**. The warm light theme (cream + terracotta) replaced the originally planned dark theme during implementation.

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be able to add a book with a title, author, reading status, and
  optional cover image.
- **FR-002**: Users MUST be able to edit any book's details after it has been added.
- **FR-003**: Users MUST be able to view all books in a filterable, sortable grid.
- **FR-004**: Users MUST be able to filter books by reading status (All, Reading, Want to
  Read, Finished).
- **FR-005**: Users MUST be able to sort books by most recent, title, or author.
- **FR-006**: Users MUST be able to log a reading session for a book, recording date,
  duration in minutes, progress added, and optional notes.
- **FR-007**: The system MUST update a book's cumulative progress when a session is saved,
  capping progress at 100%.
- **FR-008**: The system MUST automatically set a book's status to Finished when its progress
  reaches 100%.
- **FR-009**: Users MUST be able to view all sessions for a book in chronological order.
- **FR-010**: Users MUST be able to add a quote to a book, including text, optional page
  number, tags, and a favorite flag.
- **FR-011**: Users MUST be able to filter quotes by favorite status and by tag.
- **FR-012**: Users MUST be able to search quotes by text content (case-insensitive).
- **FR-013**: Users MUST be able to rate a book from 1 to 5 stars and optionally write a
  review.
- **FR-014**: Users MUST be able to view all rated books ranked by star rating on a dedicated
  Ranking screen.
- **FR-015**: Users MUST be able to export all their data as a single downloadable file.
- **FR-016**: Users MUST be able to import a previously exported file to restore all data,
  after confirming an overwrite warning.
- **FR-017**: All data MUST persist automatically across browser sessions without any manual
  save action.
- **FR-018**: The app MUST function fully without an internet connection.
- **FR-019**: Empty states with contextual prompts MUST be shown wherever a list has no
  items.
- **FR-020**: Cover image uploads MUST be validated client-side and rejected if they exceed
  1 MB.
- **FR-021**: Users MUST be able to search for a book cover by title and author via Open
  Library directly inside the Add/Edit Book form.
- **FR-022**: Search results MUST be displayed as a grid of cover thumbnails inside a dialog.
- **FR-023**: Selecting a cover from search results MUST store the image URL in the database
  and show a preview in the form.
- **FR-024**: Cover URLs and base64 covers from file upload MUST both display correctly
  throughout the app (BookCard, BookDetailPage header) — no display code change required as
  `<img src>` handles both.
- **FR-025**: Users MUST be able to permanently delete a book from the book detail page.
- **FR-026**: Deleting a book MUST cascade — all associated sessions, quotes, and ratings are
  deleted in the same operation.
- **FR-027**: The system MUST show a confirmation dialog before executing a delete, clearly
  warning that all associated data will also be removed.
- **FR-028**: The Home screen MUST show a personalized time-of-day greeting, a stats summary
  row (finished / reading / want-to-read counts), a "Currently Reading" card for the active
  book, and a horizontal "Completed" scroll row with a "See all" link.
- **FR-029**: Books MUST support a multi-select Genre field. Predefined values: Fantasy,
  Adventure, Science Fiction, Romance, Thriller.
- **FR-030**: Books MUST store a total-page count and a current-page number. Progress
  percentage is derived from these two values (currentPage / totalPages × 100).
- **FR-031**: The Book Detail screen MUST display derived reading-pace stats: start date,
  total days reading, average pages per day, and estimated days to finish.
- **FR-032**: The Stats screen MUST support a year filter (individual years + "All") and
  display: total books read vs. annual goal, monthly bar chart, genre donut chart,
  total pages read, and best reading month.
- **FR-033**: The Settings screen MUST provide an "Import from Goodreads" option that accepts
  a Goodreads library CSV export file (downloaded from goodreads.com → My Books → Import and
  Export → Export Library) and imports the user's read, currently-reading, and to-read shelves.
- **FR-034**: The import dialog MUST display step-by-step instructions guiding the user to
  export their library CSV from Goodreads before choosing the file.
- **FR-035**: Before importing, the app MUST display a preview summary showing total books
  found by status and how many are already in the library (will be skipped).
- **FR-036**: The import MUST be additive only — books matched by title + author (case-insensitive)
  MUST be skipped; no existing data is overwritten.
- **FR-037**: For books imported from the "read" shelf that carry a Goodreads star rating (1–5),
  the system MUST also create a corresponding Rating record.

### Key Entities

- **Book**: Represents a book in the user's library. Has a title, author, publication year,
  reading status, optional cover image, total-page count, current-page number, and one or
  more genres. Progress percentage is derived (currentPage / totalPages × 100).
- **Reading Session**: A single reading event linked to a book. Records the date, duration,
  progress added during that session, and optional notes.
- **Quote**: A saved passage linked to a book. Has text content, an optional page number,
  one or more tags, and a favorite flag.
- **Rating**: A user's assessment of a book. Stores a star value (1–5) and an optional
  written review. One rating per book.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can add a new book and have it appear in the library in under 30 seconds
  from opening the Add Book form.
- **SC-002**: A user can log a reading session and see their updated progress in under 20
  seconds.
- **SC-003**: The library grid displays up to 200 books without visible lag or stuttering
  during filtering and sorting.
- **SC-004**: A quote search returns results within 1 second across a library of 1,000
  quotes.
- **SC-005**: A full data export completes in under 5 seconds for a library of 200 books
  with associated sessions, quotes, and ratings.
- **SC-006**: A full data import and restore completes in under 10 seconds.
- **SC-007**: All core tasks (add book, log session, save quote, rate book) are completable
  using keyboard navigation alone.
- **SC-008**: The app is fully usable on screens as small as 360 px wide without horizontal
  scrolling or overlapping elements.

---

## Assumptions

- The app is used by a single person on a single browser — no multi-user or multi-device
  sync is required.
- The browser's local storage is not cleared between sessions (normal browser behavior).
- Cover images can be uploaded from the device or searched via the Open Library API by
  title and author (FR-021–FR-024). Covers fetched online are stored as URLs; uploaded
  covers are stored as base64 data URIs. Both render identically via `<img src>`.
- Reading progress is tracked by current page and total pages; the percentage is derived
  and displayed alongside the raw page fraction ("Pág X de Y").
- A book can only have one rating; updating the rating replaces the previous one.
- The snapshot export/import is the only mechanism for moving data between browsers or
  devices.
- Internet connectivity is never assumed or required.

---

---

### User Story 13 — Goodreads Library Import (Priority: P2)

A reader who already uses Goodreads wants to seed their Reading Pal library with all their
existing books without re-entering them one by one — by simply pasting their public Goodreads
profile URL.

**Why this feature**: Manual entry of a large existing library is a significant barrier to
adoption. A one-click import removes that friction and makes the app immediately useful for
readers who have curated their Goodreads shelves over years.

**Technology**: Goodreads CSV export (goodreads.com → My Books → Import and Export →
Export Library). All parsing happens entirely in the browser — no proxy or external service
required. The CSV is parsed client-side using a custom RFC-4180-compliant parser that handles
Goodreads' `="ISBN"` quoting convention.

**Acceptance Scenarios**:

1. **Given** the user opens Settings, **When** they tap "Import from Goodreads", **Then** a
   dialog opens showing step-by-step instructions to export the CSV and a "Choose CSV File"
   button.
2. **Given** the user picks a valid Goodreads CSV export file, **When** the file is parsed,
   **Then** a preview summary shows total books found broken down by status (read / currently
   reading / to-read) and the number of books already in the library (which will be skipped).
3. **Given** the preview is shown, **When** the user taps "Import", **Then** all new books
   are added to the library with correct statuses, page counts, publication years, and ratings
   (for read books with a Goodreads star rating ≥ 1).
4. **Given** a book in the CSV already exists in the library (same title and author,
   case-insensitive), **When** the import runs, **Then** that book is silently skipped and
   existing data is not overwritten.
5. **Given** the CSV file is empty or has no recognised header row, **When** parsing
   completes, **Then** a clear error message is shown and no data is changed.
6. **Given** the preview is shown, **When** the user taps "Cancel", **Then** the dialog
   closes with no data changed.

**Independent Test**: Export library CSV from goodreads.com → choose the file → confirm
preview shows correct counts → tap "Import" → confirm books appear in the library with correct
statuses → re-run import → confirm "X books already in library" and 0 new books.

---

## Advanced Features

These features are planned for a future phase once the core app is stable and deployed.
They extend the reading module with AI capabilities powered by Google Gemini Flash.

---

### User Story 10 — AI Book Cover Scan (Priority: P2)

A reader wants to point their phone camera at a book's front cover and have the app
automatically fill in the title and author fields — no typing required.

**Why this feature**: Manual entry is error-prone for long titles and unfamiliar author
names. A photo scan eliminates friction and reduces mistakes, especially for books borrowed
from a library or discovered in a bookshop.

**Technology**: Google Gemini Flash 1.5 (free tier: 1,500 requests/day, 15 req/min).
The model receives the cover image as base64 and a structured prompt; it returns the
title and author as plain text which the app parses and injects into the form fields.

**API**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={VITE_GEMINI_API_KEY}`

**Prompt**:
```
Look at this book cover image. Extract the book title and the author name.
Reply in this exact format:
Title: <title>
Author: <author>
If you cannot find a value, write "Unknown" for that field.
```

**Architecture — Simple (personal app)**:
- API key stored as `VITE_GEMINI_API_KEY` in Vercel environment variables
- Call made directly from the browser (key is in the JS bundle but the app is personal)
- Acceptable risk for a single-user personal PWA

**Architecture — Safe (if app goes public)**:
- Add a Vercel serverless function at `/api/scan-cover`
- Function receives base64 image, calls Gemini, returns title + author
- API key never leaves the server — not visible in the browser bundle

**Acceptance Scenarios**:

1. **Given** the user is on the Add or Edit Book form, **When** they tap "Scan cover",
   **Then** the camera opens pointing at the back environment (back camera on mobile).
2. **Given** a photo is taken, **When** Gemini processes it, **Then** a loading indicator
   is shown while waiting for the response (max ~3 seconds).
3. **Given** Gemini returns a title and author, **When** the response is parsed, **Then**
   the Title and Author fields are filled automatically.
4. **Given** the fields are already filled, **When** a scan returns new values, **Then**
   a confirmation prompt asks the user before overwriting existing data.
5. **Given** the image is unreadable (blurry, not a book cover), **When** Gemini cannot
   extract the data, **Then** a friendly error is shown and the fields are left unchanged.
6. **Given** the API key is missing or the quota is exceeded, **When** the scan is
   attempted, **Then** a clear error message is shown with a fallback suggestion
   (type manually or search online).

**Independent Test**: Open Add Book → tap "Scan cover" → take a clear photo of a book's
front cover → confirm title and author fill automatically → save and confirm the book
appears correctly in the library.

---

### User Story 11 — AI Reading Summary (Priority: P3)

A reader wants to generate a short AI summary of a book based on the title and author,
to jog their memory or fill in their notes when they finish reading.

**Technology**: Same Gemini Flash API key as US10.

**Acceptance Scenarios**:

1. **Given** a book has a title and author, **When** the user taps "Generate summary" on
   the book detail page, **Then** Gemini returns a 2–3 sentence summary of the book.
2. **Given** a summary is generated, **When** the user accepts it, **Then** it is saved
   as a note on the book (new `notes` field on the `Book` entity).
3. **Given** the book is unknown to Gemini, **When** a summary is requested, **Then** a
   message indicates no summary could be generated.

---

### User Story 12 — Supabase Cloud Sync (Priority: P1)

A reader wants their books, sessions, quotes, and ratings to sync across devices and
survive browser storage clears — without manual export/import.

**Technology**: Supabase (free tier: 500 MB database, 1 GB file storage, 50,000 MAU).

**Why this priority**: All data is currently local only. A browser storage clear or a
new device means losing everything. Cloud sync is the biggest reliability gap in the app.

**Architecture**:
- Supabase Postgres as the source of truth
- Dexie (IndexedDB) as the local cache for offline support
- A sync queue (already partially scaffolded from the React Native phase) to replay
  local writes when back online
- Google Sign-In via Supabase Auth (already implemented in an earlier phase)

**Acceptance Scenarios**:

1. **Given** the user is signed in, **When** they add or edit a book, **Then** the change
   is synced to Supabase within seconds.
2. **Given** the user opens the app on a second device with the same account, **When** the
   app loads, **Then** all books, sessions, quotes, and ratings are available.
3. **Given** the device is offline, **When** the user makes changes, **Then** changes are
   queued locally and synced automatically when connectivity is restored.
4. **Given** the user clears browser storage, **When** they sign back in, **Then** all
   data is restored from Supabase.
