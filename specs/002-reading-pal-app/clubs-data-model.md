# Data Model: Reading Clubs

**Branch**: `002-reading-pal-app` | **Date**: 2026-06-13

---

## TypeScript Interfaces (`src/types/clubs.ts`)

```typescript
// ─── Enums / Unions ────────────────────────────────────────────────────────

export type ClubStatus = 'ACTIVE' | 'CLOSED';

export type PostType = 'QUOTE' | 'DISCOVERY' | 'DISCUSSION_REPLY';

export type BadgeId =
  | 'FIRST_TO_FINISH'   // First member in the club to reach 100%
  | 'QUOTE_MASTER'      // 5+ quote posts in the club
  | 'LOYAL_READER'      // Posted on 7+ distinct calendar days
  | 'THE_ANALYST';      // 3+ discovery posts in the club

export type MemberRole = 'MODERATOR' | 'MEMBER';

// ─── Emoji reaction keys ───────────────────────────────────────────────────
// Stored as literal string to avoid emoji encoding issues in Firestore keys.
export type ReactionEmoji = 'fire' | 'laugh' | 'cry' | 'mindblown';

export const REACTION_DISPLAY: Record<ReactionEmoji, string> = {
  fire: '🔥',
  laugh: '😂',
  cry: '😢',
  mindblown: '🤯',
};

// ─── ClubMember ────────────────────────────────────────────────────────────

export interface ClubMember {
  uid: string;                  // Firebase Auth uid — also the document ID
  displayName: string;          // copied from Firebase Auth at join time
  photoURL: string | null;      // copied from Firebase Auth at join time
  role: MemberRole;             // 'MODERATOR' | 'MEMBER'
  joinedAt: number;             // Unix timestamp (ms)
  progress: number;             // 0–100 integer; self-reported reading progress
  badges: BadgeId[];            // earned badges within this club; empty array if none
  // Denormalized counts used for badge award evaluation (server-side via client write):
  quotePostCount: number;       // incremented on each QUOTE post
  discoveryPostCount: number;   // incremented on each DISCOVERY post
  activeDays: number[];         // sorted list of day-number values (Date.getTime() floored to UTC midnight)
}

// ─── ClubPost ──────────────────────────────────────────────────────────────

export interface ClubPost {
  id: string;                   // Firestore auto-ID — also stored as field for convenience
  clubId: string;               // parent club document ID
  authorUid: string;            // Firebase Auth uid of the poster
  authorName: string;           // denormalized display name at post time
  authorPhotoURL: string | null;
  type: PostType;               // 'QUOTE' | 'DISCOVERY' | 'DISCUSSION_REPLY'
  text: string;                 // required; max 500 chars for QUOTE, 300 for DISCOVERY
  pageNumber?: number;          // optional page reference (QUOTE type only)
  topicId?: string;             // only set when type is 'DISCUSSION_REPLY'
  createdAt: number;            // Unix timestamp (ms) — used for ordering
  reactionCounts: Record<ReactionEmoji, number>; // aggregate counts; updated on each reaction write
}

// ─── PostReaction ──────────────────────────────────────────────────────────
// Stored as subcollection under each post: posts/{postId}/reactions/{uid}
// One document per user per post; the document ID is the user's uid.

export interface PostReaction {
  uid: string;                  // document ID — the reacting user's uid
  emoji: ReactionEmoji;         // which emoji they reacted with
  reactedAt: number;            // Unix timestamp (ms)
}

// ─── ClubDiscussionTopic ───────────────────────────────────────────────────

export interface ClubDiscussionTopic {
  id: string;                   // Firestore auto-ID
  clubId: string;
  authorUid: string;            // always the moderator for MVP
  authorName: string;
  title: string;                // required; the discussion question or topic title
  description?: string;         // optional longer context
  createdAt: number;            // Unix timestamp (ms)
  replyCount: number;           // denormalized count; incremented on each reply
  isAiGenerated: boolean;       // true when pre-filled from Gemini suggestion
}

// ─── ClubReply ─────────────────────────────────────────────────────────────
// Stored as subcollection: clubs/{clubId}/topics/{topicId}/replies/{replyId}

export interface ClubReply {
  id: string;                   // Firestore auto-ID
  topicId: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL: string | null;
  text: string;                 // required; max 1000 chars
  createdAt: number;            // Unix timestamp (ms)
}

// ─── Club ──────────────────────────────────────────────────────────────────

export interface Club {
  id: string;                   // Firestore auto-ID
  name: string;                 // required; display name of the club
  bookTitle: string;            // required
  bookAuthor: string;           // required
  bookCoverURL?: string;        // optional; sourced from Open Library if found
  description?: string;         // optional moderator blurb
  inviteCode: string;           // 6-char uppercase alphanumeric; unique across all clubs
  moderatorUid: string;         // uid of the club creator
  status: ClubStatus;           // 'ACTIVE' | 'CLOSED'
  memberCount: number;          // denormalized; incremented on join
  createdAt: number;            // Unix timestamp (ms)
  closedAt?: number;            // set when status transitions to CLOSED
  capsuleId?: string;           // reference to the ClubCapsule document ID after closure
}

// ─── ClubCapsule ───────────────────────────────────────────────────────────

export interface ClubCapsule {
  id: string;                   // same as clubId — one capsule per club
  clubId: string;
  clubName: string;
  bookTitle: string;
  bookAuthor: string;
  closedAt: number;             // Unix timestamp (ms) of club closure
  memberCount: number;
  totalPosts: number;           // count of all posts in the feed at closure
  totalReactions: number;       // sum of all reaction counts at closure
  generatedSummary: string;     // Gemini-generated narrative; fallback string if API failed
  summaryGeneratedAt: number;   // Unix timestamp (ms) of capsule creation
  memberSnapshots: CapsuleMemberSnapshot[];
}

export interface CapsuleMemberSnapshot {
  uid: string;
  displayName: string;
  photoURL: string | null;
  finalProgress: number;        // 0–100 at closure
  badges: BadgeId[];            // all earned badges at closure
}
```

---

## Firestore Collection Paths and Document Schemas

### Top-Level Collections

```
clubs/                          ← one document per club
clubs/{clubId}/members/         ← one document per member (uid as doc ID)
clubs/{clubId}/posts/           ← all feed posts for the club
clubs/{clubId}/posts/{postId}/reactions/    ← reactions per post (uid as doc ID)
clubs/{clubId}/topics/          ← discussion topics
clubs/{clubId}/topics/{topicId}/replies/    ← threaded replies
capsules/                       ← one document per closed club (clubId as doc ID)
```

Personal reading data stays unchanged in `users/{uid}/books`, `users/{uid}/sessions`, etc.
(as established in Phase 26). Club data is entirely separate.

---

### `clubs/{clubId}` — Club Document

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firestore auto-ID, stored as a field |
| `name` | `string` | Required |
| `bookTitle` | `string` | Required |
| `bookAuthor` | `string` | Required |
| `bookCoverURL` | `string?` | Optional Open Library URL |
| `description` | `string?` | Optional |
| `inviteCode` | `string` | 6-char uppercase alphanumeric; must be unique |
| `moderatorUid` | `string` | Firebase Auth uid of creator |
| `status` | `'ACTIVE' \| 'CLOSED'` | Defaults to `'ACTIVE'` on creation |
| `memberCount` | `number` | Denormalized; incremented with each join |
| `createdAt` | `number` | Unix timestamp (ms) |
| `closedAt` | `number?` | Set on closure |
| `capsuleId` | `string?` | Set after capsule is written |

---

### `clubs/{clubId}/members/{uid}` — Club Member Document

Document ID is the member's Firebase Auth `uid` — guarantees at-most-one membership document per user per club.

| Field | Type | Notes |
|---|---|---|
| `uid` | `string` | Same as document ID |
| `displayName` | `string` | Copied from Auth at join time |
| `photoURL` | `string \| null` | Copied from Auth at join time |
| `role` | `'MODERATOR' \| 'MEMBER'` | Set at creation / join |
| `joinedAt` | `number` | Unix timestamp (ms) |
| `progress` | `number` | 0–100; self-reported |
| `badges` | `string[]` | Array of `BadgeId` values |
| `quotePostCount` | `number` | Denormalized; used for badge evaluation |
| `discoveryPostCount` | `number` | Denormalized; used for badge evaluation |
| `activeDays` | `number[]` | UTC midnight timestamps of posting days |

---

### `clubs/{clubId}/posts/{postId}` — Feed Post Document

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firestore auto-ID, stored as field |
| `clubId` | `string` | Parent club ID |
| `authorUid` | `string` | Firebase uid |
| `authorName` | `string` | Denormalized at post time |
| `authorPhotoURL` | `string \| null` | Denormalized at post time |
| `type` | `'QUOTE' \| 'DISCOVERY'` | Post type |
| `text` | `string` | Max 500 chars (QUOTE), 300 chars (DISCOVERY) |
| `pageNumber` | `number?` | QUOTE type only |
| `topicId` | `string?` | Only for DISCUSSION_REPLY type |
| `createdAt` | `number` | Unix timestamp (ms) — primary sort key |
| `reactionCounts` | `{ fire: number; laugh: number; cry: number; mindblown: number }` | Aggregate counts |

---

### `clubs/{clubId}/posts/{postId}/reactions/{uid}` — Post Reaction

Document ID is the reacting user's `uid` — guarantees at-most-one reaction document per user per post.

| Field | Type | Notes |
|---|---|---|
| `uid` | `string` | Same as document ID |
| `emoji` | `ReactionEmoji` | One of: `fire`, `laugh`, `cry`, `mindblown` |
| `reactedAt` | `number` | Unix timestamp (ms) |

**Note**: Reactions are stored both as individual documents (for toggle detection) and as
aggregate counts on the parent post document (for display). When a reaction is added,
a Firestore transaction increments `reactionCounts[emoji]` on the post and writes the
reaction document. On removal, the transaction decrements the count and deletes the document.

---

### `clubs/{clubId}/topics/{topicId}` — Discussion Topic

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firestore auto-ID, stored as field |
| `clubId` | `string` | Parent club ID |
| `authorUid` | `string` | Moderator uid |
| `authorName` | `string` | Denormalized |
| `title` | `string` | Required; the discussion question |
| `description` | `string?` | Optional longer context |
| `createdAt` | `number` | Unix timestamp (ms) |
| `replyCount` | `number` | Denormalized; incremented on each reply |
| `isAiGenerated` | `boolean` | True when pre-filled from Gemini |

---

### `clubs/{clubId}/topics/{topicId}/replies/{replyId}` — Discussion Reply

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Firestore auto-ID, stored as field |
| `topicId` | `string` | Parent topic ID |
| `authorUid` | `string` | Firebase uid |
| `authorName` | `string` | Denormalized |
| `authorPhotoURL` | `string \| null` | Denormalized |
| `text` | `string` | Required; max 1000 chars |
| `createdAt` | `number` | Unix timestamp (ms) |

---

### `capsules/{clubId}` — Memory Capsule

Document ID is the `clubId` — one capsule per club.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Same as `clubId` |
| `clubId` | `string` | Reference to the source club |
| `clubName` | `string` | Denormalized at closure |
| `bookTitle` | `string` | Denormalized at closure |
| `bookAuthor` | `string` | Denormalized at closure |
| `closedAt` | `number` | Unix timestamp (ms) |
| `memberCount` | `number` | Final member count |
| `totalPosts` | `number` | Total posts in feed at closure |
| `totalReactions` | `number` | Sum of all reaction counts |
| `generatedSummary` | `string` | Gemini narrative or fallback string |
| `summaryGeneratedAt` | `number` | Unix timestamp (ms) |
| `memberSnapshots` | `CapsuleMemberSnapshot[]` | Final state per member |

---

## Security Rules Description

All rules assume the user is authenticated (`request.auth != null`). Unauthenticated users
have no read or write access to any club data.

### `clubs/{clubId}` — Club Document

| Operation | Who | Condition |
|---|---|---|
| **read** | Any authenticated user | Needed for invite code lookup and club browsing |
| **create** | Any authenticated user | `request.auth.uid == request.resource.data.moderatorUid` |
| **update** | Moderator only | `request.auth.uid == resource.data.moderatorUid` |
| **delete** | Nobody (no delete in MVP) | Always denied |

### `clubs/{clubId}/members/{uid}` — Member Document

| Operation | Who | Condition |
|---|---|---|
| **read** | Any member of the club | `exists(/databases/$(database)/documents/clubs/$(clubId)/members/$(request.auth.uid))` |
| **create** | The user joining | `request.auth.uid == uid` (document ID must match caller) |
| **update** | The member themselves | `request.auth.uid == uid` (own progress and badges only) |
| **delete** | Nobody (no leave/kick in MVP) | Always denied |

**Note**: Badge writes are performed by the client on the member's own document, validated
by the `uid == request.auth.uid` rule. Badge evaluation logic runs client-side in the
repository layer.

### `clubs/{clubId}/posts/{postId}` — Feed Posts

| Operation | Who | Condition |
|---|---|---|
| **read** | Any member of the club | Member doc must exist |
| **create** | Any member of the club | `authorUid == request.auth.uid`; club must be `ACTIVE` |
| **delete** | Post author only | `request.auth.uid == resource.data.authorUid` |
| **update** | reactionCounts only | Only the `reactionCounts` field may be updated; validated via `request.resource.data.keys().hasOnly(['reactionCounts'])` |

### `clubs/{clubId}/posts/{postId}/reactions/{uid}` — Reactions

| Operation | Who | Condition |
|---|---|---|
| **read** | Any member of the club | Member doc must exist |
| **create / delete** | The reacting user | `request.auth.uid == uid`; club must be `ACTIVE` |

### `clubs/{clubId}/topics/{topicId}` — Discussion Topics

| Operation | Who | Condition |
|---|---|---|
| **read** | Any member | Member doc must exist |
| **create** | Moderator only | `request.auth.uid == get(/databases/$(database)/documents/clubs/$(clubId)).data.moderatorUid` |
| **update** | Nobody directly | `replyCount` updated via transaction from reply create |
| **delete** | Nobody | Always denied |

### `clubs/{clubId}/topics/{topicId}/replies/{replyId}` — Replies

| Operation | Who | Condition |
|---|---|---|
| **read** | Any member | Member doc must exist |
| **create** | Any member | `authorUid == request.auth.uid`; club must be `ACTIVE` |
| **delete** | Reply author only | `request.auth.uid == resource.data.authorUid` |

### `capsules/{clubId}` — Memory Capsule

| Operation | Who | Condition |
|---|---|---|
| **read** | Any authenticated user | Capsules are public within the authenticated app |
| **create** | Moderator of the source club | `request.auth.uid == get(/databases/$(database)/documents/clubs/$(clubId)).data.moderatorUid` |
| **update / delete** | Nobody | Always denied — capsules are immutable |

---

## Index Rationale

Firestore requires composite indexes for multi-field queries. Single-field indexes are
created automatically on every field.

| Collection | Index | Fields | Query it enables |
|---|---|---|---|
| `clubs` | Auto (single) | `inviteCode` | Invite code lookup: `where('inviteCode', '==', code)` |
| `clubs` | Auto (single) | `status` | Filter active/closed clubs for a user's club list |
| `clubs` | Auto (single) | `moderatorUid` | Fetch all clubs where user is moderator |
| `clubs/{id}/members` | Auto (single) | `joinedAt` | Sort members by join date |
| `clubs/{id}/members` | Auto (single) | `progress` | Sort members by progress for leaderboard display |
| `clubs/{id}/posts` | **Composite** | `type ASC`, `createdAt DESC` | Filter feed by post type, newest first |
| `clubs/{id}/posts` | **Composite** | `authorUid ASC`, `createdAt DESC` | Fetch posts by a specific member |
| `clubs/{id}/topics` | Auto (single) | `createdAt` | Sort topics chronologically |
| `clubs/{id}/topics/{id}/replies` | Auto (single) | `createdAt` | Sort replies chronologically |
| `capsules` | Auto (single) | `closedAt` | Sort capsules by closure date (for a "past clubs" gallery, future) |

**Composite index note**: The `posts` composite index (`type + createdAt`) must be manually
created in the Firebase console or via `firestore.indexes.json`. All other queries use
auto-indexes on individual fields.

---

## Relationship Diagram

```
Club (1)
  │
  ├──< members/ (many)          uid as document ID
  │      │
  │      └── ClubMember { uid, progress, badges, quotePostCount, discoveryPostCount, activeDays }
  │
  ├──< posts/ (many)
  │      │
  │      ├── ClubPost { id, authorUid, type, text, pageNumber, createdAt, reactionCounts }
  │      │
  │      └──< reactions/ (many)  uid as document ID
  │             └── PostReaction { uid, emoji, reactedAt }
  │
  ├──< topics/ (many)
  │      │
  │      ├── ClubDiscussionTopic { id, authorUid, title, description, replyCount, isAiGenerated }
  │      │
  │      └──< replies/ (many)
  │             └── ClubReply { id, authorUid, text, createdAt }
  │
  └──| capsules/{clubId} (0 or 1)    ← top-level collection, keyed by clubId
         └── ClubCapsule { generatedSummary, memberSnapshots, totalPosts, totalReactions }
```

---

## Invite Code Generation Strategy

### Format

6-character uppercase alphanumeric string drawn from the character set `[A-Z0-9]`, excluding
visually ambiguous characters `O`, `0`, `I`, `1` to reduce transcription errors.

Effective character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 characters)
Keyspace: 32^6 = 1,073,741,824 unique codes — sufficient for a personal-scale app.

### Generation Algorithm

```typescript
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}
```

### Uniqueness Guarantee

Before writing a new club to Firestore, the repository queries:

```typescript
const existing = await getDocs(
  query(collection(firestoreDb, 'clubs'), where('inviteCode', '==', code))
);
```

If the query returns any documents, a new code is generated and re-checked (retry loop,
max 5 attempts). Collision probability at 1,000 clubs is ~0.00093% — effectively zero.

### Storage

The `inviteCode` field lives on the club document at `clubs/{clubId}.inviteCode`.
Lookup by code uses a `collectionGroup` query is not needed — a standard collection query
on the `clubs` root collection is sufficient since all clubs are at the top level.

### Case Handling

Codes are always stored in uppercase. User input is normalized to uppercase before lookup:
`code.toUpperCase().trim()`.

---

## Badge Award Logic

Badges are evaluated client-side in the club repository layer after each relevant write.
If a badge condition is newly met, the repository atomically adds the badge to the member's
`badges` array in a Firestore transaction alongside the triggering write.

### `FIRST_TO_FINISH` — Primero en terminar

**Trigger**: Member writes a `progress` value of `100` to their member document.

**Evaluation**:
1. After writing the progress update, query `clubs/{clubId}/members` where `progress == 100`.
2. If the query returns exactly 1 document (the current member), they are the first — award the badge.
3. If more than 1 document is returned, someone else already finished — no badge awarded.

**Race condition handling**: The query runs immediately after the write. Due to Firestore's
eventual consistency, two members could both see themselves as "first" in a tight race.
This is an acceptable edge case for MVP — the badge has sentimental rather than competitive
value. A Cloud Function could be used to enforce strict ordering in a future version.

### `QUOTE_MASTER` — Quote master

**Trigger**: Member successfully submits a post with `type == 'QUOTE'`.

**Evaluation**:
1. After the post write, increment `members/{uid}.quotePostCount` in a transaction.
2. If the new `quotePostCount >= 5` and the badge is not already in the `badges` array,
   add `QUOTE_MASTER` to the array.

**Count source**: `quotePostCount` is maintained as a denormalized counter on the member
document to avoid a collection count query on each post.

### `LOYAL_READER` — Lector fiel

**Trigger**: Member submits any post to the club feed.

**Evaluation**:
1. Calculate today's UTC midnight timestamp: `new Date().setUTCHours(0,0,0,0)`.
2. In a transaction, add this timestamp to `members/{uid}.activeDays` (only if not already
   present — use a set operation or filter before writing).
3. If `activeDays.length >= 7` and the badge is not yet awarded, add `LOYAL_READER`.

**Active day deduplication**: Compare the timestamp to existing values in `activeDays`
before writing. Firestore's `arrayUnion` is not suitable here because timestamps can be
computed differently; use a client-side check followed by a conditional transaction.

### `THE_ANALYST` — El analítico

**Trigger**: Member successfully submits a post with `type == 'DISCOVERY'`.

**Evaluation**:
1. After the post write, increment `members/{uid}.discoveryPostCount` in a transaction.
2. If the new `discoveryPostCount >= 3` and the badge is not in the `badges` array,
   add `THE_ANALYST`.

---

## State Transitions

### Club Status

```
ACTIVE  ──[moderator closes club]──▶  CLOSED
```

- An `ACTIVE` club accepts new members, posts, reactions, and replies.
- A `CLOSED` club is read-only — all writes to posts, reactions, and replies are rejected
  by Security Rules. Member progress is frozen. The capsule is immutable.
- There is no reopening mechanism in MVP.

### Member Progress

```
0%  ──[member updates progress]──▶  1–99%  ──[member updates to 100%]──▶  100% (complete)
```

Progress is strictly self-reported and independent of the member's personal Dexie-tracked
progress. It is stored in `clubs/{clubId}/members/{uid}.progress` as an integer 0–100.

---

## Validation Rules

| Field | Rule |
|---|---|
| `Club.name` | Required; non-empty string; max 80 chars |
| `Club.bookTitle` | Required; non-empty string; max 200 chars |
| `Club.bookAuthor` | Required; non-empty string; max 100 chars |
| `Club.inviteCode` | 6 chars; `[A-Z2-9]` character set; unique |
| `ClubMember.progress` | Integer 0–100 |
| `ClubPost.text` | Required; 1–500 chars (QUOTE), 1–300 chars (DISCOVERY) |
| `ClubPost.pageNumber` | Optional; integer ≥ 1 |
| `ClubReply.text` | Required; 1–1000 chars |
| `ClubDiscussionTopic.title` | Required; 1–200 chars |
| `PostReaction.emoji` | One of: `fire`, `laugh`, `cry`, `mindblown` |
