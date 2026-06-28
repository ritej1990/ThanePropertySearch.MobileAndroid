import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatAiInvestmentScore } from '../../utils/aiCardScore';
import { colors, radius } from '../../theme';

type Props = {
  investmentScore: number;
  /** On photo overlay (default) vs inline in card body */
  variant?: 'overlay' | 'inline';
};

/** Compact AI score — matches web `portal-card-rating-float--ai` (e.g. AI 8.0). */
export function AiListingScoreBadge({ investmentScore, variant = 'overlay' }: Props) {
  const label = formatAiInvestmentScore(investmentScore);
  if (!label) return null;

  const isOverlay = variant === 'overlay';

  return (
    <View
      style={[styles.badge, isOverlay ? styles.badgeOverlay : styles.badgeInline]}
      accessibilityLabel={`AI investment score ${label.replace('AI ', '')} out of 10`}
    >
      <Ionicons name="sparkles" size={isOverlay ? 11 : 10} color={colors.heroText} />
      <Text style={[styles.text, isOverlay && styles.textOverlay]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
  },
  badgeOverlay: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.95)',
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeInline: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: '#7c3aed',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: 0.15,
  },
  textOverlay: {
    fontSize: 12,
  },
});
