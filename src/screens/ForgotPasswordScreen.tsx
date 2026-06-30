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
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { authApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    Keyboard.dismiss();
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert(t('auth.forgotPasswordEmailRequired'), t('auth.forgotPasswordEnterEmail'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(trimmed);
      setSent(true);
      Alert.alert(
        t('auth.forgotPasswordCheckEmail'),
        res.message || t('auth.forgotPasswordCheckEmailBody')
      );
    } catch (e) {
      Alert.alert(
        t('auth.forgotPasswordSendFailed'),
        e instanceof ApiError ? e.message : t('auth.forgotPasswordTryAgain')
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
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityLabel={t('auth.forgotPasswordBackA11y')}
          >
            <Ionicons name="chevron-back" size={22} color={colors.heroText} />
            <Text style={styles.backText}>{t('auth.signIn')}</Text>
          </Pressable>
          <LanguageToggle variant="auth" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} pointerEvents="none" />
          <Text style={styles.eyebrow}>{t('auth.forgotPasswordEyebrow')}</Text>
          <Text style={styles.cardTitle}>{t('auth.forgotPasswordTitle')}</Text>
          <Text style={styles.cardSub}>{t('auth.forgotPasswordSub')}</Text>

          <AuthTextField
            label={t('auth.email')}
            icon="mail-outline"
            placeholder={t('auth.emailPlaceholder')}
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
            label={sent ? t('auth.forgotPasswordLinkSent') : t('auth.forgotPasswordSendLink')}
            loading={loading}
            onPress={handleSubmit}
            disabled={sent}
          />

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>{t('auth.forgotPasswordBackToSignIn')}</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
