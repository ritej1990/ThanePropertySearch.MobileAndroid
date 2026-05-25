import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  onPress: () => void;
};

export function BuildersNavButton({ onPress }: Props) {
  return (
    <Pressable style={styles.btn} onPress={onPress} hitSlop={6}>
      <Ionicons name="business" size={16} color="#7c3aed" />
      <Text style={styles.text}>Builders</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6d28d9',
  },
});
