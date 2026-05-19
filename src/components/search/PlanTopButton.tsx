import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  onPress: () => void;
  compact?: boolean;
};

export function PlanTopButton({ onPress, compact }: Props) {
  return (
    <Pressable
      style={[styles.btn, compact && styles.btnCompact]}
      onPress={onPress}
      accessibilityLabel="View plans"
    >
      <Ionicons name="shield-checkmark" size={compact ? 15 : 16} color="#0f766e" />
      <Text style={[styles.label, compact && styles.labelCompact]}>Plan</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  btnCompact: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  labelCompact: {
    fontSize: 12,
  },
});
