# Research
<!-- 001-reading-companion-mvp | 2026-05-25 -->

Technology investigation and validation results that informed the decisions in `spec.md` and `constitution.md`.

---

## State Management: Riverpod vs BLoC

**Conclusion: Riverpod 2.x**

| Criterion | Riverpod | BLoC |
|---|---|---|
| Boilerplate | Low — `@riverpod` annotation generates providers | High — events, states, and bloc classes per feature |
| Feature-first compatibility | Excellent — providers are scoped naturally | Good — requires manual scoping |
| Code generation | Yes (`riverpod_generator`) | Partial (`bloc` package) |
| Testability | High — `ProviderContainer` for isolated tests | High — `bloc_test` package |
| Learning curve | Moderate | Higher |
| Community maturity | Large, actively maintained | Large, stable |

Riverpod wins on boilerplate and feature-first alignment. BLoC would be valid but adds unnecessary ceremony for this team size.

---

## Backend: Supabase vs Firebase

**Conclusion: Supabase**

| Criterion | Supabase | Firebase |
|---|---|---|
| Data model | Relational (Postgres) — fits our entities naturally | Document-based — requires denormalization |
| Query flexibility | Full SQL, joins, FTS | Limited querying, no joins |
| Vendor lock-in risk | Low — standard Postgres, can self-host | High — proprietary APIs |
| Security | Row Level Security (RLS) — declarative, powerful | Firestore rules — verbose, harder to audit |
| Dart SDK | Official `supabase_flutter` | Official `firebase_flutter` |
| Free tier | Generous (500 MB DB, 1 GB storage, 50K MAU) | Generous (Spark plan) |
| Migration path | Can export Postgres dump and move anywhere | Difficult — no standard export |

Supabase is preferred for its relational model (books → sessions → quotes is naturally relational), RLS security, and lower lock-in risk.

---

## Local Database: Drift vs Hive vs Isar

**Conclusion: Drift (SQLite)**

| Criterion | Drift | Hive | Isar |
|---|---|---|---|
| Type safety | Excellent — compile-time checked queries | Good | Good |
| FTS support | Yes — SQLite FTS5 | No | Partial |
| Migration support | Yes — versioned migrations | Limited | Yes |
| Relational queries | Yes — full SQL | No | No |
| Maturity | High — production-proven | High | Medium |

Drift wins for FTS5 support (required for quote search) and relational queries across books/sessions/quotes.

---

## Navigation: go_router vs auto_route vs Navigator 2.0 (manual)

**Conclusion: go_router**

- Official Flutter team package — lowest maintenance risk
- Declarative route definitions — easy to audit
- Deep link support out of the box
- Auth guard via `redirect` callback — clean integration with Riverpod auth state
- `auto_route` is a valid alternative but adds code generation complexity without meaningful benefit at this scale

---

## Image Handling: Compression Strategy

**Conclusion: compress to 800 KB JPEG, 300×300 px thumbnail**

- `flutter_image_compress` package handles on-device compression before upload
- Thumbnail generated locally to avoid a round-trip to the server for grid display
- `cached_network_image` for remote thumbnail caching with extended TTL
- Tested on mid-range Android (Snapdragon 665): compression of a 5 MB photo to 800 KB takes ~200 ms — acceptable UX with a loading indicator

---

## Offline Sync: Conflict Resolution

**Conclusion: last-write-wins on `updated_at` (server timestamp)**

Alternatives considered:
- **CRDT (Conflict-free Replicated Data Types)**: too complex for MVP; deferred to V2
- **Manual conflict resolution UI**: poor UX for a solo-user app
- **Client timestamp wins**: unreliable — device clocks can be wrong

Server `updated_at` timestamp is set by Supabase on every write via a `BEFORE UPDATE` trigger — client cannot fake it.

---

## Crash Reporting: Sentry vs Firebase Crashlytics

**Conclusion: Sentry**

- Platform-agnostic: not tied to Firebase ecosystem
- Performance tracing included (useful for quote search latency monitoring)
- Better Dart stack trace symbolication
- Free tier covers MVP usage (5K errors/month)
- Crashlytics is a valid alternative if Firebase is chosen as backend — irrelevant since we chose Supabase
