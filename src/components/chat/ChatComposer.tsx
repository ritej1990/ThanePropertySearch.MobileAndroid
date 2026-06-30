import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  sending?: boolean;
  disabled?: boolean;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  placeholder,
  sending = false,
  disabled = false,
  bottomInset = 0,
  style,
}: Props) {
  const canSend = value.trim().length > 0 && !sending && !disabled;

  return (
    <View style={[styles.bar, { paddingBottom: spacing.md + bottomInset }, style]}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.slateLight}
          multiline
          maxLength={2000}
          editable={!disabled && !sending}
        />
      </View>
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.sendOuter,
          !canSend && styles.sendDisabled,
          pressed && canSend && styles.sendPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
      >
        <LinearGradient
          colors={canSend ? ['#6d28d9', '#4c1d95'] : ['#94a3b8', '#64748b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sendBtn}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.heroText} />
          ) : (
            <Ionicons name="send" size={18} color={colors.heroText} />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
    lineHeight: 21,
    color: colors.navy,
    paddingVertical: spacing.xs,
  },
  sendOuter: {
    marginBottom: 2,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.55,
  },
  sendPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
