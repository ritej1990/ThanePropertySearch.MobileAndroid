import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

type Props = {
  label: string;
  value: string;
  last?: boolean;
};

export function SpecRow({ label, value, last }: Props) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  label: {
    width: 110,
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateLight,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
    fontWeight: '500',
  },
});
