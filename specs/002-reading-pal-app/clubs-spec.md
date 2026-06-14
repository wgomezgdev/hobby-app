# Feature Specification: Reading Clubs

**Feature Branch**: `002-reading-pal-app`

**Created**: 2026-06-13

**Status**: Draft

---

## Overview

### Vision

Reading clubs bring a social layer to Reading Pal without turning it into a social network.
A club is a small, intentional group — a closed space where a few people read the same book
together, share what strikes them, debate ideas, and close the chapter as a collective memory.

The design philosophy is intimacy over scale. Every club has one book, one moderator, and a
fixed membership. There are no public feeds, no follower counts, no algorithmic timelines.
Just a private room where reading becomes shared.

### Scope

This specification covers the following capabilities:

- **Moderator tools**: create a club, pick the book of the month, generate an invite code,
  propose discussion topics (with optional AI assistance), and eventually close the club.
- **Member tools**: join via invite code, post quotes and discoveries to the shared feed,
  react to others' posts, reply to discussion threads, and track personal reading progress.
- **Real-time feed**: all club activity is reflected immediately across all members' devices
  via Firestore `onSnapshot` listeners. Five post types are supported: Quote, Discovery,
  Hot take, Question, and Vocabulary (Word). Posts support optional chapter tagging.
  Moderators can pin up to 2 posts.
- **Gamification**: four badges per club awarded automatically based on reading behavior.
- **Memory capsule**: when the moderator closes a club, Gemini generates a summary of the
  group's shared experience, stored forever as a consultable artefact.

### Out of Scope for MVP

- Push notifications (no FCM in MVP)
- Image or file uploads in posts (text and quoted passages only)
- Email-based invitations (invite code only)
- Multiple books per club (one book per club lifetime)
- Public or discoverable clubs (invite-code access only)
- Club membership cap enforcement (soft limit: moderator controls invite sharing)

### Architecture Summary

Club data is cloud-first and stored entirely in Firestore, separate from the personal
reading data that lives in Dexie/IndexedDB. A signed-in Firebase user (via Firebase Auth)
is required to participate in any club. All club writes go directly to Firestore; reads use
`onSnapshot` for real-time updates. The personal `users/{uid}/books` Firestore path
(introduced in Phase 26) is unaffected by clubs.

---

## User Scenarios & Testing

---

### User Story 14 — Create a Reading Club (Priority: P1)

A moderator wants to create a reading club for their group, choose the book they will read
together, and share the generated invite code so members can join.

**Why this priority**: Creating a club is the entry gate to every other club feature. Without
a club, members have nothing to join and there is no feed, no discussions, no capsule. This
is the starting point of the social graph.

**Independent Test**: Sign in → navigate to Clubs tab → tap "Create Club" → fill in the
club name, select a book (title + author), and submit → confirm club appears in the Clubs
list with status "Active" → confirm a 6-character alphanumeric invite code is displayed →
share the code manually and verify a second account can join with it (US15).

**Acceptance Scenarios**:

1. **Given** the user is signed in, **When** they tap "Create Club" on the Clubs screen,
   **Then** a form opens with fields for: Club Name (required), Book Title (required),
   Book Author (required), and an optional description.
2. **Given** the form is complete, **When** the user submits, **Then** a new club document
   is created in Firestore, the user is set as the moderator, a 6-character alphanumeric
   invite code is generated and stored on the club, and the user is navigated to the
   new club's home screen.
3. **Given** the club is created, **When** the moderator views the club home, **Then** the
   invite code is prominently displayed with a copy-to-clipboard button.
4. **Given** the moderator copies the code, **When** they share it out-of-band, **Then**
   the code can be entered by any signed-in user to join the club (see US15).
5. **Given** the club name or book title is empty, **When** the user tries to submit,
   **Then** inline validation errors appear and the form is not submitted.
6. **Given** the user is already a moderator of two or more active clubs, **When** they
   try to create another, **Then** the creation proceeds with no artificial limit
   (moderation is the user's responsibility for MVP).

---

### User Story 15 — Join a Reading Club (Priority: P1)

A member wants to enter a 6-character invite code shared by the moderator and immediately
gain access to the club's home screen, feed, and discussion threads.

**Why this priority**: Without a way to join, a club is a room with a locked door. This
story enables all downstream participation features (US16, US17, US19, US20).

**Independent Test**: Sign in with a non-moderator account → navigate to Clubs → tap "Join
Club" → enter the 6-character code → confirm navigated to the club home showing the book
and existing members → confirm the new member appears in the member list for the moderator.

**Acceptance Scenarios**:

1. **Given** the user is signed in, **When** they tap "Join Club" and enter a valid 6-character
   invite code, **Then** they are added to the club's members sub-collection in Firestore
   with role `member`, joined timestamp, and initial progress of 0%.
2. **Given** the user joins successfully, **When** the navigation completes, **Then** they
   land on the club home screen showing the book cover (if available), book title and author,
   member list with avatars, and their own reading progress initialised to 0%.
3. **Given** the invite code does not match any club, **When** the user submits, **Then**
   an error message "Invalid or expired invite code" is shown and no navigation occurs.
4. **Given** the user is already a member of the club, **When** they try to join again with
   the same code, **Then** a message "You are already a member of this club" is shown.
5. **Given** the club is closed (status `CLOSED`), **When** the user enters the code,
   **Then** a message "This club is no longer accepting members" is shown.
6. **Given** the user enters a code in mixed case, **When** they submit, **Then** the lookup
   is case-insensitive (codes are stored and compared in uppercase).

---

### User Story 16 — Club Feed: Posts and Emoji Reactions (Priority: P1)

A member wants to share quotes and discoveries from their reading with the group in real
time, and react to other members' posts with emoji to acknowledge what resonates.

**Why this priority**: The feed is the primary social surface of the club. Without it there
is nothing to see or share — the club is an empty room. Emoji reactions make it feel alive
without requiring lengthy responses.

**Independent Test**: Open a club → tap "Post" → select type "Quote" → enter the quote text
and page number → submit → confirm the post appears at the top of the feed immediately →
from a second device (same club, different user), confirm the post appears without refreshing →
tap the 🔥 reaction → confirm the count increments in real time on both devices.

**Acceptance Scenarios**:

1. **Given** a member is on the club home or feed tab, **When** they tap the compose button,
   **Then** they can choose one of five post types: Quote (💬), Discovery (💡), Hot take (🌶️),
   Question (❓), or Word (📚).
2. **Given** the member selects "Quote", **When** they compose the post, **Then** they can
   enter: the quoted text (required, max 500 chars), optional page number, and an optional
   chapter tag (max 30 chars, e.g. "Ch. 3").
3. **Given** the member selects "Discovery", **When** they compose the post, **Then** they
   can enter free text (required, max 300 chars) describing a connection or insight, plus
   an optional chapter tag.
4. **Given** the member selects "Hot take", **When** they compose the post, **Then** they
   can enter a bold opinion or prediction (required, max 200 chars) plus an optional chapter
   tag. The post renders with a distinct 🌶️ chip to signal it is opinionated.
5. **Given** the member selects "Question", **When** they compose the post, **Then** they
   can enter a question directed at other members (required, max 200 chars). The post renders
   with a ❓ chip, inviting replies in the feed via emoji reactions.
6. **Given** the member selects "Word", **When** they compose the post, **Then** they can
   enter a word or phrase from the book (required, max 50 chars) and an optional definition
   or note about why it stood out (max 200 chars). Displayed as a vocabulary card.
7. **Given** a post is submitted, **When** it is written to Firestore, **Then** it appears
   at the top of every club member's feed immediately via `onSnapshot` — no manual refresh.
8. **Given** a post is in the feed, **When** any member taps an emoji reaction (🔥 😂 😢 🤯),
   **Then** the reaction count for that emoji increments and the change is reflected in
   real time across all connected members.
9. **Given** a member has already reacted with a specific emoji on a post, **When** they tap
   the same emoji again, **Then** their reaction is removed (toggle behavior).
10. **Given** there are many posts in the feed, **When** the user scrolls to the bottom,
    **Then** older posts are loaded (pagination via Firestore cursor).
11. **Given** no posts have been made yet, **When** a member views the feed, **Then** an
    empty state with a prompt "Be the first to post a quote or discovery" is shown.
12. **Given** the member is the author of a post, **When** they long-press it, **Then** a
    delete option appears; confirming removes the post from Firestore.
13. **Given** the moderator long-presses any post in an ACTIVE club, **When** they choose
    "Pin post", **Then** the post is marked `isPinned: true` and floats to a "Pinned" section
    at the top of the feed. A maximum of 2 posts may be pinned simultaneously; pinning a
    third unpins the oldest pinned post automatically.
14. **Given** a post has a `chapterTag` set, **When** it renders in the feed, **Then** the
    chapter tag appears as a small muted chip (e.g. "Ch. 3") below the post header.

---

### User Story 17 — Discussions: Threaded Replies (Priority: P2)

A moderator wants to propose a discussion topic or question about the book. Members then
reply in a thread, enabling focused conversation around a single prompt.

**Why this priority**: Unstructured feeds tend toward isolated posts rather than dialogue.
Discussions create structured conversation and deepen engagement with the book. This is
prioritised P2 because the feed (US16) must be functional first.

**Independent Test**: As moderator → Discussions tab → "New Topic" → enter a question →
submit → confirm topic appears in the list → switch to member account → open the topic →
enter a reply → submit → confirm reply appears in the thread → switch back to moderator
account → confirm reply visible without refreshing.

**Acceptance Scenarios**:

1. **Given** the moderator is on the Discussions tab, **When** they tap "New Topic",
   **Then** a form opens with a topic title (required) and an optional longer description.
2. **Given** the form is complete, **When** the moderator submits, **Then** the new topic
   appears at the top of the Discussions list for all members in real time.
3. **Given** a topic exists, **When** any member opens it, **Then** they see the topic
   title, description, and a chronological list of replies.
4. **Given** a member is viewing a topic, **When** they submit a reply (text, max 1000 chars),
   **Then** the reply is added to the thread and visible to all members immediately.
5. **Given** multiple replies exist, **When** a new reply arrives, **Then** the thread
   updates in real time via `onSnapshot` without a page reload.
6. **Given** a closed club, **When** members view discussions, **Then** they can read all
   topics and replies but the compose UI is hidden — no new posts or replies.
7. **Given** no topics exist, **When** a member opens the Discussions tab, **Then** an empty
   state "The moderator hasn't started any discussions yet" is shown.

---

### User Story 18 — AI-Generated Discussion Questions (Priority: P2)

A moderator wants the app to suggest thoughtful discussion questions about the current book,
powered by Gemini, so they do not have to come up with every topic from scratch.

**Why this priority**: Generating good discussion questions requires effort. Gemini
assistance reduces friction for moderators and leads to richer conversations. Depends on
US17 (discussions) being in place first.

**Independent Test**: As moderator → Discussions tab → "Suggest questions with AI" → confirm
a loading state → confirm 3–5 discussion questions appear related to the club's book → tap
one → confirm it pre-fills the New Topic form → submit → confirm topic created.

**Acceptance Scenarios**:

1. **Given** the moderator is on the Discussions tab, **When** they tap "Suggest questions
   with AI", **Then** a request is sent to Gemini Flash with the club's book title and author.
2. **Given** the request succeeds, **When** the response is parsed, **Then** 3–5 discussion
   questions are displayed as selectable chips or cards below the button.
3. **Given** a question is displayed, **When** the moderator taps it, **Then** the New Topic
   form opens with the question pre-filled as the topic title.
4. **Given** the moderator submits the pre-filled form, **When** the topic is created,
   **Then** it appears in the discussion list exactly as if they had typed it manually.
5. **Given** the Gemini API key is missing or the quota is exceeded, **When** the moderator
   taps the suggestion button, **Then** a clear error message is shown ("AI suggestions
   unavailable — enter a topic manually") with no disruption to manual topic creation.
6. **Given** Gemini returns questions, **When** the moderator has already created 5+ topics,
   **Then** the suggestions are still shown; there is no cap on how many topics a club may have.

**Prompt** (sent to Gemini Flash):
```
The following reading club is reading «{bookTitle}» by {bookAuthor}.
Generate 5 open-ended discussion questions that would spark thoughtful conversation
about this book's themes, characters, and ideas.
Return exactly 5 questions, one per line, numbered 1–5. No preamble, no extra text.
```

---

### User Story 19 — Progress Sharing on Club Home (Priority: P2)

A member wants to see at a glance how far along each person in the club is with the book —
without it feeling like a race or creating pressure to read faster.

**Why this priority**: Shared progress creates soft accountability and a sense of collective
journey. The framing is curiosity and solidarity, not competition. Builds on the member data
already created in US15.

**Independent Test**: Member A logs progress to 45% → open the club home on Member B's
device → confirm Member A's avatar shows 45% → Member A logs further progress to 80% →
without refreshing on Member B's device, confirm the percentage updates in real time.

**Acceptance Scenarios**:

1. **Given** a member is on the club home screen, **When** the screen loads, **Then** all
   club members are displayed in a horizontal or grid layout showing: their display name,
   avatar photo (from Firebase Auth), and their current reading progress as a percentage.
2. **Given** a member updates their reading progress, **When** the change is written to
   Firestore, **Then** all other members see the updated percentage in real time without
   refreshing.
3. **Given** a member has not yet reported any progress, **When** their entry is shown,
   **Then** a "0%" or "Not started" label is displayed with no judgment framing.
4. **Given** any member reaches 100%, **When** the club home screen refreshes, **Then**
   their entry shows a completion indicator (e.g. a checkmark) distinct from the progress bar.
5. **Given** there is a moderator in the club, **When** their entry is displayed, **Then**
   a subtle moderator badge (crown icon) distinguishes them from regular members.
6. **Given** the club is closed, **When** any member views the club home, **Then** the
   final progress snapshot is still visible — it is preserved in the closure document.
7. **Given** a member updates their reading progress, **When** the update screen is shown,
   **Then** they can also set their pace status: 📖 "Reading along" (`ON_TRACK`), 🐢 "Taking
   my time" (`BEHIND`), or ✅ "Finished!" (`FINISHED`). The pace status is optional — it
   defaults to null and can remain unset.
8. **Given** a member has set a pace status, **When** their card is displayed in the members
   list, **Then** the pace status emoji and label appear below their progress percentage,
   giving a warm at-a-glance sense of where everyone is without creating competitive pressure.

**Progress update mechanism**: Members update their progress via an inline slider or a
numeric input on the club home screen, with an optional pace status selector. These are
separate from personal Dexie-tracked progress and stored in `clubs/{clubId}/members/{uid}`
in Firestore.

---

### User Story 20 — Gamification and Badges (Priority: P2)

A member wants to earn recognition within a club for their reading behavior — finishing
first, posting prolifically, staying engaged, or contributing analytically — so participation
feels rewarding.

**Why this priority**: Badges create positive feedback loops without competitive pressure.
They acknowledge effort and style without ranking members against each other. Depends on
feed (US16) and progress (US19) data.

**Independent Test**: Member reaches 100% progress → confirm "Primero en terminar" badge
appears on their profile within the club → member posts 5+ quotes → confirm "Quote master"
badge appears → view club members list → confirm badges visible next to names.

**Acceptance Scenarios**:

1. **Given** a club member is the first to reach 100% reading progress, **When** that
   progress is written to Firestore, **Then** the `FIRST_TO_FINISH` badge is awarded and
   appears on their in-club profile.
2. **Given** a member has published 5 or more quote-type posts in the club, **When** the
   5th post is submitted, **Then** the `QUOTE_MASTER` badge is awarded.
3. **Given** a member has posted at least once to the club feed in 7 or more distinct
   calendar days, **When** the 7th qualifying day is reached, **Then** the `LOYAL_READER`
   badge is awarded.
4. **Given** a member has posted 3 or more discovery-type posts in the club, **When** the
   3rd discovery post is submitted, **Then** the `THE_ANALYST` badge is awarded.
5. **Given** a member has earned one or more badges, **When** any member views the club
   member list or a member's in-club profile, **Then** earned badges are shown as small
   icon chips next to the member's name.
6. **Given** a club is closed, **When** any member views the memory capsule, **Then**
   each member's final badge set is preserved and displayed in the capsule.
7. **Given** a member has not earned any badges yet, **When** their profile is viewed,
   **Then** no badge section is shown (badges do not appear as locked/greyed-out).

**Badge Definitions**:

| Badge ID | Display Name (ES) | Display Name (EN) | Award Condition |
|---|---|---|---|
| `FIRST_TO_FINISH` | Primero en terminar | First to finish | First member in the club to reach 100% |
| `QUOTE_MASTER` | Quote master | Quote master | 5+ quote-type posts in the club |
| `LOYAL_READER` | Lector fiel | Loyal reader | Posted on 7+ distinct calendar days |
| `THE_ANALYST` | El analítico | The analyst | 3+ discovery-type posts in the club |

---

### User Story 21 — Club Closure and Memory Capsule (Priority: P1)

A moderator wants to formally close a club when the group has finished reading, triggering
the generation of an AI-powered memory capsule that captures the experience — and remains
consultable forever.

**Why this priority**: Closure gives the club a meaningful ending. The memory capsule
transforms ephemeral activity into a lasting artefact. Without closure mechanics, clubs
accumulate indefinitely and there is no lifecycle. This is P1 because it completes the
club lifecycle that US14 opens.

**Independent Test**: As moderator → club home → "Close Club" → confirm a dialog warns that
the club cannot be reopened → confirm → confirm a loading state while Gemini generates the
capsule → confirm the club status changes to "Closed" → confirm a capsule summary is
displayed → sign out and sign back in → navigate to the closed club → confirm the capsule
is still visible.

**Acceptance Scenarios**:

1. **Given** the moderator is on the club home screen, **When** they tap "Close Club",
   **Then** a confirmation dialog warns: "Closing this club cannot be undone. The club feed
   and discussions will be locked. A memory capsule will be generated."
2. **Given** the moderator confirms closure, **When** the action is processed, **Then**:
   - The club `status` is set to `CLOSED` in Firestore.
   - A Gemini request is sent to generate a summary of the club's experience.
   - A loading indicator is shown while the capsule is being generated.
3. **Given** Gemini returns the summary, **When** the capsule is saved, **Then** a
   `ClubCapsule` document is written to Firestore containing: the generated summary text,
   the book title and author, total posts count, total reactions count, member count, each
   member's final progress and badge set, and the closure timestamp.
4. **Given** the capsule is saved, **When** the moderator is shown the result, **Then**
   the club home displays the capsule view — a scrollable "memory" screen with the summary,
   stats, and member highlights.
5. **Given** the club is closed, **When** any member (current or future, by code) navigates
   to the club, **Then** they see the read-only capsule view. Feed and discussions are
   visible but locked — no new posts, replies, or reactions.
6. **Given** Gemini is unavailable when closure is triggered, **When** the API call fails,
   **Then** the club is still closed successfully, a partial capsule is saved with all
   structured data (stats, members, badges), and the summary field contains a fallback
   message: "Summary could not be generated. The club memories are preserved above."
7. **Given** the capsule exists, **When** it is displayed, **Then** it is rendered without
   an expiry — the capsule is permanent and never deleted.

**Gemini Prompt** (sent at closure):
```
A reading club called «{clubName}» just finished reading «{bookTitle}» by {bookAuthor}.
Here is a summary of what happened:
- {memberCount} members participated
- {totalPosts} posts were shared in the feed
- {totalReactions} emoji reactions were given
- Top posts and quotes: {topPostsSample}

Write a warm, 3–4 sentence summary of this reading club's experience.
Highlight the collective achievement, the spirit of discussion, and any memorable theme
that emerges from the posts. Write in the second person plural ("you all"). Tone: warm,
celebratory, literary. Language: {language}.
```

---

### User Story 22 — Milestone Check-In Prompts (Priority: P2)

When a member crosses a reading milestone (25%, 50%, or 75%), the app offers a Gemini-generated
reflection question they can optionally share with the club as a Hot take post.

**Why this priority**: Real-world book clubs often use structured check-ins ("halfway through —
any surprises?") to keep members engaged between meetings. This feature automates that nudge
without requiring the moderator to do it manually. It builds on the existing progress update
flow (US19) and hot take post type (US16).

**Independent Test**: Set progress to 25% on a club with a book assigned → confirm a prompt
dialog appears with a Gemini-generated reflection question → tap "Share as Hot take" → confirm
a HOT_TAKE post appears in the feed with the question pre-filled → set progress directly to
76% (skipping 50%) → confirm a second milestone prompt fires for 50% and another for 75%
(each milestone fires once per member per club).

**Acceptance Scenarios**:

1. **Given** a member updates their progress and the new value crosses the 25%, 50%, or 75%
   threshold for the first time in this club, **When** the progress write succeeds, **Then**
   a bottom sheet or dialog appears with a Gemini-generated reflection question (e.g. "You're
   halfway through — what's your biggest surprise so far?").
2. **Given** the milestone dialog is shown, **When** the member taps "Share as Hot take",
   **Then** the question is pre-filled into the ComposePostDialog with type `HOT_TAKE`; the
   member may edit or submit as-is.
3. **Given** the milestone dialog is shown, **When** the member taps "Dismiss", **Then** no
   post is created and the dialog does not reappear for the same milestone.
4. **Given** a milestone has already been triggered for a specific threshold (e.g. 50%),
   **When** the member later sets progress below and then above that threshold again, **Then**
   the milestone dialog does NOT re-fire — each milestone fires at most once per member per club.
5. **Given** Gemini is unavailable when a milestone is crossed, **When** the dialog would
   normally appear, **Then** it appears with a generic fallback question ("What are you
   thinking at this point in the book?") — the milestone is still acknowledged.

**Gemini Prompt** (sent at each milestone crossing):
```
A member of a reading club is reading «{bookTitle}» by {bookAuthor}.
They have just reached {milestone}% of the book.
Generate exactly 1 short, curious reflection question for them to share with their club.
Max 15 words. Casual, warm tone. No preamble — just the question itself.
```

**Milestone trigger tracking**: A `milestonesReached: number[]` field (list of milestone
values already triggered, e.g. `[25, 50]`) is added to the `ClubMember` document so the
client knows which milestones have already fired. This field is updated in the same write
as the progress update.

---

### User Story 23 — Private "Catch Up" AI Summary (Priority: P2)

A member who has fallen behind wants a private AI-generated summary of the chapters they
missed, so they can participate in the discussion without feeling ashamed of not having read.

**Why this priority**: Research shows that shame around not keeping up is the primary reason
members disengage from book clubs. A private, on-demand summary lowers the barrier to
participation. It requires no new Firestore collections — the result is ephemeral and local.

**Independent Test**: Open a club where your progress is under 80% → tap "Catch up" in the
feed tab → enter chapter range "1" to "5" → confirm Gemini returns a brief summary → confirm
the summary is shown only to you and is not stored in the feed or Firestore → close the
dialog → confirm no trace of the request appears in the club feed.

**Acceptance Scenarios**:

1. **Given** a member's progress is less than 80%, **When** they view the Feed tab, **Then**
   a "Catch up" button (📖 icon, subtle secondary style) is visible near the top of the feed.
2. **Given** the member taps "Catch up", **When** the dialog opens, **Then** they can enter
   a chapter range: "From chapter" and "To chapter" (free text or numbers; max 10 chars each).
3. **Given** the chapter range is entered, **When** the member submits, **Then** a Gemini
   request is sent; a loading indicator is shown while the response is being generated.
4. **Given** Gemini returns the summary, **When** it is displayed, **Then** it appears as a
   plain prose paragraph inside the dialog. The summary is never written to Firestore —
   it exists only in local component state for the duration of the dialog session.
5. **Given** the summary is displayed, **When** the member closes the dialog, **Then** the
   summary is discarded; it cannot be retrieved again without making a new request.
6. **Given** Gemini is unavailable, **When** the member submits the chapter range, **Then**
   an error message is shown: "Summary unavailable. Try again later." — no fallback content
   is fabricated.
7. **Given** the club status is `CLOSED`, **When** any member views the club, **Then** the
   "Catch up" button is hidden — the club is no longer active.

**Gemini Prompt** (sent on demand; result not persisted):
```
Summarize the main events of chapters {startChapter} through {endChapter} of
«{bookTitle}» by {bookAuthor}. Keep the summary under 150 words. Focus on key plot
points and character developments. Write in plain prose with no disclaimers.
```

---

## Requirements

### Functional Requirements (Clubs)

- **FR-C01**: A signed-in user MUST be able to create a reading club with a name, book
  title, and book author.
- **FR-C02**: Club creation MUST generate a unique 6-character alphanumeric invite code
  stored on the club document and usable for lookup via Firestore query.
- **FR-C03**: A signed-in user MUST be able to join a club by entering a valid invite code.
- **FR-C04**: Club membership MUST be recorded in Firestore in real time; the moderator
  MUST see new members appear without refreshing.
- **FR-C05**: Members MUST be able to post to the club feed with one of five types: Quote,
  Discovery, Hot take, Question, or Word (Vocabulary). All post types support an optional
  chapter tag (max 30 chars).
- **FR-C06**: All club feed posts MUST propagate to all connected members in real time via
  Firestore `onSnapshot`.
- **FR-C07**: Members MUST be able to react to any post with exactly four emoji: 🔥 😂 😢 🤯.
  Reactions MUST be toggleable (tap once to add, tap again to remove).
- **FR-C08**: Moderators MUST be able to create discussion topics with a title and optional
  description.
- **FR-C09**: Members MUST be able to reply to discussion topics; replies MUST propagate in
  real time.
- **FR-C10**: Moderators MUST be able to request AI-generated discussion questions from
  Gemini Flash, based on the club's book.
- **FR-C11**: Each member's reading progress (0–100%) MUST be stored in Firestore and
  visible to all other club members in real time.
- **FR-C11b**: Each member MAY set a pace status (`ON_TRACK`, `BEHIND`, or `FINISHED`),
  stored in their member document and visible to all club members. This field is optional.
- **FR-C12**: Badge awards MUST be evaluated and written to Firestore automatically when
  the triggering conditions are met (see badge award logic in clubs-data-model.md).
- **FR-C13**: Moderators MUST be able to close a club, triggering a Gemini-powered capsule
  generation and locking the club to read-only.
- **FR-C14**: The memory capsule MUST be stored permanently in Firestore and viewable by
  all members after closure.
- **FR-C15**: A closed club MUST still be accessible and readable — posts, discussions, and
  the capsule are never deleted.
- **FR-C16**: The moderator of an ACTIVE club MUST be able to pin up to 2 posts; pinned
  posts MUST appear above the regular feed in a distinct "Pinned" section.
- **FR-C17**: When a member's reading progress crosses the 25%, 50%, or 75% threshold for
  the first time in a given club, the app MUST show a Gemini-generated reflection question
  which the member may optionally share as a Hot take post.
- **FR-C18**: Each milestone (25%, 50%, 75%) MUST fire at most once per member per club;
  the triggered milestones are recorded in `ClubMember.milestonesReached`.
- **FR-C19**: Members with progress < 80% MUST have access to a private "Catch up" AI
  summary feature that sends a chapter range to Gemini and displays the response locally
  without storing it in Firestore.
- **FR-C20**: The `geminiClubs.ts` module MUST expose a `getMilestonePrompt` function and
  a `getCatchUpSummary` function using the prompts defined in `clubs-data-model.md`.

### Non-Functional Requirements

- **NFR-C01**: Feed updates MUST appear on connected devices within 2 seconds of a write
  (Firestore `onSnapshot` latency under normal network conditions).
- **NFR-C02**: Club home screen MUST render within 1.5 seconds on a standard 4G connection.
- **NFR-C03**: All club Firestore writes MUST be validated by Security Rules — users can
  only write to clubs they are members of.
- **NFR-C04**: Invite code lookup MUST complete within 1 second (single Firestore query).
- **NFR-C05**: The app MUST remain usable (read-only) when offline — cached club data
  from Firestore's offline persistence is displayed; write actions show an appropriate
  error rather than silently dropping data.

---

## Edge Cases

- What happens when two users join with the same invite code at the exact same millisecond?
  Firestore's transaction model ensures both writes succeed independently; duplicate
  membership is prevented by using `uid` as the member document ID (idempotent write).
- What happens when a member is removed from a club (future feature)? The `CLOSED` club
  status prevents new activity but membership removal is out of scope for MVP.
- What happens when the Gemini call at closure times out? The club is still closed with
  structured data preserved; the summary falls back to a placeholder string.
- What happens when a post is deleted that has reactions? Deleting the post document also
  removes its subcollection (reactions). Firestore does not cascade deletes automatically —
  the client must delete subcollection documents before deleting the parent, or a Cloud
  Function handles cleanup (MVP: client-side cascade in the repository layer).
- What happens if the same user opens the club on two devices? Both receive the same
  real-time updates via separate `onSnapshot` listeners; no conflict arises because all
  reads are reactive and no local state is used for club data.

---

## Success Criteria

- **SC-C01**: A moderator can create a club, share the invite code, and a member can join
  in under 60 seconds total.
- **SC-C02**: A post appears on all connected members' feeds within 2 seconds of submission.
- **SC-C03**: Emoji reactions update in real time on all devices without a page refresh.
- **SC-C04**: The memory capsule is generated and stored within 10 seconds of the moderator
  confirming closure.
- **SC-C05**: A closed club's capsule remains accessible after signing out and signing back in.
- **SC-C06**: All four badges are awarded correctly based on the conditions defined in US20.
- **SC-C07**: A milestone check-in prompt appears exactly once when a member's progress
  crosses 25%, 50%, or 75% for the first time, and not again on subsequent progress updates.
- **SC-C08**: A "Catch up" summary request completes and displays within 5 seconds on a
  standard 4G connection; the result is never visible to other club members.
