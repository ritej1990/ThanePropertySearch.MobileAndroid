import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  onViewProperty?: () => void;
  viewPropertyLabel: string;
};

export function ChatThreadHeader({
  title,
  subtitle,
  onViewProperty,
  viewPropertyLabel,
}: Props) {
  return (
    <LinearGradient
      colors={['#f8fafc', '#f1f5f9']}
      style={styles.wrap}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="home" size={18} color="#0d9488" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onViewProperty ? (
        <Pressable
          style={styles.linkBtn}
          onPress={onViewProperty}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Ionicons name="open-outline" size={16} color={colors.primary} />
          <Text style={styles.linkText}>{viewPropertyLabel}</Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
    marginTop: 2,
  },
  linkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  linkText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
