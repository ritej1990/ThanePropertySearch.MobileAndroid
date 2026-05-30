import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usersApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useAuth } from '../context/AuthContext';
import { useResendEmailVerification } from '../hooks/useResendEmailVerification';
import type { RootStackParamList } from '../navigation/types';
import { getRoleLabel } from '../utils/profileDisplay';
import { isOwnerRole } from '../utils/roles';
import { isValidOptionalGst, normalizeGst } from '../utils/gstNumber';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { resend, sending, emailConfirmed } = useResendEmailVerification();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketIntent, setMarketIntent] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const showGst = !isOwnerRole(profile?.role);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const me = await usersApi.getMe();
      setFullName(me.fullName ?? '');
      setPhone(me.phoneNumber ?? '');
      setMarketIntent(me.marketIntent ?? '');
      setGstNumber(me.gstNumber ?? '');
      await refreshProfile();
    } catch (e) {
      Alert.alert(
        'Could not load profile',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function handleSave() {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Full name and phone are required.');
      return;
    }
    if (showGst && gstNumber.trim() && !isValidOptionalGst(gstNumber)) {
      Alert.alert('Invalid GSTIN', 'Enter a valid 15-character GSTIN or leave blank.');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateMe({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        marketIntent: marketIntent.trim() || null,
        gstNumber: showGst && gstNumber.trim() ? normalizeGst(gstNumber) : null,
      });
      await refreshProfile();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      {loading ? (
        <BrandLoading message="Loading profile…" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <PageHero
            variant="user"
            icon="person-circle-outline"
            title="My profile"
            subtitle="Account details synced with your Thane Flats login."
          />

          {!emailConfirmed ? (
            <View style={styles.verifyBanner}>
              <Text style={styles.verifyTitle}>Email not verified</Text>
              <Text style={styles.verifySub}>
                Verify your email to unlock the full experience.
              </Text>
              <GradientButton
                label={sending ? 'Sending…' : 'Resend verification'}
                loading={sending}
                onPress={resend}
                style={styles.verifyBtn}
              />
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.readLabel}>Username</Text>
            <Text style={styles.readValue}>{profile?.username ?? '—'}</Text>
            <Text style={styles.readLabel}>Email</Text>
            <Text style={styles.readValue}>{profile?.email ?? '—'}</Text>
            <Text style={styles.readLabel}>Role</Text>
            <Text style={styles.readValue}>
              {getRoleLabel(profile?.role)}
            </Text>
          </View>

          <View style={styles.card}>
            <AuthTextField
              label="Full name"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
            />
            <AuthTextField
              label="Phone (10-digit Indian mobile)"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <AuthTextField
              label="Market intent (optional)"
              icon="compass-outline"
              placeholder="e.g. Rent in Thane West"
              value={marketIntent}
              onChangeText={setMarketIntent}
            />
            {showGst ? (
              <AuthTextField
                label="GSTIN (optional)"
                icon="receipt-outline"
                placeholder="15-character GSTIN for invoices"
                autoCapitalize="characters"
                value={gstNumber}
                onChangeText={setGstNumber}
              />
            ) : null}
            <GradientButton
              label="Save changes"
              loading={saving}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      )}
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  verifyBanner: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  verifyTitle: { fontSize: 15, fontWeight: '800', color: '#92400e' },
  verifySub: { fontSize: 13, color: '#78350f', marginTop: 4, marginBottom: spacing.md },
  verifyBtn: { marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  readLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  readValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 4,
  },
});
