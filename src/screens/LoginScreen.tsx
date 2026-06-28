import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginBackdrop } from '../components/auth/LoginBackdrop';
import { LoginMethodTabs, type LoginMethod } from '../components/auth/LoginMethodTabs';
import { ThaneFlatsLogo } from '../components/ui/ThaneFlatsLogo';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { PhoneNumberField } from '../components/ui/PhoneNumberField';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LocaleContext';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useSiteMaintenance, MAINTENANCE_BANNER_BODY_HEIGHT } from '../context/SiteMaintenanceContext';
import { authApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { resetEmailVerificationToastSession } from '../utils/emailVerificationSession';
import { apiErrorMessage } from '../utils/apiErrorMessage';
import { normalizeIndianMobile } from '../utils/phoneNumber';
import type { RootStackParamList } from '../navigation/types';
import { LegalFooter } from '../components/layout/LegalFooter';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const isWeb = Platform.OS === 'web';
const DEFAULT_RESEND_SECONDS = 60;

function parseRetryAfterSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError) || !error.rawBody) return null;
  try {
    const body = JSON.parse(error.rawBody) as { retryAfterSeconds?: number };
    return typeof body.retryAfterSeconds === 'number' ? body.retryAfterSeconds : null;
  } catch {
    return null;
  }
}

/**
 * Plain View on native (keyboard-stable). ScrollView on web so header, form,
 * and legal footer do not overlap on shorter viewports.
 */
export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const otpRef = useRef<TextInput>(null);
  const { login, loginWithOtp } = useAuth();
  const { t } = useTranslation();
  const { enabled: maintenanceBanner } = useSiteMaintenance();

  const [method, setMethod] = useState<LoginMethod>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownActive = resendCooldown > 0;

  useEffect(() => {
    if (!cooldownActive) return;
    const id = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownActive]);

  function switchMethod(next: LoginMethod) {
    setMethod(next);
    setOtpError('');
    setOtpSuccess('');
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!username.trim() || !password) {
      Alert.alert(t('auth.missingDetails'), t('auth.enterCredentials'));
      return;
    }

    setLoading(true);
    try {
      resetEmailVerificationToastSession();
      await login(username.trim(), password);
    } catch (e: unknown) {
      const msg = apiErrorMessage(e, t('auth.signInFailed'));
      Alert.alert(t('auth.signInFailed'), msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    Keyboard.dismiss();
    setOtpError('');
    setOtpSuccess('');

    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setOtpError(t('auth.otpInvalidPhone'));
      return;
    }
    if (resendCooldown > 0) return;

    setSendingOtp(true);
    try {
      const data = await authApi.sendLoginOtp({ phoneNumber: normalized });
      setOtpSent(true);
      setOtpSuccess(data.message || t('auth.otpSent'));
      setResendCooldown(DEFAULT_RESEND_SECONDS);
      otpRef.current?.focus();
    } catch (e: unknown) {
      setOtpError(apiErrorMessage(e, t('auth.otpSendFailed')));
      const retry = parseRetryAfterSeconds(e);
      if (retry != null) setResendCooldown(retry);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    Keyboard.dismiss();
    setOtpError('');
    setOtpSuccess('');

    if (!otpSent) {
      setOtpError(t('auth.otpSendFirst'));
      return;
    }

    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setOtpError(t('auth.otpInvalidPhone'));
      return;
    }
    if (otpCode.trim().length < 4) {
      setOtpError(t('auth.otpEnterCode'));
      otpRef.current?.focus();
      return;
    }

    setVerifyingOtp(true);
    try {
      resetEmailVerificationToastSession();
      await loginWithOtp(normalized, otpCode);
    } catch (e: unknown) {
      setOtpError(apiErrorMessage(e, t('auth.otpVerifyFailed')));
    } finally {
      setVerifyingOtp(false);
    }
  }

  const sendOtpLabel =
    resendCooldown > 0
      ? t('auth.otpResendIn', { seconds: String(resendCooldown) })
      : otpSent
        ? t('auth.otpSend')
        : t('auth.otpSend');

  const paddingStyle = {
    paddingTop: insets.top + (maintenanceBanner ? MAINTENANCE_BANNER_BODY_HEIGHT : 0) + spacing.md,
    paddingBottom: insets.bottom + spacing.md,
  };

  const body = (
    <>
      <View style={styles.topBrand} pointerEvents="box-none">
        <View style={styles.langRow}>
          <LanguageToggle variant="auth" />
        </View>
        <ThaneFlatsLogo size={44} showWordmark animated onDark />
        <Text style={styles.topTagline}>{t('auth.signInContinue')}</Text>
      </View>

      <View style={isWeb ? styles.formAreaWeb : styles.formArea}>
        <View style={styles.card}>
          <View style={styles.cardAccent} pointerEvents="none" />
          <View style={styles.cardIconRow}>
            <View style={styles.cardIcon}>
              <Ionicons name="log-in-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardIconText}>
              <Text style={styles.cardTitle}>{t('auth.welcomeBack')}</Text>
              <Text style={styles.cardSub}>
                {method === 'password' ? t('auth.signInHint') : t('auth.otpSignInHint')}
              </Text>
            </View>
          </View>

          <LoginMethodTabs
            method={method}
            onChange={switchMethod}
            passwordLabel={t('auth.tabPassword')}
            otpLabel={t('auth.tabOtp')}
          />

          {method === 'password' ? (
            <>
              <AuthTextField
                testID="login-username"
                label={t('auth.username')}
                icon="person-outline"
                placeholder={t('auth.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <AuthTextField
                testID="login-password"
                ref={passwordRef}
                label={t('auth.password')}
                icon="lock-closed-outline"
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Pressable
                style={styles.forgot}
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.navigate('ForgotPassword');
                }}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </Pressable>

              <GradientButton
                testID="login-submit"
                label={t('auth.signIn')}
                loading={loading}
                onPress={handleLogin}
              />
            </>
          ) : (
            <>
              <PhoneNumberField
                testID="login-otp-phone"
                label={t('auth.otpMobileLabel')}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('auth.otpMobilePlaceholder')}
                hint={t('auth.otpMobileHint')}
                loading={sendingOtp}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />

              {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}
              {otpSuccess ? <Text style={styles.otpSuccess}>{otpSuccess}</Text> : null}

              <Pressable
                testID="login-otp-send"
                style={[
                  styles.sendOtpBtn,
                  (sendingOtp || resendCooldown > 0) && styles.sendOtpBtnDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={sendingOtp || resendCooldown > 0}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.sendOtpBtnText}>
                  {sendingOtp ? t('auth.otpSending') : sendOtpLabel}
                </Text>
              </Pressable>

              {otpSent ? (
                <AuthTextField
                  testID="login-otp-code"
                  ref={otpRef}
                  label={t('auth.otpCodeLabel')}
                  icon="shield-checkmark-outline"
                  placeholder={t('auth.otpCodePlaceholder')}
                  value={otpCode}
                  onChangeText={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 8))}
                  keyboardType="number-pad"
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  maxLength={8}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyOtp}
                />
              ) : null}

              <GradientButton
                testID="login-otp-verify"
                label={t('auth.otpVerifyLogin')}
                loading={verifyingOtp}
                onPress={handleVerifyOtp}
                disabled={!otpSent || otpCode.trim().length < 4}
              />
            </>
          )}

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={15} color="#0f766e" />
            <Text style={styles.trustText}>{t('auth.secureLogin')}</Text>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.newHere')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            testID="login-create-account"
            style={styles.secondaryBtn}
            onPress={() => {
              Keyboard.dismiss();
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.secondaryBtnText}>{t('auth.createAccount')}</Text>
          </Pressable>
        </View>
      </View>
      <LegalFooter variant="onDark" style={styles.legalFooter} />
    </>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LoginBackdrop />

      {isWeb ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.contentScrollable, paddingStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, paddingStyle]}>{body}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navyDeep,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  contentScrollable: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  formArea: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  topBrand: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    width: '100%',
  },
  langRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    width: '100%',
    alignItems: 'flex-end',
  },
  topTagline: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(248,250,252,0.82)',
  },
  formAreaWeb: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  cardIconText: { flex: 1, minWidth: 0 },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: 14,
    color: colors.slateLight,
    lineHeight: 20,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
    lineHeight: 17,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotText: {
    ...typography.link,
    fontSize: 14,
    color: colors.primaryDark,
  },
  otpError: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '600',
    color: '#b91c1c',
    lineHeight: 18,
  },
  otpSuccess: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
    lineHeight: 18,
  },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  sendOtpBtnDisabled: {
    opacity: 0.65,
  },
  sendOtpBtnText: {
    ...typography.link,
    color: colors.primaryDark,
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
  dividerText: {
    fontSize: 13,
    color: colors.slateLight,
    fontWeight: '600',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryBtnText: {
    ...typography.link,
    color: colors.primaryDark,
  },
  legalFooter: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
