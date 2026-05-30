import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  /** Accent for builder-themed screens */
  variant?: 'default' | 'builder';
};

/** Slim sticky row shown while dashboard hero chrome is collapsed on scroll. */
export function DashboardCompactBar({
  title,
  subtitle,
  onPress,
  right,
  variant = 'default',
}: Props) {
  const accent = variant === 'builder' ? colors.builder : colors.tealDark;

  return (
    <Pressable
      style={styles.wrap}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Show ${title}` : title}
    >
      <View style={styles.main}>
        <Ionicons name="chevron-down" size={14} color={accent} />
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
    marginTop: 1,
  },
  right: {
    flexShrink: 0,
  },
});
