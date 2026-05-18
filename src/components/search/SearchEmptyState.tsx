import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  onClearFilters: () => void;
};

export function SearchEmptyState({ onClearFilters }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="search-outline" size={36} color={colors.slateLight} />
      </View>
      <Text style={styles.title}>No homes match</Text>
      <Text style={styles.sub}>
        Try a wider area on the map, remove a filter, or change your budget range.
      </Text>
      <Pressable style={styles.btn} onPress={onClearFilters}>
        <Ionicons name="refresh-outline" size={18} color={colors.heroText} />
        <Text style={styles.btnText}>Reset search & filters</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.slateLight,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: '#0d9488',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  btnText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
});
