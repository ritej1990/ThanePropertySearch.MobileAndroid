import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type ToastVariant = 'info' | 'email' | 'success' | 'error';

type Props = {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
};

const ICON: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  email: 'mail-unread',
  success: 'checkmark-circle',
  error: 'alert-circle',
};

export function AppToast({ visible, message, variant = 'info', onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -12,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  const isEmail = variant === 'email';

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrap,
        { top: insets.top + 52 },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.toast, isEmail && styles.toastEmail]}>
        <Ionicons
          name={ICON[variant]}
          size={20}
          color={isEmail ? '#0369a1' : colors.navy}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityLabel="Dismiss"
          style={styles.close}
        >
          <Ionicons name="close" size={18} color={colors.slateMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 420,
    width: '100%',
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  toastEmail: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  icon: {
    marginTop: 1,
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
    fontWeight: '600',
  },
  close: {
    padding: 4,
    marginLeft: spacing.xs,
  },
});
