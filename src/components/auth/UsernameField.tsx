import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UsernameAvailabilityStatus } from '../../hooks/useUsernameAvailability';
import { colors, radius, spacing, typography } from '../../theme';

type Props = Omit<TextInputProps, 'autoCapitalize' | 'autoCorrect'> & {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  status: UsernameAvailabilityStatus;
  statusMessage: string;
  suggestions: string[];
  localSuggestions?: string[];
  onPickSuggestion: (username: string) => void;
  onBlurCheck?: () => void;
};

export const UsernameField = forwardRef<TextInput, Props>(function UsernameField(
  {
    label = 'Username',
    value,
    onChangeText,
    status,
    statusMessage,
    suggestions,
    localSuggestions = [],
    onPickSuggestion,
    onBlurCheck,
    placeholder = 'Choose a username',
    ...rest
  },
  ref
) {
  const borderColor =
    status === 'available'
      ? '#6ee7b7'
      : status === 'taken' || status === 'error'
        ? '#fca5a5'
        : colors.border;

  const allSuggestions = [
    ...suggestions,
    ...localSuggestions.filter((s) => !suggestions.includes(s)),
  ].slice(0, 5);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.wrap, { borderColor }]}>
        <Ionicons
          name="at-outline"
          size={18}
          color={colors.slateLight}
          style={styles.icon}
          pointerEvents="none"
        />
        <TextInput
          ref={ref}
          {...rest}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.slateLight}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="username"
          textContentType="username"
          underlineColorAndroid="transparent"
          onBlur={onBlurCheck}
        />
        {status === 'checking' ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.trailing}
          />
        ) : status === 'available' ? (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#10b981"
            style={styles.trailing}
          />
        ) : status === 'taken' ? (
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.error}
            style={styles.trailing}
          />
        ) : null}
      </View>

      {statusMessage ? (
        <Text
          style={[
            styles.status,
            status === 'available' && styles.statusOk,
            (status === 'taken' || status === 'error') && styles.statusErr,
          ]}
        >
          {statusMessage}
        </Text>
      ) : null}

      {allSuggestions.length > 0 ? (
        <View style={styles.suggestBlock}>
          <Text style={styles.suggestLabel}>Try one of these</Text>
          <View style={styles.suggestRow}>
            {allSuggestions.map((s) => (
              <Pressable
                key={s}
                style={styles.suggestChip}
                onPress={() => onPickSuggestion(s)}
              >
                <Text style={styles.suggestChipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
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
    borderWidth: 1.5,
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
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm,
    minHeight: 48,
  },
  trailing: {
    marginRight: spacing.md,
  },
  status: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
  },
  statusOk: {
    color: '#0f766e',
  },
  statusErr: {
    color: colors.error,
  },
  suggestBlock: {
    marginTop: spacing.sm,
  },
  suggestLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  suggestChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
