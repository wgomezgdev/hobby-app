# Test Specifications
<!-- derived from spec.md v1.1.0 acceptance criteria | 2026-05-25 -->

Every test case below traces to a specific acceptance criterion (AC-XX.Y) in spec.md.
No test case exists that does not have a corresponding AC. No AC is left without at least one test.

---

## 1. Unit Tests

Unit tests verify business logic in isolation — no UI, no database, no network.

### 1.1 Progress Calculation

| ID | Traces to | Description | Input | Expected output |
|---|---|---|---|---|
| UT-01 | AC-02.2 | Percentage derived from pages | pagesTo=50, totalPages=200 | 25% |
| UT-02 | AC-02.2 | Percentage rounds to integer | pagesTo=1, totalPages=3 | 33% |
| UT-03 | AC-02.3 | Status auto-sets to Finished at 100% | pagesTo=200, totalPages=200 | status = finished |
| UT-04 | AC-02.4 | pagesTo > totalPages is invalid | pagesTo=201, totalPages=200 | throws ValidationException |
| UT-05 | AC-02.4 | pagesTo < pagesFrom is invalid | pagesFrom=100, pagesTo=50 | throws ValidationException |
| UT-06 | AC-02.2 | Progress 0% when no sessions | sessions=[] | 0% |

### 1.2 Rating Validation

| ID | Traces to | Description | Input | Expected output |
|---|---|---|---|---|
| UT-07 | AC-04.1 | Stars below 1 is invalid | stars=0 | throws ValidationException |
| UT-08 | AC-04.1 | Stars above 5 is invalid | stars=6 | throws ValidationException |
| UT-09 | AC-04.1 | Stars 1–5 are valid | stars=3 | passes validation |
| UT-10 | AC-04.4 | Sort by rating places unrated books last | [rated(3), unrated, rated(5)] | [rated(5), rated(3), unrated] |

### 1.3 Sync Queue Logic

| ID | Traces to | Description | Input | Expected output |
|---|---|---|---|---|
| UT-11 | AC-01.6 | Offline op is queued | connectivity=offline, addBook | op added to sync queue |
| UT-12 | AC-01.6 | Sync queue flushes on connectivity restore | queue=[addBook], connectivity restored | book pushed to remote |
| UT-13 | AC-01.6 | Failed sync retries with back-off (max 5) | remote error on push | retried 5 times then marked failed |

---

## 2. Widget Tests

Widget tests render a single widget tree with mocked providers — no real database or network.

### 2.1 Add Book Form (US-01)

| ID | Traces to | Description | Action | Expected UI state |
|---|---|---|---|---|
| WT-01 | AC-01.2 | Save with empty title shows error | tap Save with title="" | inline error "Title is required" visible |
| WT-02 | AC-01.2 | Save with empty author shows error | tap Save with author="" | inline error "Author is required" visible |
| WT-03 | AC-01.3 | Valid form triggers save callback | fill all required fields, tap Save | onSave called once with correct BookCreate |
| WT-04 | AC-01.4 | Cover thumbnail shows after image pick | pick image | 300×300 thumbnail rendered in form |
| WT-05 | AC-01.1 | FAB tap opens form | tap FAB on Library screen | Add Book form visible |

### 2.2 Log Session Form (US-02)

| ID | Traces to | Description | Action | Expected UI state |
|---|---|---|---|---|
| WT-06 | AC-02.1 | Session form opens as bottom sheet | tap "Log Session" | ModalBottomSheet visible |
| WT-07 | AC-02.4 | pagesTo > totalPages shows error | enter pagesTo=999 (totalPages=200), tap Save | inline error visible, onSave not called |
| WT-08 | AC-02.2 | Valid session triggers save callback | fill valid pages and duration, tap Save | onSave called once |
| WT-09 | AC-02.6 | Session list renders chronologically | sessions=[A@day1, B@day2] | B appears above A |

### 2.3 Quote Capture Form (US-03)

| ID | Traces to | Description | Action | Expected UI state |
|---|---|---|---|---|
| WT-10 | AC-03.2 | Save with empty text shows error | tap Save with text="" | inline error "Quote text is required" visible |
| WT-11 | AC-03.3 | Valid quote triggers save callback | fill text, tap Save | onSave called once with correct QuoteCreate |
| WT-12 | AC-03.5 | Favorite icon toggles on tap | tap favorite icon | icon state changes, onToggleFavorite called |

### 2.4 Rating Widget (US-04)

| ID | Traces to | Description | Action | Expected UI state |
|---|---|---|---|---|
| WT-13 | AC-04.1 | Tapping star 3 selects 3 stars | tap star 3 | stars 1–3 filled, 4–5 empty |
| WT-14 | AC-04.5 | Widget pre-fills existing rating | existing rating=4 | stars 1–4 filled on render |
| WT-15 | AC-04.2 | Save emits rating value | tap star 4, tap Save | onSave called with stars=4 |

### 2.5 Library Screen

| ID | Traces to | Description | Action | Expected UI state |
|---|---|---|---|---|
| WT-16 | AC-01.5 | Grid renders book covers | books=[A(cover), B(no cover)] | A shows thumbnail, B shows placeholder |
| WT-17 | AC-04.4 | Sort by Top Rated reorders list | select "Top rated" sort | books ordered by rating desc |

---

## 3. Integration Tests

Integration tests run against a real local Drift database (in-memory) with mocked Supabase client.

### 3.1 Offline → Online Sync Flow

| ID | Traces to | Description | Steps | Expected result |
|---|---|---|---|---|
| IT-01 | AC-01.6 | Book created offline syncs on reconnect | 1. Set connectivity=offline 2. Add book 3. Restore connectivity | Book appears in remote via Supabase mock |
| IT-02 | AC-02.5 | Session created offline syncs on reconnect | 1. Offline 2. Log session 3. Reconnect | Session synced to remote |
| IT-03 | AC-03.7 | Quote created offline syncs on reconnect | 1. Offline 2. Save quote 3. Reconnect | Quote synced to remote |

### 3.2 Auth Flow

| ID | Traces to | Description | Steps | Expected result |
|---|---|---|---|---|
| IT-04 | AC-01.6 | Unauthenticated user is redirected | launch app with no session | Navigates to Login screen |
| IT-05 | — | Successful login stores session | enter valid credentials | Session token stored in secure storage |
| IT-06 | — | Invalid credentials show error | enter wrong password | Error message visible, no session stored |

### 3.3 Progress + Status Transition

| ID | Traces to | Description | Steps | Expected result |
|---|---|---|---|---|
| IT-07 | AC-02.3 | Book auto-finishes at 100% | log session with pagesTo=totalPages | Book status updated to "finished" in local DB |
| IT-08 | AC-02.2 | Progress bar reflects latest session | log 3 sessions sequentially | Progress bar shows pagesTo of last session / totalPages |

### 3.4 Quote Search (FTS)

| ID | Traces to | Description | Steps | Expected result |
|---|---|---|---|---|
| IT-09 | AC-03.4 | Keyword search returns matching quotes | insert 3 quotes, search "courage" | Only quotes containing "courage" returned |
| IT-10 | AC-03.4 | Search with no match returns empty | search "xyzzy" | Empty list returned |
| IT-11 | AC-03.6 | Tag filter returns tagged quotes only | insert quote with tag "philosophy", filter by "philosophy" | Only that quote returned |

---

## Traceability Matrix

| Acceptance Criterion | Unit Tests | Widget Tests | Integration Tests |
|---|---|---|---|
| AC-01.1 | — | WT-05 | — |
| AC-01.2 | — | WT-01, WT-02 | — |
| AC-01.3 | — | WT-03 | — |
| AC-01.4 | — | WT-04 | — |
| AC-01.5 | — | WT-16 | — |
| AC-01.6 | UT-11, UT-12, UT-13 | — | IT-01 |
| AC-02.1 | — | WT-06 | — |
| AC-02.2 | UT-01, UT-02, UT-06 | WT-08 | IT-08 |
| AC-02.3 | UT-03 | — | IT-07 |
| AC-02.4 | UT-04, UT-05 | WT-07 | — |
| AC-02.5 | — | — | IT-02 |
| AC-02.6 | — | WT-09 | — |
| AC-03.2 | — | WT-10 | — |
| AC-03.3 | — | WT-11 | — |
| AC-03.4 | — | — | IT-09, IT-10 |
| AC-03.5 | — | WT-12 | — |
| AC-03.6 | — | — | IT-11 |
| AC-03.7 | — | — | IT-03 |
| AC-04.1 | UT-07, UT-08, UT-09 | WT-13 | — |
| AC-04.2 | — | WT-15 | — |
| AC-04.4 | UT-10 | WT-17 | — |
| AC-04.5 | — | WT-14 | — |
