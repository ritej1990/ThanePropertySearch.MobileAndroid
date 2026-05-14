import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '../api/singleton';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const roles = ['User', 'Owner'] as const;
const intents = ['Buy', 'Rent', 'Sell', 'Invest'] as const;

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<(typeof roles)[number]>('User');
  const [marketIntent, setMarketIntent] = useState<(typeof intents)[number]>('Buy');
  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(
    () =>
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phoneNumber.trim(),
    [email, fullName, password, phoneNumber, username]
  );

  async function handleRegister() {
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
        marketIntent,
      });

      Alert.alert(
        'Registration successful',
        res.message ?? 'Your account has been created. Please verify email before login.',
        [
          {
            text: 'Go to login',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      Alert.alert('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.sub}>Register with the same API used by your web app.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.sectionLabel}>Register as</Text>
      <View style={styles.chipRow}>
        {roles.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, role === item && styles.chipActive]}
            onPress={() => setRole(item)}
          >
            <Text style={[styles.chipText, role === item && styles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Primary interest</Text>
      <View style={styles.chipRow}>
        {intents.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, marketIntent === item && styles.chipActive]}
            onPress={() => setMarketIntent(item)}
          >
            <Text
              style={[
                styles.chipText,
                marketIntent === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.button, (disabled || submitting) && styles.buttonDisabled]}
        disabled={disabled || submitting}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Creating account...' : 'Create account'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 6,
  },
  sub: {
    color: '#64748b',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionLabel: {
    marginTop: 8,
    fontWeight: '700',
    color: '#334155',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    color: '#334155',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
