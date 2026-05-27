# Route Contracts

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26

---

## Route Definitions

| Route | Component | Notes |
|---|---|---|
| `/` | `LibraryPage` | Default route; book grid with filter + sort |
| `/books/new` | `AddEditBookPage` | Add mode; status defaults to WANT_TO_READ |
| `/books/:id` | `BookDetailPage` | Redirects to `?tab=progress` if no tab param |
| `/books/:id?tab=progress` | `BookDetailPage` | Progress tab (default) |
| `/books/:id?tab=sessions` | `BookDetailPage` | Sessions tab |
| `/books/:id?tab=quotes` | `BookDetailPage` | Quotes tab |
| `/books/:id?tab=rating` | `BookDetailPage` | Rating tab |
| `/books/:id/edit` | `AddEditBookPage` | Edit mode; pre-fills form with existing data |
| `/books/:id/sessions/new` | `LogSessionPage` | Log a reading session |
| `/ranking` | `RankingPage` | Rated books sorted by stars desc |
| `/settings` | `SettingsPage` | Snapshot export / import |

---

## Tab Query Parameter

The `?tab` parameter on `/books/:id` controls which tab is active in `BookDetailPage`.

| Value | Tab shown |
|---|---|
| `progress` (default) | Progress percentage + Log Session shortcut |
| `sessions` | Chronological session list |
| `quotes` | Quote list + search + filter |
| `rating` | Star selector + review textarea |

If `?tab` is absent or an unknown value, the component defaults to `progress`.

---

## Navigation Flows

```
/  (Library)
├── FAB → /books/new
├── Card click → /books/:id?tab=progress
│   ├── Edit button → /books/:id/edit
│   ├── Tab: Sessions → /books/:id?tab=sessions
│   │   └── "Log session" button → /books/:id/sessions/new
│   ├── Tab: Quotes → /books/:id?tab=quotes
│   └── Tab: Rating → /books/:id?tab=rating
├── Top bar → /ranking
└── Top bar settings icon → /settings
```

---

## 404 Handling

Any unmatched route renders a minimal "Page not found" view with a link back to `/`.
