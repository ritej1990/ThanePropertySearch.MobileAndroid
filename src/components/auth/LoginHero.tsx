import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandBadge } from '../ui/BrandBadge';
import { colors, gradients, radius, spacing, typography } from '../../theme';

const FEATURES = [
  { icon: '🔍', text: 'Smart search across Thane listings' },
  { icon: '💬', text: 'Chat with owners and agents' },
  { icon: '🏠', text: 'Owner tools to manage your properties' },
  { icon: '📍', text: 'Local focus — buy, rent, sell in Thane' },
] as const;

type Props = {
  compact?: boolean;
};

export function LoginHero({ compact }: Props) {
  return (
    <LinearGradient
      colors={[...gradients.hero]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, compact && styles.heroCompact]}
      pointerEvents="box-none"
    >
      <View style={styles.goldGlow} pointerEvents="none" />
      <View style={styles.inner} pointerEvents="none">
        {!compact && <BrandBadge />}
        <Text style={[styles.title, compact && styles.titleCompact]}>
          Find your next home in{' '}
          <Text style={styles.accent}>Thane</Text>
        </Text>
        {!compact && (
          <Text style={styles.lead}>
            Browse verified flats and manage listings — same as thaneflats.com.
          </Text>
        )}
        <View style={styles.features}>
          {(compact ? FEATURES.slice(0, 2) : FEATURES).map((item) => (
            <View key={item.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>
        {!compact && (
          <View style={styles.location}>
            <Text style={styles.locationLabel}>Near you</Text>
            <Text style={styles.locationValue}>
              Thane-focused listings & local insights
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  heroCompact: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  goldGlow: {
    position: 'absolute',
    top: -40,
    left: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201, 162, 39, 0.14)',
  },
  inner: {
    gap: spacing.md,
  },
  title: {
    ...typography.heroTitle,
    color: colors.heroText,
    marginTop: spacing.sm,
  },
  titleCompact: {
    fontSize: 20,
  },
  accent: {
    color: colors.goldAccent,
  },
  lead: {
    ...typography.heroLead,
    color: colors.heroText,
    opacity: 0.9,
  },
  features: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm + 1,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  featureIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  featureText: {
    ...typography.feature,
    color: colors.heroText,
    flex: 1,
    opacity: 0.95,
  },
  location: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.goldSoft,
  },
  locationValue: {
    fontSize: 12,
    color: colors.heroText,
    opacity: 0.88,
    flex: 1,
    lineHeight: 18,
  },
});
