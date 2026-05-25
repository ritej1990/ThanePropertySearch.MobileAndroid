import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, spacing } from '../../theme';

type Props = {
  projectCount: number;
};

export function BuilderProjectsBanner({ projectCount }: Props) {
  return (
    <LinearGradient
      colors={[...gradients.builder]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.iconBadge}>
        <Ionicons name="business" size={22} color={colors.heroText} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.eyebrow}>New developments</Text>
        <Text style={styles.title}>Builder projects</Text>
        <Text style={styles.sub}>
          RERA-registered towers · verified inventory · direct builder enquiries
        </Text>
      </View>
      <View style={styles.countPill}>
        <Text style={styles.countNum}>{projectCount}</Text>
        <Text style={styles.countLabel}>
          {projectCount === 1 ? 'project' : 'projects'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  textCol: {
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.goldSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 250, 252, 0.88)',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  countPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.heroText,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.8)',
  },
});
