# Data Model
<!-- 001-reading-companion-mvp | 2026-05-25 -->

Canonical entity definitions for the Reading Companion MVP.
This document is the source of truth for both Drift (local) schema and Supabase (remote) schema.

---

## Entities

### UserProfile

Managed by Supabase Auth. Extended with `display_name`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Set by Supabase Auth |
| `email` | TEXT | NOT NULL, UNIQUE | Auth email |
| `display_name` | TEXT | NOT NULL | Shown in UI |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### Book

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | NOT NULL, FK → UserProfile.id | RLS uses this |
| `title` | TEXT | NOT NULL | |
| `author` | TEXT | NOT NULL | |
| `total_pages` | INTEGER | NOT NULL, CHECK > 0 | Required for progress % |
| `status` | TEXT | NOT NULL, DEFAULT 'want_to_read' | Enum: want_to_read / reading / finished |
| `cover_uri` | TEXT | NULLABLE | Supabase Storage public URL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Updated by DB trigger on every write |

**Derived field (never stored):**
- `progress_percentage = latest_session.pages_to / total_pages * 100`

**Indexes:** `(user_id, status)`, `(user_id, updated_at DESC)`

---

### ReadingSession

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `book_id` | UUID | NOT NULL, FK → Book.id ON DELETE CASCADE | |
| `started_at` | TIMESTAMPTZ | NOT NULL | When the session began |
| `duration_minutes` | INTEGER | NOT NULL, CHECK > 0 | Session length |
| `pages_from` | INTEGER | NOT NULL, CHECK >= 0 | Page number at session start |
| `pages_to` | INTEGER | NOT NULL, CHECK > 0 | Page number at session end |
| `notes` | TEXT | NULLABLE | Optional session notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Constraints:**
- `CHECK (pages_to > pages_from)` — must make forward progress
- `CHECK (pages_to <= book.total_pages)` — enforced at application layer

**Indexes:** `(book_id, started_at DESC)`

---

### Quote

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `book_id` | UUID | NOT NULL, FK → Book.id ON DELETE CASCADE | |
| `text` | TEXT | NOT NULL | The quote content |
| `page_number` | INTEGER | NULLABLE | Optional page reference |
| `tags` | TEXT[] | NOT NULL, DEFAULT '{}' | Array of tag strings |
| `is_favorite` | BOOLEAN | NOT NULL, DEFAULT false | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Full-text search:**
- Supabase: `tsvector` column on `text` with GIN index
- Drift (local): SQLite FTS5 virtual table mirroring `quotes.text`

**Indexes:** `(book_id)`, `(is_favorite)`, FTS index on `text`

---

### Rating

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `book_id` | UUID | NOT NULL, UNIQUE, FK → Book.id ON DELETE CASCADE | One rating per book |
| `stars` | INTEGER | NOT NULL, CHECK BETWEEN 1 AND 5 | |
| `review` | TEXT | NULLABLE | Optional review text |
| `rated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Note:** UNIQUE on `book_id` enforces one rating per book. Use upsert (`ON CONFLICT DO UPDATE`) to update existing ratings.

---

### SyncQueue (local only — Drift only, never synced to Supabase)

Stores failed remote operations for retry.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | PK, autoincrement |
| `entity_type` | TEXT | 'book' / 'session' / 'quote' / 'rating' |
| `entity_id` | TEXT | UUID of the entity |
| `operation` | TEXT | 'create' / 'update' / 'delete' |
| `payload` | TEXT | JSON-serialized entity |
| `attempt_count` | INTEGER | DEFAULT 0, MAX 5 |
| `next_retry_at` | INTEGER | Unix timestamp, exponential back-off |
| `created_at` | INTEGER | Unix timestamp |

---

## Relationships

```
UserProfile
    │
    └──< Book (user_id)
              │
              ├──< ReadingSession (book_id)
              ├──< Quote (book_id)
              └──1 Rating (book_id)
```

---

## Supabase RLS Policies

All tables follow this pattern — users can only access their own data:

```sql
-- Example for books table (same pattern for all tables)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own books"
  ON books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

For `reading_sessions`, `quotes`, and `ratings` — RLS joins through `book_id → books.user_id`.

---

## updated_at Trigger (Supabase)

Applied to all tables with `updated_at`:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Repeat for reading_sessions, quotes, ratings
```
