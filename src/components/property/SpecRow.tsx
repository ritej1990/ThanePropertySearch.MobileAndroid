import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type SpecTone = 'teal' | 'blue' | 'violet';

type Props = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: SpecTone;
  variant?: 'plain' | 'vivid';
  last?: boolean;
};

const TONE_STYLES: Record<
  SpecTone,
  {
    accent: string;
    labelBg: string;
    labelBorder: string;
    labelText: string;
    iconBg: string;
    iconColor: string;
    rowBg: string;
    rowBorder: string;
  }
> = {
  teal: {
    accent: '#0f766e',
    labelBg: '#ecfdf5',
    labelBorder: 'rgba(45, 212, 191, 0.55)',
    labelText: '#0f766e',
    iconBg: '#ccfbf1',
    iconColor: '#0d9488',
    rowBg: 'rgba(236, 253, 245, 0.45)',
    rowBorder: 'rgba(167, 243, 208, 0.5)',
  },
  blue: {
    accent: '#1d4ed8',
    labelBg: '#eff6ff',
    labelBorder: 'rgba(59, 130, 246, 0.55)',
    labelText: '#1e40af',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    rowBg: 'rgba(239, 246, 255, 0.55)',
    rowBorder: 'rgba(191, 219, 254, 0.55)',
  },
  violet: {
    accent: '#6d28d9',
    labelBg: '#faf5ff',
    labelBorder: 'rgba(167, 139, 250, 0.55)',
    labelText: '#5b21b6',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    rowBg: 'rgba(250, 245, 255, 0.55)',
    rowBorder: 'rgba(221, 214, 254, 0.55)',
  },
};

export function SpecRow({
  label,
  value,
  icon,
  tone = 'teal',
  variant = 'plain',
  last,
}: Props) {
  if (variant === 'plain') {
    return (
      <View style={[styles.plainRow, !last && styles.plainRowBorder]}>
        <Text style={styles.plainLabel}>{label}</Text>
        <Text style={styles.plainValue}>{value}</Text>
      </View>
    );
  }

  const palette = TONE_STYLES[tone];

  return (
    <View
      style={[
        styles.vividRow,
        {
          backgroundColor: palette.rowBg,
          borderColor: palette.rowBorder,
          borderLeftColor: palette.accent,
        },
        !last && styles.vividRowGap,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: palette.iconBg }]}>
          <Ionicons name={icon} size={16} color={palette.iconColor} />
        </View>
      ) : null}
      <View style={styles.vividContent}>
        <View style={[styles.labelChip, { backgroundColor: palette.labelBg, borderColor: palette.labelBorder }]}>
          <Text style={[styles.labelChipText, { color: palette.labelText }]}>{label}</Text>
        </View>
        <Text style={styles.vividValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plainRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  plainRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  plainLabel: {
    width: 110,
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateLight,
  },
  plainValue: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
    fontWeight: '500',
  },
  vividRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingLeft: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  vividRowGap: {
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  vividContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  labelChip: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  labelChipText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vividValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 21,
  },
});
