import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  description: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  accent: string;
  accentSoft: string;
};

export function RegisterSelectCard({
  label,
  description,
  icon,
  selected,
  onPress,
  accent,
  accentSoft,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <LinearGradient
          colors={[accentSoft, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && { borderColor: accent }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: accent }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    minHeight: 72,
  },
  cardSelected: {
    borderColor: colors.primary,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  description: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 2,
    lineHeight: 15,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
