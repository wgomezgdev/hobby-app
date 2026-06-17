// ─── Enums / Unions ────────────────────────────────────────────────────────

export type ClubStatus = 'ACTIVE' | 'CLOSED';

export type PostType = 'QUOTE' | 'DISCOVERY' | 'HOT_TAKE' | 'QUESTION' | 'VOCABULARY' | 'DISCUSSION_REPLY';

export type BadgeId =
  | 'FIRST_TO_FINISH'
  | 'QUOTE_MASTER'
  | 'LOYAL_READER'
  | 'THE_ANALYST';

export type MemberRole = 'MODERATOR' | 'MEMBER';

export type ReactionEmoji = 'fire' | 'laugh' | 'cry' | 'mindblown';

export const REACTION_DISPLAY: Record<ReactionEmoji, string> = {
  fire: '🔥',
  laugh: '😂',
  cry: '😢',
  mindblown: '🤯',
};

export const POST_TYPE_DISPLAY: Record<Exclude<PostType, 'DISCUSSION_REPLY'>, { label: string; emoji: string }> = {
  QUOTE:      { label: 'Quote',      emoji: '💬' },
  DISCOVERY:  { label: 'Discovery',  emoji: '💡' },
  HOT_TAKE:   { label: 'Hot take',   emoji: '🌶️' },
  QUESTION:   { label: 'Question',   emoji: '❓' },
  VOCABULARY: { label: 'Word',       emoji: '📚' },
};

export type PaceStatus = 'ON_TRACK' | 'BEHIND' | 'FINISHED';

export const PACE_STATUS_DISPLAY: Record<PaceStatus, { label: string; emoji: string }> = {
  ON_TRACK: { label: 'Reading along', emoji: '📖' },
  BEHIND:   { label: 'Taking my time', emoji: '🐢' },
  FINISHED: { label: 'Finished!',     emoji: '✅' },
};

// ─── ClubMember ────────────────────────────────────────────────────────────

export interface ClubMember {
  uid: string;
  displayName: string;
  photoURL: string | null;
  role: MemberRole;
  joinedAt: number;
  progress: number;
  badges: BadgeId[];
  quotePostCount: number;
  discoveryPostCount: number;
  activeDays: number[];
  paceStatus: PaceStatus | null;
  milestonesReached: number[];
}

// ─── ClubPost ──────────────────────────────────────────────────────────────

export interface ClubPost {
  id: string;
  clubId: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL: string | null;
  type: PostType;
  text: string;
  pageNumber?: number;
  chapterTag?: string;
  isPinned: boolean;
  vocabularyDefinition?: string;
  topicId?: string;
  createdAt: number;
  reactionCounts: Record<ReactionEmoji, number>;
}

// ─── PostReaction ──────────────────────────────────────────────────────────

export interface PostReaction {
  uid: string;
  emoji: ReactionEmoji;
  reactedAt: number;
}

// ─── ClubDiscussionTopic ───────────────────────────────────────────────────

export interface ClubDiscussionTopic {
  id: string;
  clubId: string;
  authorUid: string;
  authorName: string;
  title: string;
  description?: string;
  createdAt: number;
  replyCount: number;
  isAiGenerated: boolean;
}

// ─── ClubReply ─────────────────────────────────────────────────────────────

export interface ClubReply {
  id: string;
  topicId: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL: string | null;
  text: string;
  createdAt: number;
}

// ─── Club ──────────────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverURL?: string;
  description?: string;
  inviteCode: string;
  moderatorUid: string;
  status: ClubStatus;
  memberCount: number;
  createdAt: number;
  closedAt?: number;
  capsuleId?: string;
}

// ─── ClubCapsule ───────────────────────────────────────────────────────────

export interface CapsuleMemberSnapshot {
  uid: string;
  displayName: string;
  photoURL: string | null;
  finalProgress: number;
  badges: BadgeId[];
}

export interface ClubCapsule {
  id: string;
  clubId: string;
  clubName: string;
  bookTitle: string;
  bookAuthor: string;
  closedAt: number;
  memberCount: number;
  totalPosts: number;
  totalReactions: number;
  generatedSummary: string;
  summaryGeneratedAt: number;
  memberSnapshots: CapsuleMemberSnapshot[];
}
