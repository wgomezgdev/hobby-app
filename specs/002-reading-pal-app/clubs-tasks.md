# Tasks: Reading Clubs

**Input**: `specs/002-reading-pal-app/clubs-spec.md` + `clubs-data-model.md`

**Prerequisites**: tasks.md Phases 1–26 complete ✅ | Firebase Auth + Firestore configured ✅
| `src/lib/firebase.ts` exists ✅ | `VITE_GEMINI_API_KEY` configured ✅

**Tests**: Not requested — test tasks excluded.

**Organization**: Tasks are grouped by phase. Within each phase, [P] marks tasks that have
no file conflicts and may run in parallel.

## Format: `- [ ] TXXX [P?] Description — file path`

All file paths are relative to repo root.

---

## Phase 29: Club Infrastructure — Types, Repositories, Hooks

**Purpose**: All shared types, Firestore repository functions, and React hooks that every
club UI screen depends on. No UI work — this phase is pure data layer.

**Prerequisite gate**: All tasks in this phase can be started immediately once Phase 26
(Firebase Auth + Firestore) is confirmed complete.

**Checkpoint**: TypeScript compiles clean. `clubRepository` functions can be imported
and called in a browser console without runtime errors. `onSnapshot` listeners fire
correctly for a test club document.

- [ ] T200 [P1] Define all club TypeScript interfaces and enums — `src/types/clubs.ts`
  - Export: `ClubStatus`, `PostType`, `BadgeId`, `MemberRole`, `ReactionEmoji`,
    `REACTION_DISPLAY`, `ClubMember`, `ClubPost`, `PostReaction`, `ClubDiscussionTopic`,
    `ClubReply`, `Club`, `ClubCapsule`, `CapsuleMemberSnapshot`
  - Exactly as specified in `clubs-data-model.md`; use `readonly` arrays where mutation
    is not expected (e.g. `badges: readonly BadgeId[]` is acceptable but not required)
  - Do not import from `src/types/entities.ts` — clubs types are fully independent

- [ ] T201 [P1] Create `generateInviteCode` utility — `src/utils/inviteCode.ts`
  - Implement the 32-character safe-charset code generator from `clubs-data-model.md`
  - Export: `generateInviteCode(): string` — returns a 6-char uppercase code
  - Export: `normalizeCode(raw: string): string` — `.toUpperCase().trim()`
  - No external dependencies

- [ ] T202 [P1] Create club Firestore repository — `src/repositories/clubRepository.ts`
  - Import `firestoreDb` from `src/lib/firebase.ts`
  - **`createClub(data: Omit<Club, 'id' | 'createdAt' | 'memberCount' | 'status'>): Promise<string>`**
    - Generate invite code; check for uniqueness (retry up to 5 times)
    - Write club doc with `status: 'ACTIVE'`, `memberCount: 1`, `createdAt: Date.now()`
    - Write the moderator's own member doc at `clubs/{clubId}/members/{uid}` with
      `role: 'MODERATOR'`, `progress: 0`, `badges: []`, `quotePostCount: 0`,
      `discoveryPostCount: 0`, `activeDays: []`
    - Return the new `clubId`
  - **`getClubByInviteCode(code: string): Promise<Club | null>`**
    - Query `clubs` where `inviteCode == normalizeCode(code)`
    - Return the first result or null
  - **`joinClub(clubId: string, member: Omit<ClubMember, 'joinedAt' | 'progress' | 'badges' | 'quotePostCount' | 'discoveryPostCount' | 'activeDays'>): Promise<void>`**
    - Write member doc at `clubs/{clubId}/members/{uid}` (uid as doc ID)
    - Use `setDoc` with `{ merge: false }` — idempotent if already a member (returns
      without error if doc already exists — check with `getDoc` first and throw a
      typed `AlreadyMemberError` if so)
    - Increment `clubs/{clubId}.memberCount` via `increment(1)` in the same transaction
  - **`closeClub(clubId: string): Promise<void>`**
    - Set `status: 'CLOSED'`, `closedAt: Date.now()` on the club document
  - **`getUserClubs(uid: string): Promise<Club[]>`**
    - Query the `members` sub-collection across clubs is not straightforward; instead,
      maintain a `userClubs/{uid}/clubs/{clubId}` mirror document (see T203 for details)

- [ ] T203 [P1] Create user-club index mirror — `src/repositories/clubRepository.ts`
  (extend T202)
  - To support "fetch all clubs this user is in" without a collectionGroup query,
    write a mirror document at `userClubs/{uid}/clubs/{clubId}` whenever a user
    creates or joins a club: `{ clubId, clubName, bookTitle, joinedAt, role }`
  - **`getUserClubs(uid: string): Promise<Club[]>`**
    - Query `userClubs/{uid}/clubs` ordered by `joinedAt desc`
    - For each result, fetch the corresponding `clubs/{clubId}` document
    - Return the hydrated `Club[]` array
  - Add the `userClubs/{uid}/clubs/{clubId}` write to both `createClub` and `joinClub`

- [ ] T204 [P1] Create post Firestore repository — `src/repositories/postRepository.ts`
  - **`addPost(clubId: string, post: Omit<ClubPost, 'id' | 'createdAt' | 'reactionCounts'>): Promise<string>`**
    - Write post doc to `clubs/{clubId}/posts`; set `createdAt: Date.now()`,
      `reactionCounts: { fire: 0, laugh: 0, cry: 0, mindblown: 0 }`
    - After write, call `evaluateBadgesAfterPost(clubId, post.authorUid, post.type)` (see T206)
    - Return the auto-generated post ID
  - **`deletePost(clubId: string, postId: string): Promise<void>`**
    - Delete all reaction documents in `posts/{postId}/reactions/` first (client-side cascade),
      then delete the post document
  - **`toggleReaction(clubId: string, postId: string, uid: string, emoji: ReactionEmoji): Promise<void>`**
    - Run a Firestore transaction:
      1. Check if `posts/{postId}/reactions/{uid}` exists
      2. If exists: delete the reaction doc + decrement `reactionCounts[emoji]` on the post
      3. If not exists: write the reaction doc + increment `reactionCounts[emoji]` on the post

- [ ] T205 [P1] Create discussion Firestore repository — `src/repositories/discussionRepository.ts`
  - **`addTopic(clubId: string, topic: Omit<ClubDiscussionTopic, 'id' | 'createdAt' | 'replyCount'>): Promise<string>`**
    - Write topic doc to `clubs/{clubId}/topics`; set `createdAt: Date.now()`, `replyCount: 0`
    - Return the topic ID
  - **`addReply(clubId: string, topicId: string, reply: Omit<ClubReply, 'id' | 'createdAt'>): Promise<void>`**
    - In a transaction: write reply doc to `topics/{topicId}/replies/`; increment
      `topics/{topicId}.replyCount` by 1

- [ ] T206 [P1] Create badge evaluation utility — `src/utils/badgeEvaluator.ts`
  - **`evaluateBadgesAfterPost(clubId: string, uid: string, postType: PostType): Promise<void>`**
    - Run a Firestore transaction on `clubs/{clubId}/members/{uid}`:
      1. Fetch current member doc
      2. If `postType == 'QUOTE'`: increment `quotePostCount`; if new count >= 5 and
         `QUOTE_MASTER` not in `badges`, add it
      3. If `postType == 'DISCOVERY'`: increment `discoveryPostCount`; if new count >= 3
         and `THE_ANALYST` not in `badges`, add it
      4. Calculate today's UTC midnight: `new Date().setUTCHours(0,0,0,0)`; if not already
         in `activeDays`, add it; if `activeDays.length >= 7` and `LOYAL_READER` not in
         `badges`, add it
      5. Write all changes in a single `updateDoc` call
  - **`evaluateBadgesAfterProgress(clubId: string, uid: string, newProgress: number): Promise<void>`**
    - If `newProgress < 100`, return immediately
    - Query `clubs/{clubId}/members` where `progress == 100`
    - If the only result is the current user, and `FIRST_TO_FINISH` is not in their badges:
      add `FIRST_TO_FINISH` to the member's `badges` array

- [ ] T207 [P1] Create capsule repository — `src/repositories/capsuleRepository.ts`
  - **`saveCapsule(capsule: ClubCapsule): Promise<void>`**
    - Write to `capsules/{capsule.clubId}` using `setDoc`
    - After successful write, update `clubs/{clubId}.capsuleId = capsule.clubId`
  - **`getCapsule(clubId: string): Promise<ClubCapsule | null>`**
    - Fetch `capsules/{clubId}`; return null if not found

- [ ] T208 [P1] Create Gemini discussion question generator — `src/utils/geminiClubs.ts`
  - **`suggestDiscussionQuestions(bookTitle: string, bookAuthor: string): Promise<string[]>`**
    - POST to Gemini Flash endpoint with the prompt from `clubs-spec.md` (US18)
    - Parse the numbered list from the response; return `string[]` of 3–5 questions
    - Throws a typed `GeminiError` on API failure or missing key; callers catch and show
      the error message without crashing
  - **`generateCapsuleSummary(params: { clubName: string; bookTitle: string; bookAuthor: string; memberCount: number; totalPosts: number; totalReactions: number; topPostsSample: string; language: string }): Promise<string>`**
    - POST to Gemini Flash with the capsule prompt from `clubs-spec.md` (US21)
    - Returns the raw generated text (3–4 sentences)
    - On failure: throws a typed error; the caller falls back to the placeholder string

- [ ] T209 [P1] Create real-time React hooks for club data — `src/hooks/useClub.ts`
  - **`useClub(clubId: string)`** — `onSnapshot` on `clubs/{clubId}`; returns `{ club: Club | null, loading: boolean }`
  - **`useClubMembers(clubId: string)`** — `onSnapshot` on `clubs/{clubId}/members`
    ordered by `joinedAt asc`; returns `ClubMember[]`
  - **`useClubPosts(clubId: string, limit?: number)`** — `onSnapshot` on
    `clubs/{clubId}/posts` ordered by `createdAt desc`, paginated (default limit: 20);
    returns `{ posts: ClubPost[], loadMore: () => void, hasMore: boolean }`
  - **`useClubTopics(clubId: string)`** — `onSnapshot` on `clubs/{clubId}/topics`
    ordered by `createdAt desc`; returns `ClubDiscussionTopic[]`
  - **`useTopicReplies(clubId: string, topicId: string)`** — `onSnapshot` on
    `clubs/{clubId}/topics/{topicId}/replies` ordered by `createdAt asc`; returns
    `ClubReply[]`
  - **`useUserClubs(uid: string)`** — `onSnapshot` on `userClubs/{uid}/clubs`
    ordered by `joinedAt desc`; returns `Club[]` (joined + created)
  - All hooks: clean up `onSnapshot` subscriptions in `useEffect` return
  - All hooks: guard against unmounted state updates

---

## Phase 30: Club Creation and Joining UI

**Purpose**: The full user flow for creating a new club (moderator) and joining an existing
one via invite code (member). Includes the Clubs landing screen and the club home screen
skeleton.

**Prerequisite gate**: Phase 29 complete.

**Checkpoint**: Moderator can create a club, see the invite code, and a second account can
use the code to join. Both users see each other in the member list.

- [ ] T210 [P1] Add Clubs tab to bottom navigation — `src/components/Layout/Layout.tsx`
  - Add a 6th bottom nav action (or replace an underused tab) for "Clubs" with
    `Groups` Material icon; routes to `/clubs`
  - Update active tab detection to highlight for `/clubs` and `/clubs/...` routes
  - **Note**: The existing 5-tab nav has Home / Library / FAB / Stats / Profile.
    Insert Clubs between Stats and Profile, making it a 6-tab nav (remove the FAB tab if
    space is too tight; the Add Book FAB moves to the LibraryPage only).

- [ ] T211 [P1] Create Clubs landing screen — `src/pages/ClubsPage/ClubsPage.tsx`
  - Use `useUserClubs(uid)` to fetch the user's clubs
  - Render a list of club cards: club name, book title + author, status chip
    (`ACTIVE` = green, `CLOSED` = grey), member count, moderator crown if applicable
  - Two floating action buttons or top-right buttons: "Create Club" and "Join Club"
  - Empty state: "You haven't joined any clubs yet. Create one or enter an invite code."
  - Loading: MUI Skeleton list items while hook returns loading state
  - Navigate to `/clubs/:clubId` when a club card is tapped
  - Route: `/clubs`

- [ ] T212 [P1] Create "Create Club" dialog — `src/components/clubs/CreateClubDialog.tsx`
  - MUI Dialog opened from ClubsPage
  - React Hook Form with fields: Club Name (required, max 80 chars), Book Title (required,
    max 200 chars), Book Author (required, max 100 chars), Description (optional, max 300 chars)
  - On submit: call `createClub(...)` from `clubRepository`; show `CircularProgress` while
    in-flight; on success navigate to `/clubs/:newClubId`; on error show MUI `Alert`
  - Close button cancels without saving

- [ ] T213 [P1] Create "Join Club" dialog — `src/components/clubs/JoinClubDialog.tsx`
  - MUI Dialog opened from ClubsPage
  - Single field: invite code (required; auto-uppercase via `normalizeCode`; shows a
    6-box character display or a plain text input with monospaced font)
  - On submit: call `getClubByInviteCode(code)` → if null show "Invalid code" error;
    if club is `CLOSED` show "This club is no longer accepting members"; if user is
    already a member show "You're already in this club"; else call `joinClub(...)` then
    navigate to `/clubs/:clubId`
  - Loading state on the submit button while the lookup is in-flight

- [ ] T214 [P1] Create Club home screen skeleton — `src/pages/ClubDetailPage/ClubDetailPage.tsx`
  - Route: `/clubs/:clubId`
  - Use `useClub(clubId)` and `useClubMembers(clubId)`
  - Header: back arrow, club name, book title + author subtitle, club status chip
  - Invite code display row (for ACTIVE clubs): "Invite Code: XXXXXX" with copy-to-clipboard
    `IconButton` (`ContentCopy`); only visible to the moderator
  - "Close Club" button (moderator only; ACTIVE only): opens confirmation dialog (see T247)
  - MUI Tabs at the bottom of the header: "Feed" | "Discussions" | "Members"
  - Tab panel areas rendered by child components (T219, T228, T238)
  - Skeleton header while `useClub` is loading
  - If club not found: 404 message with back button

- [ ] T215 [P1] Create Members tab panel — `src/pages/ClubDetailPage/tabs/MembersTab.tsx`
  - Rendered inside ClubDetailPage's "Members" tab
  - Displays all `ClubMember` objects from `useClubMembers(clubId)`
  - Each row: MUI `Avatar` (from `photoURL` or initials fallback), display name,
    crown icon if moderator, progress badge ("X%"), earned badge chips
  - Badges rendered as small colored chips with short label (e.g. "🔥 First to finish")
  - "Update my progress" button (own row only): opens an inline `Slider` (0–100) or
    number input; on submit calls `updateDoc` on the member's own document with new progress
    and calls `evaluateBadgesAfterProgress()`

- [ ] T216 [P1] Add `/clubs` and `/clubs/:clubId` routes to router — `src/App.tsx`
  - Register `ClubsPage` at `/clubs`
  - Register `ClubDetailPage` at `/clubs/:clubId`
  - Both routes require authentication; redirect to sign-in if `!user`

- [ ] T217 [P1] Add `userClubs` Firestore path to Security Rules description in
  `clubs-data-model.md` (documentation update only) — no code change
  - Rule: `userClubs/{uid}/clubs/{clubId}`: read + write only by the matching `uid`
  - Note in the spec that this mirror collection is written by the client via the repository

---

## Phase 31: Club Feed and Emoji Reactions

**Purpose**: The club feed — posting quotes and discoveries, viewing posts in real time,
and reacting with emoji. This is the primary social surface of the club.

**Prerequisite gate**: Phase 30 complete (ClubDetailPage tabs exist).

**Checkpoint**: Two accounts in the same club can post to the feed and see each other's
posts in real time. Emoji reactions toggle correctly and update counts on both devices
without refresh.

- [ ] T218 [P1] Create Feed tab panel — `src/pages/ClubDetailPage/tabs/FeedTab.tsx`
  - Rendered inside ClubDetailPage's "Feed" tab
  - Use `useClubPosts(clubId)` for real-time post list
  - Render posts as a vertical list (newest first) — each item is a `ClubPostCard`
    component (see T219)
  - "Load more" button at bottom (triggers `loadMore()` from hook) when `hasMore` is true
  - Compose button: MUI `Fab` (terracotta, pencil icon) fixed bottom-right; visible only
    when club is `ACTIVE`; opens `ComposePostDialog` (T220)
  - Empty state: "Be the first to post a quote or discovery" with pencil icon
  - Loading: 3 `SkeletonCard` rows while hook returns loading

- [ ] T219 [P1] Create ClubPostCard component — `src/components/clubs/ClubPostCard.tsx`
  - Props: `post: ClubPost`, `currentUid: string`, `clubStatus: ClubStatus`
  - Header row: avatar, author name, post type chip (`Quote` / `Discovery`),
    relative time (e.g. "2h ago")
  - Body: post text; if `pageNumber` is set, show "p. {pageNumber}" in muted caption
  - Reaction row: four emoji buttons showing `fire`, `laugh`, `cry`, `mindblown` with
    their counts; buttons disabled when club is `CLOSED`; active state when the current
    user has reacted with that emoji
  - On emoji tap: call `toggleReaction(clubId, postId, uid, emoji)` from `postRepository`
  - Author's own posts: show a `DeleteOutlined` icon button; on click show a confirmation
    `Snackbar` with "Undo" action (or a simple confirm dialog); on confirm call `deletePost()`
  - Use `memo()` to avoid re-rendering unchanged posts when the feed updates

- [ ] T220 [P1] Create ComposePostDialog — `src/components/clubs/ComposePostDialog.tsx`
  - MUI Dialog; opened from FeedTab Fab button
  - Post type selector: two MUI `ToggleButton`s — "💬 Quote" / "💡 Discovery"
  - Conditional fields:
    - QUOTE: text area (required, max 500 chars, shows character count); optional page number
      input (numeric, min 1)
    - DISCOVERY: text area (required, max 300 chars, shows character count)
  - Submit button: calls `addPost(clubId, { ... })` from `postRepository`;
    shows loading state; closes on success; shows `Alert` on error
  - Cancel closes without posting

- [ ] T221 [P1] Wire reaction state to current user — `src/pages/ClubDetailPage/tabs/FeedTab.tsx`
  - For each post, fetch the current user's reaction from `posts/{postId}/reactions/{uid}`
    to determine which emoji button should appear "active"
  - **Implementation note**: fetching individual reaction docs for every post on mount
    would cause N+1 reads. Instead, for each visible post subscribe to a snapshot of
    `posts/{postId}/reactions` filtered to `uid == currentUid` (small collection: at most
    4 documents per post per user). Cache the subscription results in a `Map<postId, ReactionEmoji | null>`
    local state.
  - Alternative (simpler for MVP): add a `userReactions: Record<string, ReactionEmoji>` field
    to the `FeedTab` state, populated lazily on first render of each `ClubPostCard`

- [ ] T222 [P1] Add feed post count aggregation utility — `src/utils/clubAggregations.ts`
  - **`getTotalPostCount(clubId: string): Promise<number>`**
    - `getCountFromServer` on `clubs/{clubId}/posts` collection
    - Used during capsule generation (T244) to populate `totalPosts`
  - **`getTotalReactionCount(clubId: string): Promise<number>`**
    - Fetch all posts and sum `reactionCounts.fire + laugh + cry + mindblown` across all docs
    - Used during capsule generation (T244) to populate `totalReactions`
  - **`getTopPostsSample(clubId: string, n?: number): Promise<string>`**
    - Fetch the `n` (default 5) highest-reacted posts; concatenate their text into a
      single newline-separated string for the Gemini prompt
    - Rank by total reactions: `sum(Object.values(reactionCounts))`

- [ ] T223 [P1] Add i18n keys for feed UI — `src/locales/en.json` + `src/locales/es.json`
  - Keys to add (EN → ES):
    - `club.feed.empty` → "Be the first to post a quote or discovery" / "Sé el primero en publicar"
    - `club.feed.compose` → "Compose" / "Publicar"
    - `club.post.quote` → "Quote" / "Cita"
    - `club.post.discovery` → "Discovery" / "Descubrimiento"
    - `club.post.delete` → "Delete post" / "Eliminar publicación"
    - `club.reaction.fire` → "🔥" / "🔥"
    - `club.feed.loadMore` → "Load more" / "Ver más"

- [ ] T224 [P1] Write Firestore Security Rule for posts — document-only (no code file)
  - Ensure post `create` rules check `request.resource.data.authorUid == request.auth.uid`
    and `get(/databases/$(database)/documents/clubs/$(clubId)).data.status == 'ACTIVE'`
  - Ensure post `update` only allows the `reactionCounts` field (all other fields immutable
    after creation)
  - Add rules for `reactions` subcollection: `create` and `delete` only by `request.auth.uid == uid`

- [ ] T225 [P1] Add pagination cursor to `useClubPosts` hook — `src/hooks/useClub.ts`
  - Extend the hook to track a `lastVisible` Firestore document snapshot
  - `loadMore()` runs a new query starting `after(lastVisible)` and appends results to
    the existing `posts` array
  - Hook returns `{ posts, loadMore, hasMore, loading }`

- [ ] T226 [P1] Manual real-time test — no file change
  - Open the club on two browser tabs logged in as two different users
  - Post from tab 1 → verify feed updates on tab 2 without refresh
  - React with 🔥 from tab 2 → verify count increments on tab 1
  - Mark this task done when both behaviors are confirmed

---

## Phase 32: Discussions and AI-Generated Questions

**Purpose**: Structured discussion threads (moderator-created topics, member replies)
and the Gemini-powered question suggestion feature.

**Prerequisite gate**: Phase 31 complete (FeedTab exists as reference pattern).

**Checkpoint**: Moderator can create a topic; members can reply; replies appear in real
time. "Suggest questions with AI" returns 3–5 relevant questions that can be pre-filled
into the topic form.

- [ ] T227 [P2] Create Discussions tab panel — `src/pages/ClubDetailPage/tabs/DiscussionsTab.tsx`
  - Rendered inside ClubDetailPage's "Discussions" tab
  - Use `useClubTopics(clubId)` for real-time topic list
  - Render topics as MUI `List` items: topic title, reply count chip, relative time,
    "AI" badge chip if `isAiGenerated == true`
  - Tapping a topic navigates to `/clubs/:clubId/topics/:topicId` (see T229)
  - "New Topic" button (moderator only, ACTIVE club): opens `NewTopicDialog` (T228)
  - "Suggest questions with AI" button (moderator only, ACTIVE club): calls
    `suggestDiscussionQuestions()` from `geminiClubs.ts`; shows loading state; renders
    results as chips below the button (see T231)
  - Empty state: "The moderator hasn't started any discussions yet"
  - Read-only mode when club is `CLOSED`: list visible, compose buttons hidden

- [ ] T228 [P2] Create NewTopicDialog — `src/components/clubs/NewTopicDialog.tsx`
  - MUI Dialog; props: `clubId: string`, `initialTitle?: string`, `onClose: () => void`
  - `initialTitle` is pre-filled when triggered from an AI suggestion chip
  - Fields: Title (required, max 200 chars), Description (optional, max 500 chars)
  - Checkbox: "Mark as AI-generated" (auto-checked when `initialTitle` is provided via
    Gemini; hidden from the user; sets `isAiGenerated: true` on the document)
  - Submit: calls `addTopic()` from `discussionRepository`; closes on success

- [ ] T229 [P2] Create Topic Detail screen — `src/pages/TopicDetailPage/TopicDetailPage.tsx`
  - Route: `/clubs/:clubId/topics/:topicId`
  - Use `useTopicReplies(clubId, topicId)` for real-time reply list
  - Header: back arrow, topic title, description (if set), reply count
  - Reply list: oldest-first chronological thread; each reply shows avatar, author name,
    text, relative time
  - Compose area at bottom (when club is ACTIVE): text area (max 1000 chars) + "Reply"
    button; calls `addReply()` from `discussionRepository`; textarea clears on success
  - Loading: Skeleton rows while hook initialises
  - Empty state: "No replies yet — be the first to share your thoughts"
  - Register route in `src/App.tsx`

- [ ] T230 [P2] Create ReplyCard component — `src/components/clubs/ReplyCard.tsx`
  - Props: `reply: ClubReply`, `currentUid: string`
  - Layout: MUI `Avatar` + display name + relative time in a header row; reply text below
  - Author's own replies: `DeleteOutlined` icon button; on confirm calls `deleteDoc` on
    the reply doc and decrements `topics/{topicId}.replyCount` via transaction
  - No reaction system on replies (MVP scope)

- [ ] T231 [P2] Implement AI question suggestions UI — `src/pages/ClubDetailPage/tabs/DiscussionsTab.tsx`
  (extend T227)
  - "Suggest questions with AI" button triggers `suggestDiscussionQuestions(bookTitle, bookAuthor)`
  - While loading: `CircularProgress` replaces button text; button disabled
  - On success: render 3–5 `Chip` components below the button with question text
    (truncated to 60 chars + "…" with full text in `title` attribute)
  - On chip click: open `NewTopicDialog` with `initialTitle` set to the question text
  - On Gemini error: show MUI `Alert` with message from the caught error
  - Suggestions dismissed when the user taps away or creates a topic

- [ ] T232 [P2] Add i18n keys for discussions UI — `src/locales/en.json` + `src/locales/es.json`
  - Keys to add (EN → ES):
    - `club.discussions.empty` → "No discussions yet" / "Aún no hay discusiones"
    - `club.discussions.newTopic` → "New Topic" / "Nuevo tema"
    - `club.discussions.suggestAI` → "Suggest questions with AI" / "Sugerir preguntas con IA"
    - `club.discussions.aiLabel` → "AI" / "IA"
    - `club.replies.empty` → "No replies yet" / "Aún no hay respuestas"
    - `club.replies.compose` → "Write a reply…" / "Escribe una respuesta…"
    - `club.replies.submit` → "Reply" / "Responder"
    - `club.ai.error` → "AI suggestions unavailable — enter a topic manually" / "Sugerencias de IA no disponibles"

- [ ] T233 [P2] Add Firestore Security Rules for topics and replies — documentation only
  - Topics: `create` allowed only when `request.auth.uid == get(club).data.moderatorUid`
  - Replies: `create` allowed for any club member; `authorUid` must equal `request.auth.uid`
  - Both: `delete` allowed only by document author
  - Topics: `update` only permitted on the `replyCount` field (incremented via transaction)

- [ ] T234 [P2] Register topic detail route and add nav — `src/App.tsx`
  - Add `<Route path="/clubs/:clubId/topics/:topicId" element={<TopicDetailPage />} />`
    as a child of the clubs route group
  - Confirm `useParams()` resolves both `:clubId` and `:topicId` in `TopicDetailPage`

---

## Phase 33: Gamification, Badges, and Progress Sharing

**Purpose**: The member progress display on the club home (avatar + percentage in real
time) and the badge system (four badges, awarded automatically on triggering events).

**Prerequisite gate**: Phase 31 complete (member documents and post writes exist).

**Checkpoint**: All four badges are awarded at the correct trigger points. Progress updates
on the Members tab in real time when a member changes their percentage.

- [ ] T235 [P2] Wire badge evaluation into post writes — `src/repositories/postRepository.ts`
  (extend T204)
  - After a successful `addPost` write, call `evaluateBadgesAfterPost(clubId, uid, postType)`
    from `badgeEvaluator.ts`
  - Confirm the call is fire-and-forget within the async flow (do not `await` if badge
    failure should not block the post write; wrap in `try/catch` and log to console)

- [ ] T236 [P2] Wire badge evaluation into progress update — `src/pages/ClubDetailPage/tabs/MembersTab.tsx`
  (extend T215)
  - After the member's progress is written to Firestore, call
    `evaluateBadgesAfterProgress(clubId, uid, newProgress)`
  - Show a congratulatory `Snackbar` if a new badge was awarded (badge evaluation must
    return the list of newly awarded badges)
  - Update `evaluateBadgesAfterProgress` signature to return `BadgeId[]` (newly awarded)

- [ ] T237 [P2] Create BadgeChip component — `src/components/clubs/BadgeChip.tsx`
  - Props: `badge: BadgeId`, `size?: 'small' | 'medium'`
  - Renders a MUI `Chip` with an appropriate icon and label per badge:
    - `FIRST_TO_FINISH` → 🏅 "Primero en terminar" / "First to finish"
    - `QUOTE_MASTER` → 📖 "Quote master"
    - `LOYAL_READER` → 💪 "Lector fiel" / "Loyal reader"
    - `THE_ANALYST` → 🔍 "El analítico" / "The analyst"
  - Badge display name uses `useTranslation` with keys `badge.FIRST_TO_FINISH`, etc.
  - Add corresponding i18n keys to `src/locales/en.json` and `src/locales/es.json`

- [ ] T238 [P2] Integrate progress sharing and badges into MembersTab — `src/pages/ClubDetailPage/tabs/MembersTab.tsx`
  (extend T215)
  - Use `useClubMembers(clubId)` — already real-time via `onSnapshot`
  - Each member card:
    - `Avatar` with first-letter fallback when `photoURL` is null
    - Display name + crown `Tooltip` if `role == 'MODERATOR'`
    - Progress: `LinearProgress` (MUI, terracotta color) + "X%" text; if 100% show
      `CheckCircle` icon instead of progress bar
    - Badges: row of `BadgeChip` components (size "small"); hidden when `badges.length == 0`
  - Own member row: "Update progress" inline action (Slider or numeric input in a
    collapsible row); submits `updateDoc` + `evaluateBadgesAfterProgress`
  - Sort order: moderator first, then members by `progress` descending

- [ ] T239 [P2] Add progress update validation — `src/pages/ClubDetailPage/tabs/MembersTab.tsx`
  - The progress input must accept only integers 0–100
  - Prevent writing progress < current value without an explicit confirmation (optional
    for MVP — simple validation that warns "This will lower your progress" with a confirm)
  - On successful update, show "Progress updated" `Snackbar`

- [ ] T240 [P2] Add i18n keys for badges and progress — `src/locales/en.json` + `src/locales/es.json`
  - `badge.FIRST_TO_FINISH` → "First to finish" / "Primero en terminar"
  - `badge.QUOTE_MASTER` → "Quote master" / "Quote master"
  - `badge.LOYAL_READER` → "Loyal reader" / "Lector fiel"
  - `badge.THE_ANALYST` → "The analyst" / "El analítico"
  - `club.members.progress` → "Reading progress" / "Progreso de lectura"
  - `club.members.updateProgress` → "Update my progress" / "Actualizar mi progreso"
  - `club.members.badgesEarned` → "Badges earned" / "Insignias obtenidas"
  - `club.members.newBadge` → "New badge earned!" / "¡Nueva insignia obtenida!"

- [ ] T241 [P2] Add Firestore Security Rule for member progress update — documentation only
  - Member `update` allowed only when `request.auth.uid == uid` (the document ID)
  - Only these fields may be updated by the member themselves: `progress`, `badges`,
    `quotePostCount`, `discoveryPostCount`, `activeDays`
  - `role`, `joinedAt`, `uid`, `displayName`, `photoURL` are immutable after creation

---

## Phase 34: Club Closure and Memory Capsule

**Purpose**: The full lifecycle close — moderator closes the club, Gemini generates a
narrative summary, the capsule is stored permanently in Firestore, and any member can
view it forever.

**Prerequisite gate**: Phases 31 and 33 complete (post counts and member badge data
must be accurate before capsule generation).

**Checkpoint**: After moderator closes a club: club becomes read-only, capsule is stored in
`capsules/{clubId}`, the capsule view renders with the Gemini summary and member snapshots.
Sign out and sign back in — capsule is still accessible.

- [ ] T242 [P1] Create CloseClubDialog — `src/components/clubs/CloseClubDialog.tsx`
  - MUI `Dialog`; props: `clubId: string`, `clubName: string`, `onClose: () => void`
  - Warning text: "Closing «{clubName}» cannot be undone. The club feed and discussions
    will be locked, and a memory capsule will be generated."
  - Two action buttons: "Cancel" and "Close Club" (`color="error"`)
  - On confirm: calls the closure flow (see T243); shows linear progress while in-flight
  - After completion: navigates to `/clubs/:clubId/capsule`

- [ ] T243 [P1] Implement club closure flow — `src/repositories/capsuleRepository.ts`
  (extend T207)
  - **`closeClubAndGenerateCapsule(clubId: string, currentUser: { uid: string; displayName: string }): Promise<void>`**
    1. Call `closeClub(clubId)` to set `status: 'CLOSED'` on the club document
    2. Fetch all members via `getDocs(collection(clubs/{clubId}/members))`
    3. Collect `memberSnapshots` from the current member documents
    4. Call `getTotalPostCount(clubId)` and `getTotalReactionCount(clubId)` from `clubAggregations.ts`
    5. Call `getTopPostsSample(clubId, 5)` to get the text sample for Gemini
    6. Fetch the club document to get `clubName`, `bookTitle`, `bookAuthor`
    7. Call `generateCapsuleSummary(...)` from `geminiClubs.ts`; if it throws, use the
       fallback string: `"Summary could not be generated. The club memories are preserved above."`
    8. Construct a `ClubCapsule` object and call `saveCapsule(capsule)`
    9. On any error after step 1: club is already closed — log the error but do not revert
       the closure; continue with partial capsule data

- [ ] T244 [P1] Create CapsulePage — `src/pages/CapsulePage/CapsulePage.tsx`
  - Route: `/clubs/:clubId/capsule`
  - Use `getCapsule(clubId)` from `capsuleRepository` (single `getDoc`, not real-time)
  - If capsule not found but club is CLOSED: show a "Capsule generation in progress" state
    with auto-retry after 3 seconds (max 3 retries, then show error)
  - If capsule not found and club is ACTIVE: redirect to `/clubs/:clubId`
  - **Capsule layout**:
    - Full-width hero: book title + author in large type; "Club: {clubName}" subtitle;
      closure date formatted as "Closed on D MMMM YYYY"
    - AI summary section: italic paragraph of `generatedSummary`; a small "Generated by AI"
      caption below
    - Stats row: 3 chips — "{memberCount} members", "{totalPosts} posts",
      "{totalReactions} reactions"
    - Members section: grid of member cards — avatar, name, "X% read", badge chips
    - Footer: "This memory capsule is preserved forever" in muted caption

- [ ] T245 [P1] Navigate to capsule from closed club home — `src/pages/ClubDetailPage/ClubDetailPage.tsx`
  (extend T214)
  - When `club.status == 'CLOSED'` and `club.capsuleId` is set: show a prominent
    "View Memory Capsule" `Button` (`variant="outlined"`) in the club header
  - The button navigates to `/clubs/:clubId/capsule`
  - Feed and Discussions tabs remain accessible but all compose actions are hidden
  - Members tab shows the final progress snapshot in read-only mode

- [ ] T246 [P1] Register capsule route — `src/App.tsx`
  - Add `<Route path="/clubs/:clubId/capsule" element={<CapsulePage />} />`

- [ ] T247 [P1] Wire CloseClubDialog into ClubDetailPage — `src/pages/ClubDetailPage/ClubDetailPage.tsx`
  (extend T214)
  - Add "Close Club" `Button` to the header; visible only to the moderator when club is `ACTIVE`
  - On tap: open `CloseClubDialog`
  - Pass `clubId` and `clubName` as props to the dialog

- [ ] T248 [P1] Add i18n keys for closure and capsule — `src/locales/en.json` + `src/locales/es.json`
  - `club.close.title` → "Close Club" / "Cerrar club"
  - `club.close.warning` → "Closing this club cannot be undone. The club feed and discussions will be locked, and a memory capsule will be generated." / "Cerrar este club no se puede deshacer. El feed y las discusiones quedarán bloqueados, y se generará una cápsula de recuerdos."
  - `club.close.confirm` → "Close Club" / "Cerrar club"
  - `club.capsule.title` → "Memory Capsule" / "Cápsula de recuerdos"
  - `club.capsule.generated` → "Generated by AI" / "Generado por IA"
  - `club.capsule.preserved` → "This memory capsule is preserved forever" / "Esta cápsula de recuerdos se conserva para siempre"
  - `club.capsule.view` → "View Memory Capsule" / "Ver cápsula de recuerdos"
  - `club.capsule.membersCount` → "{count} members" / "{count} miembros"
  - `club.capsule.postsCount` → "{count} posts" / "{count} publicaciones"
  - `club.capsule.reactionsCount` → "{count} reactions" / "{count} reacciones"
  - `club.capsule.summaryFallback` → "Summary could not be generated. The club memories are preserved above." / "No se pudo generar el resumen. Los recuerdos del club están preservados arriba."

---

## Dependencies and Execution Order

### Phase Dependencies

```
Phase 29 (Infrastructure)
  ├── Phase 30 (Creation + Joining UI)
  │     ├── Phase 31 (Feed + Reactions)
  │     │     ├── Phase 32 (Discussions + AI)
  │     │     └── Phase 33 (Badges + Progress)
  │     │           └── Phase 34 (Closure + Capsule)
  │     └── (Phase 34 also depends on Phase 33)
```

Phase 29 must be complete before any other phase begins. Within Phase 29, all T200–T209
tasks are parallelizable.

### Within Phase Parallelization

| Phase | Parallel tasks | Sequential dependency |
|---|---|---|
| 29 | T200–T209 (all) | None — all independent |
| 30 | T211–T213, T215–T217 | T210 (nav) → T211 (page); T212 + T213 require T202 |
| 31 | T218–T222, T223–T225 | T218 → T219; T219 → T221 |
| 32 | T227–T228, T229–T230, T232–T233 | T228 → T231; T229 → T230 |
| 33 | T237–T238, T240 | T235 → T236 → T238; T237 is independent |
| 34 | T242, T244–T248 | T243 → T242 + T244; T247 needs T242 done |

### Total Tasks: 49

| Phase | Tasks | P1 Priority | P2 Priority |
|---|---|---|---|
| Phase 29 — Infrastructure | T200–T209 (10) | T200–T209 | — |
| Phase 30 — Creation + Joining | T210–T217 (8) | T210–T217 | — |
| Phase 31 — Feed + Reactions | T218–T226 (9) | T218–T226 | — |
| Phase 32 — Discussions + AI | T227–T234 (8) | — | T227–T234 |
| Phase 33 — Badges + Progress | T235–T241 (7) | — | T235–T241 |
| Phase 34 — Closure + Capsule | T242–T248 (7) | T242–T248 | — |

P1 tasks (Phases 29, 30, 31, 34) constitute the MVP: a working club with a feed, a create/join
flow, and a closure capsule. P2 tasks (Phases 32, 33) add discussions, AI questions, badges,
and progress sharing in the subsequent iteration.
