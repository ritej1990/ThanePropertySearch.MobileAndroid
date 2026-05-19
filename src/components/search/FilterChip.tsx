import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
};

export function FilterChip({
  label,
  active,
  onPress,
  icon,
  accent = '#0d9488',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: accent, borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.heroText : colors.slateMuted}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, active && styles.labelOn]}>{label}</Text>
    </Pressable>
  );
}

type IconChipProps = {
  label: string;
  sublabel?: string;
  active?: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export function FilterIconCard({
  label,
  sublabel,
  active,
  onPress,
  icon,
  color,
}: IconChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && { borderColor: color, backgroundColor: `${color}12` },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.cardLabel, active && { color: colors.navy }]}>{label}</Text>
      {sublabel ? <Text style={styles.cardSub}>{sublabel}</Text> : null}
      {active ? (
        <View style={[styles.check, { backgroundColor: color }]}>
          <Ionicons name="checkmark" size={10} color={colors.heroText} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  labelOn: {
    color: colors.heroText,
  },
  card: {
    width: 76,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    marginRight: spacing.sm,
    position: 'relative',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slateMuted,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 9,
    color: colors.slateLight,
    marginTop: 1,
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
