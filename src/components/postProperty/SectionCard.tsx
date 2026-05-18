import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = ViewProps & {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: string;
};

export function SectionCard({
  title,
  subtitle,
  icon,
  accent = '#0d9488',
  children,
  style,
  ...rest
}: Props) {
  return (
    <View style={[styles.card, style]} {...rest}>
      <View style={styles.head}>
        <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: 4,
    lineHeight: 18,
  },
});
