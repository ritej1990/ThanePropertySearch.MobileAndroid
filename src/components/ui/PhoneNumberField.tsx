import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatIndianMobileInput } from '../../utils/phoneNumber';
import { colors, radius, spacing, typography } from '../../theme';

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> & {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  loading?: boolean;
  hint?: string;
};

export const PhoneNumberField = forwardRef<TextInput, Props>(function PhoneNumberField(
  {
    label = 'Phone number',
    value,
    onChangeText,
    loading,
    hint,
    placeholder = '10-digit mobile',
    ...rest
  },
  ref
) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.prefix} pointerEvents="none">
          <Ionicons name="call-outline" size={16} color={colors.slateLight} />
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <View style={styles.inputWrap}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loader}
            />
          ) : null}
          <TextInput
            ref={ref}
            {...rest}
            style={[styles.input, loading && styles.inputLoading]}
            value={value}
            onChangeText={(t) => onChangeText(formatIndianMobileInput(t))}
            placeholder={placeholder}
            placeholderTextColor={colors.slateLight}
            keyboardType="phone-pad"
            maxLength={10}
            autoComplete="tel"
            textContentType="telephoneNumber"
            importantForAutofill="yes"
            inputMode="numeric"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  loader: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.navy,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  inputLoading: {
    paddingLeft: spacing.sm,
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
  },
});
