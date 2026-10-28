const MILESTONES = [25, 50, 75] as const;
type Milestone = typeof MILESTONES[number];

export function useMilestonePrompt() {
  function checkMilestone(
    oldProgress: number,
    newProgress: number,
    milestonesReached: number[]
  ): { milestone: Milestone } | null {
    for (const m of MILESTONES) {
      if (oldProgress < m && newProgress >= m && !milestonesReached.includes(m)) {
        return { milestone: m };
      }
    }
    return null;
  }

  return { checkMilestone };
}
