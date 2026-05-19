import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandBadge } from '../ui/BrandBadge';
import { colors, radius, spacing, typography } from '../../theme';

const STEPS = [
  { icon: 'person-add' as const, label: 'Your profile' },
  { icon: 'home' as const, label: 'Role & intent' },
  { icon: 'checkmark-circle' as const, label: 'Start exploring' },
] as const;

export function RegisterHeader() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <BrandBadge />
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.lead}>
        Join Thane Flats — search homes, chat with owners, or list your property on
        thaneflats.com
      </Text>
      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step.label} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon} size={14} color={colors.goldAccent} />
            </View>
            <Text style={styles.stepText}>{step.label}</Text>
            {i < STEPS.length - 1 ? (
              <Ionicons
                name="chevron-forward"
                size={12}
                color="rgba(248, 250, 252, 0.4)"
                style={styles.stepArrow}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.heroTitle,
    color: colors.heroText,
    marginTop: spacing.lg,
  },
  lead: {
    ...typography.heroLead,
    color: colors.heroText,
    opacity: 0.9,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.heroText,
    opacity: 0.92,
  },
  stepArrow: {
    marginLeft: -2,
  },
});
