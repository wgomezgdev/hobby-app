# Repository Contracts

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26

These are the function signatures that the UI layer (hooks, components) calls. All
implementations live under `src/repositories/`. No component or hook may import from
`src/db/db.ts` directly.

---

## bookRepository.ts

```typescript
// Returns all books; caller uses useLiveQuery wrapper in useBooks.ts
export function getAllBooks(): Promise<Book[]>

// Returns a single book by id
export function getBook(id: number): Promise<Book | undefined>

// Adds a new book; returns the auto-generated id
export function addBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>

// Updates an existing book's editable fields
export function updateBook(id: number, changes: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<void>

// Deletes a book and ALL related sessions, quotes, and rating (single transaction)
export function deleteBook(id: number): Promise<void>
```

---

## sessionRepository.ts

```typescript
// Returns all sessions for a book ordered by startedAt asc
export function getSessionsForBook(bookId: number): Promise<ReadingSession[]>

// Saves a session AND updates book.currentProgress + auto-FINISHED (single transaction)
export function saveSession(session: Omit<ReadingSession, 'id'>): Promise<void>

// Deletes a single session (does NOT recalculate book progress)
export function deleteSession(id: number): Promise<void>
```

---

## quoteRepository.ts

```typescript
// Returns all quotes for a book
export function getQuotesForBook(bookId: number): Promise<Quote[]>

// Returns all unique tags used in quotes for a given book (for autocomplete)
export function getTagsForBook(bookId: number): Promise<string[]>

// Adds a new quote; returns the auto-generated id
export function addQuote(quote: Omit<Quote, 'id' | 'createdAt'>): Promise<number>

// Toggles the isFavorite flag for a quote
export function toggleFavorite(id: number): Promise<void>

// Deletes a quote
export function deleteQuote(id: number): Promise<void>
```

---

## ratingRepository.ts

```typescript
// Returns the rating for a book (undefined if not yet rated)
export function getRating(bookId: number): Promise<Rating | undefined>

// Creates or replaces the rating for a book (upsert)
export function saveRating(rating: Rating): Promise<void>
```

---

## snapshot.ts (utility — not a repository)

```typescript
// Serializes all Dexie tables to a Snapshot object and triggers a file download
export async function exportSnapshot(): Promise<void>

// Parses an imported JSON file, validates structure, then replaces all DB data
// Throws if the file is malformed or not a valid snapshot
export async function importSnapshot(file: File): Promise<void>
```
