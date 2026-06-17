import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { BadgeId } from '../../types/clubs';

const BADGE_META: Record<BadgeId, { emoji: string }> = {
  FIRST_TO_FINISH: { emoji: '🏅' },
  QUOTE_MASTER:    { emoji: '📖' },
  LOYAL_READER:    { emoji: '💪' },
  THE_ANALYST:     { emoji: '🔍' },
};

interface Props {
  badge: BadgeId;
  size?: 'small' | 'medium';
}

export function BadgeChip({ badge, size = 'small' }: Props) {
  const { t } = useTranslation();
  const { emoji } = BADGE_META[badge];
  return (
    <Chip
      label={`${emoji} ${t(`badge.${badge}`)}`}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
}
