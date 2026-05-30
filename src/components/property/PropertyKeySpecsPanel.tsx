import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { SpecRow, type SpecTone } from './SpecRow';

export type KeySpecItem = {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: SpecTone;
};

type Props = {
  items: KeySpecItem[];
};

const TONE_CYCLE: SpecTone[] = ['teal', 'blue', 'violet'];

export function PropertyKeySpecsPanel({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#ccfbf1', '#bae6fd', '#ddd6fe', '#fef9c3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <LinearGradient
          colors={['#0d9488', '#2563eb', '#6d28d9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerIcon}
        >
          <Ionicons name="grid-outline" size={20} color={colors.heroText} />
        </LinearGradient>
        <Text style={styles.headerTitle}>Key specifications</Text>
        <LinearGradient
          colors={['#0d9488', '#2563eb', '#7c3aed', '#ea580c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerStripe}
        />
      </LinearGradient>

      <View style={styles.body}>
        {items.map((item, index) => (
          <SpecRow
            key={item.key}
            label={item.label}
            value={item.value}
            icon={item.icon}
            tone={item.tone ?? TONE_CYCLE[index % TONE_CYCLE.length]}
            variant="vivid"
            last={index === items.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.18)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 4,
    position: 'relative',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  headerStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#f8fafc',
  },
});
