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
import { useDevicePhoneNumber } from '../hooks/useDevicePhoneNumber';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
import { ApiError } from '../api/client';
import { authApi } from '../api/singleton';
import {
  buildUsernameCandidatesFromFullName,
  sanitizeUsername,
} from '../utils/username';
import type { RootStackParamList } from '../navigation/types';
import { LegalFooter } from '../components/layout/LegalFooter';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const roles = ['User', 'Owner', 'Builder'] as const;
const intents = ['Buy', 'Rent', 'Sell', 'Invest', 'BuilderProjects'] as const;

const ROLE_OPTIONS = [
  {
    value: 'User' as const,
    label: 'Rent / buy user',
    description: 'Search Thane homes, chat & schedule visits',
    icon: 'search' as const,
    accent: '#2563eb',
    accentSoft: '#dbeafe',
  },
  {
    value: 'Owner' as const,
    label: 'Property owner',
    description: 'Post listings, manage inquiries & plans',
    icon: 'home' as const,
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
  },
  {
    value: 'Builder' as const,
    label: 'Builder / developer',
    description: 'List projects, units & receive buyer leads',
    icon: 'business' as const,
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
  },
] as const;

const INTENT_OPTIONS = [
  { value: 'Buy' as const, label: 'Buy', icon: 'home-outline' as const },
  { value: 'Rent' as const, label: 'Rent', icon: 'key-outline' as const },
  { value: 'Sell' as const, label: 'Sell', icon: 'pricetag-outline' as const },
  { value: 'Invest' as const, label: 'Invest', icon: 'trending-up-outline' as const },
  {
    value: 'BuilderProjects' as const,
    label: 'Builder projects',
    icon: 'business-outline' as const,
  },
] as const;

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const usernameTouched = useRef(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<(typeof roles)[number]>('User');
  const [marketIntent, setMarketIntent] = useState<(typeof intents)[number]>('Buy');

  const visibleIntents = useMemo(() => {
    if (role === 'Builder') {
      return INTENT_OPTIONS.filter((o) => o.value === 'BuilderProjects');
    }
    if (role === 'Owner') {
      return INTENT_OPTIONS.filter((o) => o.value === 'Sell' || o.value === 'Invest');
    }
    return INTENT_OPTIONS.filter((o) => o.value !== 'BuilderProjects' && o.value !== 'Sell');
  }, [role]);

  useEffect(() => {
    if (role === 'Builder') {
      setMarketIntent('BuilderProjects');
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
    ? 'Detecting mobile number…'
    : phoneAutoFilled && phoneSource === 'device'
      ? 'Filled from this device — edit if needed'
      : undefined;

  const disabled = useMemo(
    () =>
      !fullName.trim() ||
      !username.trim() ||
      username.trim().length < 3 ||
      !usernameAvailable ||
      !email.trim() ||
      !password.trim() ||
      phoneNumber.length !== 10,
    [email, fullName, password, phoneNumber, username, usernameAvailable]
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
        'Username unavailable',
        'Pick an available username or tap a suggestion below.'
      );
      return;
    }
    if (disabled) {
      Alert.alert('Missing details', 'Please fill all required fields.');
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
      Alert.alert('Registration failed', message);
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
          accessibilityLabel="Back to sign in"
        >
          <Ionicons name="chevron-back" size={22} color={colors.heroText} />
          <Text style={styles.backText}>Sign in</Text>
        </Pressable>

        <RegisterHeader />

        <View style={styles.card}>
          <View style={styles.cardAccent} pointerEvents="none" />

          <View style={styles.sectionHead}>
            <Text style={styles.eyebrow}>Step 1</Text>
            <Text style={styles.sectionTitle}>How will you use Thane Flats?</Text>
          </View>

          <View style={styles.roleList}>
            {ROLE_OPTIONS.map((opt) => (
              <RegisterSelectCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                accent={opt.accent}
                accentSoft={opt.accentSoft}
                selected={role === opt.value}
                onPress={() => setRole(opt.value)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Primary interest</Text>
          <View style={styles.intentRow}>
            {visibleIntents.map((opt) => (
              <RegisterIntentChip
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={marketIntent === opt.value}
                onPress={() => setMarketIntent(opt.value)}
              />
            ))}
          </View>

          <View style={[styles.sectionHead, styles.sectionHeadSpaced]}>
            <Text style={styles.eyebrow}>Step 2</Text>
            <Text style={styles.sectionTitle}>Your details</Text>
            <Text style={styles.requiredHint}>
              <Text style={styles.requiredStar}>*</Text> All fields required
            </Text>
          </View>

          <AuthTextField
            label="Full name"
            icon="person-outline"
            placeholder="Full name"
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
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <AuthTextField
            ref={passwordRef}
            label="Password"
            icon="lock-closed-outline"
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
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

          <GradientButton
            label="Create account"
            loading={submitting}
            disabled={disabled}
            onPress={handleRegister}
            style={styles.submitBtn}
          />

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={16} color="#0f766e" />
            <Text style={styles.trustText}>
              Same account works on www.thaneflats.com — verify email after signup
            </Text>
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
