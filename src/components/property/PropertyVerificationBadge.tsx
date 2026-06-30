import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VerificationBadgeTone } from '../../utils/propertyVerification';

const TONE_STYLES: Record<
  VerificationBadgeTone,
  { bg: string; border: string; text: string }
> = {
  verified: { bg: '#ecfdf5', border: '#86efac', text: '#166534' },
  pending: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  hidden: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  sold: { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' },
  rented: { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' },
  neutral: { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' },
};

type Props = {
  label: string;
  tone: VerificationBadgeTone;
  compact?: boolean;
};

export function PropertyVerificationBadge({ label, tone, compact }: Props) {
  const palette = TONE_STYLES[tone];
  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, compact && styles.textCompact, { color: palette.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeCompact: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 10,
  },
});
