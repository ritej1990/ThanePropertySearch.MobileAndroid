import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type LoginMethod = 'password' | 'otp';

type Props = {
  method: LoginMethod;
  onChange: (method: LoginMethod) => void;
  passwordLabel: string;
  otpLabel: string;
};

function Tab({
  selected,
  icon,
  label,
  onPress,
}: {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tab, selected && styles.tabOn]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? colors.primaryDark : colors.slateLight}
      />
      <Text style={[styles.tabText, selected && styles.tabTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function LoginMethodTabs({ method, onChange, passwordLabel, otpLabel }: Props) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      <Tab
        selected={method === 'password'}
        icon="key-outline"
        label={passwordLabel}
        onPress={() => onChange('password')}
      />
      <Tab
        selected={method === 'otp'}
        icon="phone-portrait-outline"
        label={otpLabel}
        onPress={() => onChange('otp')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  tabOn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateLight,
  },
  tabTextOn: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
