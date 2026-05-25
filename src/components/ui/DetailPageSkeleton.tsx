import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type Props = {
  title?: string;
  variant?: 'property' | 'builder';
};

export function DetailPageSkeleton({ title, variant = 'property' }: Props) {
  const heroHeight = variant === 'builder' ? 280 : 220;

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { height: heroHeight }]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <View style={styles.body}>
        <View style={styles.blockLg} />
        <View style={styles.blockMd} />
        <View style={styles.row}>
          <View style={styles.blockSm} />
          <View style={styles.blockSm} />
        </View>
        <View style={styles.blockMd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  hero: {
    backgroundColor: colors.borderLight,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.slateMuted,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.xl,
  },
  blockLg: {
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
  },
  blockMd: {
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  blockSm: {
    flex: 1,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
});
