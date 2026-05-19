import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type ListingKey = 'isForRent' | 'isForSale' | 'isForPg';

const OPTIONS: {
  key: ListingKey;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    key: 'isForRent',
    label: 'For rent',
    sub: 'Monthly lease',
    icon: 'key-outline',
    color: '#2563eb',
  },
  {
    key: 'isForSale',
    label: 'For sale',
    sub: 'Outright purchase',
    icon: 'cash-outline',
    color: '#7c3aed',
  },
  {
    key: 'isForPg',
    label: 'PG',
    sub: 'Paying guest',
    icon: 'bed-outline',
    color: '#0d9488',
  },
];

type Props = {
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
  onToggle: (key: ListingKey) => void;
};

export function ListingTypeSelector({
  isForRent,
  isForSale,
  isForPg,
  onToggle,
}: Props) {
  const flags = { isForRent, isForSale, isForPg };

  return (
    <View style={styles.grid}>
      {OPTIONS.map((opt) => {
        const active = flags[opt.key];
        return (
          <Pressable
            key={opt.key}
            onPress={() => onToggle(opt.key)}
            style={({ pressed }) => [
              styles.card,
              active && { borderColor: opt.color, backgroundColor: `${opt.color}10` },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${opt.color}18` }]}>
              <Ionicons name={opt.icon} size={22} color={opt.color} />
            </View>
            <Text style={[styles.label, active && { color: colors.navy }]}>
              {opt.label}
            </Text>
            <Text style={styles.sub}>{opt.sub}</Text>
            {active && (
              <View style={[styles.check, { backgroundColor: opt.color }]}>
                <Ionicons name="checkmark" size={12} color={colors.heroText} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    minHeight: 108,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slateMuted,
  },
  sub: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 2,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
