import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginBackdrop } from '../components/auth/LoginBackdrop';
import { RegisterHeader } from '../components/auth/RegisterHeader';
import { RegisterIntentChip } from '../components/auth/RegisterIntentChip';
import { RegisterSelectCard } from '../components/auth/RegisterSelectCard';
import { RegisterSuccessModal } from '../components/auth/RegisterSuccessModal';
import { UsernameField } from '../components/auth/UsernameField';
import { AuthTextField } from '../components/ui/AuthTextField';
import { PhoneNumberField } from '../components/ui/PhoneNumberField';
import { GradientButton } from '../components/ui/GradientButton';
import { PolicyFooterLinks } from '../components/policy/PolicyFooterLinks';
import { useDevicePhoneNumber } from '../hooks/useDevicePhoneNumber';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
import { useEmailAvailability } from '../hooks/useEmailAvailability';
import { ApiError } from '../api/client';
import { authApi } from '../api/singleton';
import {
  buildUsernameCandidatesFromFullName,
  sanitizeUsername,
} from '../utils/username';
import { isValidOptionalGst, normalizeGst } from '../utils/gstNumber';
import { BUILDER_PORTAL_ENABLED } from '../config/env';
import type { RootStackParamList } from '../navigation/types';
import { LegalFooter } from '../components/layout/LegalFooter';
import { useTranslation } from '../context/LocaleContext';
import type { TranslateFn } from '../i18n';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const roles = ['User', 'Owner', 'Builder', 'Agent'] as const;
const intents = ['Buy', 'Rent', 'Sell', 'Invest', 'BuilderProjects'] as const;

const ROLE_OPTIONS = [
  {
    value: 'User' as const,
    icon: 'search' as const,
    accent: '#2563eb',
    accentSoft: '#dbeafe',
  },
  {
    value: 'Owner' as const,
    icon: 'home' as const,
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
  },
  {
    value: 'Builder' as const,
    icon: 'business' as const,
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
  },
  {
    value: 'Agent' as const,
    icon: 'briefcase' as const,
    accent: '#2563eb',
    accentSoft: '#dbeafe',
  },
] as const;

const INTENT_OPTIONS = [
  { value: 'Buy' as const, icon: 'home-outline' as const },
  { value: 'Rent' as const, icon: 'key-outline' as const },
  { value: 'Sell' as const, icon: 'pricetag-outline' as const },
  { value: 'Invest' as const, icon: 'trending-up-outline' as const },
  { value: 'BuilderProjects' as const, icon: 'business-outline' as const },
] as const;

function roleLabel(t: TranslateFn, value: (typeof roles)[number]): string {
  switch (value) {
    case 'User':
      return t('register.roleUser');
    case 'Owner':
      return t('register.roleOwner');
    case 'Builder':
      return t('register.roleBuilder');
    case 'Agent':
      return t('register.roleAgent');
    default:
      return value;
  }
}

function roleDescription(t: TranslateFn, value: (typeof roles)[number]): string {
  switch (value) {
    case 'User':
      return t('register.roleUserDesc');
    case 'Owner':
      return t('register.roleOwnerDesc');
    case 'Builder':
      return t('register.roleBuilderDesc');
    case 'Agent':
      return t('register.roleAgentDesc');
    default:
      return '';
  }
}

function intentLabel(t: TranslateFn, value: (typeof intents)[number]): string {
  switch (value) {
    case 'Buy':
      return t('register.intentBuy');
    case 'Rent':
      return t('register.intentRent');
    case 'Sell':
      return t('register.intentSell');
    case 'Invest':
      return t('register.intentInvest');
    case 'BuilderProjects':
      return t('register.intentBuilder');
    default:
      return value;
  }
}

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const usernameTouched = useRef(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<(typeof roles)[number]>('User');
  const [marketIntent, setMarketIntent] = useState<(typeof intents)[number]>('Buy');
  const [companyName, setCompanyName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [operatingLocalities, setOperatingLocalities] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const showGst = role !== 'Owner';
  const showAgentFields = role === 'Agent';

  const visibleIntents = useMemo(() => {
    if (role === 'Builder') {
      return INTENT_OPTIONS.filter((o) => o.value === 'BuilderProjects');
    }
    if (role === 'Agent') {
      return INTENT_OPTIONS.filter((o) => o.value === 'Sell' || o.value === 'Invest');
    }
    if (role === 'Owner') {
      return INTENT_OPTIONS.filter((o) => o.value === 'Sell' || o.value === 'Invest');
    }
    return INTENT_OPTIONS.filter((o) => o.value !== 'BuilderProjects' && o.value !== 'Sell');
  }, [role]);

  useEffect(() => {
    if (role === 'Builder') {
      setMarketIntent('BuilderProjects');
    } else if (role === 'Agent') {
      setMarketIntent((prev) => (prev === 'Sell' || prev === 'Invest' ? prev : 'Sell'));
    } else if (role === 'Owner') {
      setMarketIntent((prev) => (prev === 'Sell' || prev === 'Invest' ? prev : 'Sell'));
    } else {
      setMarketIntent((prev) =>
        prev === 'BuilderProjects' || prev === 'Sell' ? 'Buy' : prev
      );
    }
  }, [role]);
  const [submitting, setSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [phoneAutoFilled, setPhoneAutoFilled] = useState(false);

  const { phone: devicePhone, loading: phoneLoading, source: phoneSource } =
    useDevicePhoneNumber();

  const {
    status: usernameStatus,
    message: usernameMessage,
    suggestions: usernameSuggestions,
    isAvailable: usernameAvailable,
    checkNow: checkUsernameNow,
  } = useUsernameAvailability(username);

  const {
    status: emailStatus,
    message: emailMessage,
    checkNow: checkEmailNow,
  } = useEmailAvailability(email);
  const emailTaken = emailStatus === 'taken';

  const localUsernameSuggestions = useMemo(
    () => buildUsernameCandidatesFromFullName(fullName),
    [fullName]
  );

  const applySuggestedUsername = useCallback(async () => {
    if (usernameTouched.current || username.trim()) return;

    const candidates = buildUsernameCandidatesFromFullName(fullName);
    if (candidates.length === 0) return;

    for (const candidate of candidates) {
      try {
        const res = await authApi.checkUsername(candidate);
        if (!res.exists) {
          setUsername(candidate);
          return;
        }
        for (const alt of res.suggestions ?? []) {
          const retry = await authApi.checkUsername(alt);
          if (!retry.exists) {
            setUsername(alt);
            return;
          }
        }
      } catch {
        break;
      }
    }

    setUsername(candidates[0]);
  }, [fullName, username]);

  useEffect(() => {
    if (!devicePhone || phoneNumber.length > 0) return;
    setPhoneNumber(devicePhone);
    setPhoneAutoFilled(true);
  }, [devicePhone, phoneNumber.length]);

  const phoneHint = phoneLoading
    ? t('register.phoneDetecting')
    : phoneAutoFilled && phoneSource === 'device'
      ? t('register.phoneAutoFilled')
      : undefined;

  const disabled = useMemo(
    () =>
      !fullName.trim() ||
      !username.trim() ||
      username.trim().length < 3 ||
      !usernameAvailable ||
      !email.trim() ||
      emailTaken ||
      !password.trim() ||
      password.length < 6 ||
      confirmPassword !== password ||
      phoneNumber.length !== 10 ||
      (showAgentFields && (!companyName.trim() || !reraNumber.trim())) ||
      (showGst && gstNumber.trim().length > 0 && !isValidOptionalGst(gstNumber)),
    [
      email,
      emailTaken,
      fullName,
      password,
      confirmPassword,
      phoneNumber,
      username,
      usernameAvailable,
      companyName,
      reraNumber,
      showAgentFields,
      showGst,
      gstNumber,
    ]
  );

  function handleUsernameChange(value: string) {
    usernameTouched.current = true;
    setUsername(sanitizeUsername(value));
  }

  function pickUsernameSuggestion(value: string) {
    usernameTouched.current = true;
    setUsername(sanitizeUsername(value));
  }

  async function handleRegister() {
    Keyboard.dismiss();
    if (!usernameAvailable) {
      await checkUsernameNow(username);
      Alert.alert(
        t('register.usernameUnavailable'),
        t('register.usernameUnavailableBody')
      );
      return;
    }
    if (emailTaken) {
      await checkEmailNow(email);
      Alert.alert(
        t('register.emailUnavailable'),
        t('register.emailUnavailableBody')
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        t('register.passwordsMismatch'),
        t('register.passwordsMismatchBody')
      );
      return;
    }
    if (disabled) {
      Alert.alert(t('shared.missingDetails'), t('register.allRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await authApi.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
        role,
        marketIntent:
          marketIntent === 'BuilderProjects' ? 'Builder projects' : marketIntent,
        gstNumber: showGst && gstNumber.trim() ? normalizeGst(gstNumber) : null,
        companyName: showAgentFields ? companyName.trim() : null,
        reraNumber: showAgentFields ? reraNumber.trim().toUpperCase() : null,
        whatsAppNumber: showAgentFields && whatsAppNumber.trim() ? whatsAppNumber.trim() : null,
        operatingLocalities:
          showAgentFields && operatingLocalities.trim() ? operatingLocalities.trim() : null,
        profilePhotoUrl:
          showAgentFields && profilePhotoUrl.trim() ? profilePhotoUrl.trim() : null,
      });

      setSuccessMessage(
        res.message ??
          'Your account has been created. Please verify your email before signing in.'
      );
      setSuccessVisible(true);
    } catch (e) {
      let message = e instanceof Error ? e.message : 'Registration failed';
      if (e instanceof ApiError && e.rawBody) {
        try {
          const body = JSON.parse(e.rawBody) as {
            message?: string;
            suggestions?: string[];
            errorCode?: string;
          };
          if (body.message) message = body.message;
          if (
            body.errorCode === 'USERNAME_EXISTS' &&
            body.suggestions?.length
          ) {
            pickUsernameSuggestion(body.suggestions[0]);
            message = `${message}\n\nTry: ${body.suggestions.join(', ')}`;
          }
        } catch {
          /* keep message */
        }
      }
      Alert.alert(t('register.registrationFailed'), message);
    } finally {
      setSubmitting(false);
    }
  }

  function goToLogin() {
    setSuccessVisible(false);
    navigation.goBack();
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LoginBackdrop />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack();
          }}
          hitSlop={8}
          accessibilityLabel={t('register.backA11y')}
        >
          <Ionicons name="chevron-back" size={22} color={colors.heroText} />
          <Text style={styles.backText}>{t('register.signInLink')}</Text>
        </Pressable>

        <RegisterHeader />

        <View style={styles.card}>
          <View style={styles.cardAccent} pointerEvents="none" />

          <View style={styles.sectionHead}>
            <Text style={styles.eyebrow}>{t('register.step1Eyebrow')}</Text>
            <Text style={styles.sectionTitle}>{t('register.step1Title')}</Text>
          </View>

          <View style={styles.roleList}>
            {ROLE_OPTIONS.filter(
              (opt) => BUILDER_PORTAL_ENABLED || opt.value !== 'Builder'
            ).map((opt) => (
              <RegisterSelectCard
                key={opt.value}
                label={roleLabel(t, opt.value)}
                description={roleDescription(t, opt.value)}
                icon={opt.icon}
                accent={opt.accent}
                accentSoft={opt.accentSoft}
                selected={role === opt.value}
                onPress={() => setRole(opt.value)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t('register.primaryInterest')}</Text>
          <View style={styles.intentRow}>
            {visibleIntents.map((opt) => (
              <RegisterIntentChip
                key={opt.value}
                label={intentLabel(t, opt.value)}
                icon={opt.icon}
                selected={marketIntent === opt.value}
                onPress={() => setMarketIntent(opt.value)}
              />
            ))}
          </View>

          <View style={[styles.sectionHead, styles.sectionHeadSpaced]}>
            <Text style={styles.eyebrow}>{t('register.step2Eyebrow')}</Text>
            <Text style={styles.sectionTitle}>{t('register.step2Title')}</Text>
            <Text style={styles.requiredHint}>
              <Text style={styles.requiredStar}>*</Text> {t('register.allRequired')}
            </Text>
          </View>

          <AuthTextField
            label={t('register.fullName')}
            icon="person-outline"
            placeholder={t('register.fullName')}
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              applySuggestedUsername();
              usernameRef.current?.focus();
            }}
            onBlur={() => applySuggestedUsername()}
          />
          <UsernameField
            ref={usernameRef}
            value={username}
            onChangeText={handleUsernameChange}
            status={usernameStatus}
            statusMessage={usernameMessage}
            suggestions={usernameSuggestions}
            localSuggestions={
              usernameStatus === 'taken' || !username.trim()
                ? localUsernameSuggestions
                : []
            }
            onPickSuggestion={pickUsernameSuggestion}
            onBlurCheck={() => checkUsernameNow(username)}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <AuthTextField
            ref={emailRef}
            label={t('shared.email')}
            icon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onBlur={() => checkEmailNow(email)}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {emailMessage ? (
            <Text
              style={[
                styles.fieldStatus,
                emailStatus === 'available' && styles.fieldStatusOk,
                (emailStatus === 'taken' || emailStatus === 'error') &&
                  styles.fieldStatusErr,
              ]}
            >
              {emailMessage}
            </Text>
          ) : null}
          <AuthTextField
            ref={passwordRef}
            label={t('register.password')}
            icon="lock-closed-outline"
            placeholder={t('register.createPassword')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <AuthTextField
            ref={confirmPasswordRef}
            label={t('register.confirmPassword')}
            icon="lock-closed-outline"
            placeholder={t('register.reenterPassword')}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
          {confirmPassword.length > 0 && confirmPassword !== password ? (
            <Text style={[styles.fieldStatus, styles.fieldStatusErr]}>
              {t('register.passwordsDoNotMatch')}
            </Text>
          ) : null}
          <PhoneNumberField
            ref={phoneRef}
            value={phoneNumber}
            onChangeText={(v) => {
              setPhoneNumber(v);
              if (phoneAutoFilled && v !== devicePhone) {
                setPhoneAutoFilled(false);
              }
            }}
            loading={phoneLoading}
            hint={phoneHint}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {showAgentFields ? (
            <>
              <AuthTextField
                label={t('register.companyAgency')}
                icon="business-outline"
                placeholder={t('register.agencyNamePlaceholder')}
                value={companyName}
                onChangeText={setCompanyName}
              />
              <AuthTextField
                label={t('register.reraNumber')}
                icon="shield-checkmark-outline"
                placeholder={t('register.reraIdPlaceholder')}
                autoCapitalize="characters"
                value={reraNumber}
                onChangeText={setReraNumber}
              />
              <AuthTextField
                label={t('register.whatsappOptional')}
                icon="logo-whatsapp"
                placeholder={t('register.whatsappHint')}
                keyboardType="number-pad"
                value={whatsAppNumber}
                onChangeText={setWhatsAppNumber}
              />
              <AuthTextField
                label={t('register.operatingAreasOptional')}
                icon="map-outline"
                placeholder={t('register.operatingAreasPlaceholder')}
                value={operatingLocalities}
                onChangeText={setOperatingLocalities}
              />
              <AuthTextField
                label={t('register.photoUrlOptional')}
                icon="image-outline"
                placeholder={t('builder.urlPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                value={profilePhotoUrl}
                onChangeText={setProfilePhotoUrl}
              />
            </>
          ) : null}

          {showGst ? (
            <AuthTextField
              label={t('register.gstOptional')}
              icon="receipt-outline"
              placeholder={t('register.gstPlaceholder')}
              autoCapitalize="characters"
              value={gstNumber}
              onChangeText={(v) => setGstNumber(v.slice(0, 15))}
            />
          ) : null}

          <GradientButton
            testID="register-submit"
            label={t('register.createAccountBtn')}
            loading={submitting}
            disabled={disabled}
            onPress={handleRegister}
            style={styles.submitBtn}
          />

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={16} color="#0f766e" />
            <Text style={styles.trustText}>{t('register.verifyAfterSignup')}</Text>
          </View>
        </View>

        <LegalFooter variant="onDark" style={styles.legalFooter} />
      </ScrollView>

      <RegisterSuccessModal
        visible={successVisible}
        message={successMessage}
        email={email.trim()}
        onSignIn={goToLogin}
      />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.heroText,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
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
  sectionHead: {
    marginBottom: spacing.md,
  },
  sectionHeadSpaced: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.navy,
  },
  requiredHint: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: spacing.xs,
  },
  requiredStar: {
    color: colors.error,
    fontWeight: '700',
  },
  roleList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.sm,
  },
  intentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  fieldStatus: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
  },
  fieldStatusOk: {
    color: '#0f766e',
  },
  fieldStatusErr: {
    color: colors.error,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#0f766e',
  },
  legalFooter: {
    marginTop: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
});
