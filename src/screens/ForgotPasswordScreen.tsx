import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LoginBackdrop } from '../components/auth/LoginBackdrop';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { authApi } from '../api/singleton';
import { ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    Keyboard.dismiss();
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Email required', 'Enter the email address linked to your account.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(trimmed);
      setSent(true);
      Alert.alert(
        'Check your email',
        res.message ||
          'If this email exists, a password reset link has been sent.'
      );
    } catch (e) {
      Alert.alert(
        'Could not send reset link',
        e instanceof ApiError ? e.message : 'Try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LoginBackdrop />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityLabel="Back to sign in"
        >
          <Ionicons name="chevron-back" size={22} color={colors.heroText} />
          <Text style={styles.backText}>Sign in</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.cardAccent} pointerEvents="none" />
          <Text style={styles.eyebrow}>Account recovery</Text>
          <Text style={styles.cardTitle}>Forgot password</Text>
          <Text style={styles.cardSub}>
            Enter your registered email. We will send a secure reset link you can
            open from your inbox.
          </Text>

          <AuthTextField
            label="Email"
            icon="mail-outline"
            placeholder="name@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!sent}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <GradientButton
            label={sent ? 'Link sent' : 'Send reset link'}
            loading={loading}
            onPress={handleSubmit}
            disabled={sent}
          />

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Back to sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navyDeep,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.heroText,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gold,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: 14,
    color: colors.slateLight,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  secondaryBtn: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    ...typography.link,
    color: colors.primaryDark,
    fontSize: 14,
  },
});
