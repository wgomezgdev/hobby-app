# Reading Pal

A personal reading tracker PWA built with React, TypeScript, and MUI. Track your books, log reading sessions, save quotes, rate what you've read, and keep your library in sync across devices.

**Current version: v0.16.3**

---

## Features

### Library management
- Add books manually or by scanning a cover photo (AI-powered via Gemini Flash)
- Search and set covers online from Google Books or Open Library
- Bulk "Find missing covers" scan — auto-fetches covers for all books without one
- Filter by status (Reading, Want to Read, Finished) and sort by recent, title, or author
- Import your library from a Goodreads CSV export (covers fetched automatically)
- Edit or delete books at any time

### Reading progress
- Log reading sessions with date, duration, and page/progress tracking
- Visual progress bar and percentage on every book card
- Pace stats: start date, days reading, average pages per day, estimated days to finish

### Quotes
- Save quotes from any book with optional page number and favorite flag
- Search and filter quotes; mark favorites

### Ratings & Ranking
- Rate finished books 1–5 stars with an optional review
- Ranking page sorted by stars or recently finished

### Statistics
- Annual reading count vs. goal
- Monthly activity chart (books per month)
- Reading streaks, total sessions, time read
- Genre breakdown and all-time page count

### Cloud sync
- Sign in with Google (Firebase Auth)
- Push to / restore from Firestore cloud backup
- Local-first: all data stored in IndexedDB via Dexie; app works fully offline

### PWA
- Installable on iOS and Android
- Offline support via Workbox service worker
- iOS safe-area insets respected

### Localization
- English and Spanish (auto-detected from browser)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + MUI v5 |
| State | Zustand + dexie-react-hooks |
| Local DB | Dexie.js v4 (IndexedDB) |
| Cloud | Firebase Auth + Firestore |
| Forms | React Hook Form |
| Routing | React Router v6 |
| Charts | Recharts |
| i18n | i18next + react-i18next |
| AI | Gemini Flash (cover scan) |
| Cover search | Google Books API + Open Library |
| Build | Vite + vite-plugin-pwa |
| Tests | Vitest + Testing Library |

---

## Getting started

```bash
npm install
npm run dev
```

### Environment variables

Create a `.env.local` file in the project root:

```env
# Firebase (required for Auth + cloud sync)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google Books API (optional — increases cover search quota)
VITE_GOOGLE_BOOKS_API_KEY=

# Gemini Flash (optional — enables AI cover scan)
VITE_GEMINI_API_KEY=
```

All Firebase variables are optional: the app runs fully offline without them; only cloud sync and Google Sign-In are disabled.

---

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run typecheck  # TypeScript check only
```

---

## Changelog

### v0.16.3
- Profile page: "Library Tools" section with "Find missing covers" bulk scan

### v0.16.2
- Goodreads import: strip series notation from titles before cover search
- Cover search: 4-attempt fallback chain (Google Books + Open Library, title+author then title-only)

### v0.16.1
- Fixed broken cover images across Library, Ranking, Book Detail, and Home screens

### v0.16.0
- Stable release: full reading tracker with library, sessions, quotes, ratings, stats, ranking, Goodreads import, cloud sync, and PWA support
