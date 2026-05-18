import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
};

export function RegisterIntentChip({ label, icon, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? colors.heroText : colors.slateMuted}
      />
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  chipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipPressed: {
    opacity: 0.9,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  textSelected: {
    color: colors.heroText,
  },
});
