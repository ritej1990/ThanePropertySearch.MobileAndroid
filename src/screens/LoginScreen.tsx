import React, { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginBackdrop } from '../components/auth/LoginBackdrop';
import { LoginHeader } from '../components/auth/LoginHeader';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { PolicyFooterLinks } from '../components/policy/PolicyFooterLinks';
import { useAuth } from '../context/AuthContext';
import { resetEmailVerificationToastSession } from '../utils/emailVerificationSession';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const FORGOT_PASSWORD_URL = 'https://www.thaneflats.com/Account/ForgotPassword';

/**
 * Plain View layout (no ScrollView / KeyboardAvoidingView) keeps Android keyboard stable.
 * Decoration uses pointerEvents="none" only.
 */
export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    Keyboard.dismiss();
    if (!username.trim() || !password) {
      Alert.alert('Missing details', 'Enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      resetEmailVerificationToastSession();
      await login(username.trim(), password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      Alert.alert('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
  }

  function openForgotPassword() {
    Keyboard.dismiss();
    Linking.openURL(FORGOT_PASSWORD_URL).catch(() => {
      Alert.alert(
        'Forgot password',
        'Visit thaneflats.com in your browser to reset your password.'
      );
    });
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
        <LoginHeader />

        <View style={styles.formArea}>
          <View style={styles.card}>
            <View style={styles.cardAccent} pointerEvents="none" />
            <Text style={styles.eyebrow}>Account access</Text>
            <Text style={styles.cardTitle}>Sign in to continue</Text>
            <Text style={styles.cardSub}>
              Same username & password as www.thaneflats.com
            </Text>

            <AuthTextField
              label="Username"
              icon="person-outline"
              placeholder="Enter username"
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
              ref={passwordRef}
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Pressable
              style={styles.forgot}
              onPress={openForgotPassword}
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <GradientButton
              label="Sign in"
              loading={loading}
              onPress={handleLogin}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New here?</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('Register');
              }}
            >
              <Text style={styles.secondaryBtnText}>Create an account</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer} pointerEvents="none">
          Thane Flats · thane property search
        </Text>
        <PolicyFooterLinks navigation={navigation} variant="dark" />
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
  },
  formArea: {
    flex: 1,
    justifyContent: 'center',
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
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(248, 250, 252, 0.72)',
    letterSpacing: 0.3,
    marginTop: spacing.md,
  },
});
