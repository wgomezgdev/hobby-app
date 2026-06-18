import { getMilestonePrompt } from '../utils/geminiClubs';

const MILESTONES = [25, 50, 75] as const;
type Milestone = typeof MILESTONES[number];

export function useMilestonePrompt(bookTitle: string, bookAuthor: string) {
  async function checkMilestone(
    oldProgress: number,
    newProgress: number,
    milestonesReached: number[]
  ): Promise<{ milestone: Milestone; question: string } | null> {
    for (const m of MILESTONES) {
      if (oldProgress < m && newProgress >= m && !milestonesReached.includes(m)) {
        const question = await getMilestonePrompt(bookTitle, bookAuthor, m);
        return { milestone: m, question };
      }
    }
    return null;
  }

  return { checkMilestone };
}
