import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = TextInputProps & {
  label: string;
  icon: IconName;
};

/** Plain text field — no focus-state layout changes (avoids Android keyboard dismiss). */
export const AuthTextField = forwardRef<TextInput, Props>(function AuthTextField(
  { label, icon, style, ...rest },
  ref
) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrap}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.slateLight}
          style={styles.icon}
          pointerEvents="none"
        />
        <TextInput
          ref={ref}
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.slateLight}
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    marginLeft: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.navy,
    paddingVertical: 14,
    paddingRight: spacing.lg,
    paddingLeft: spacing.sm,
    minHeight: 48,
  },
});
