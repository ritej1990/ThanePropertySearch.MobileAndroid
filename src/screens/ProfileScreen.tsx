import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { agentListingsApi, agentProfilesApi, usersApi } from '../api/singleton';
import { ApiError } from '../api/client';
import type { AgentProfile } from '../api/agentTypes';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useAuth } from '../context/AuthContext';
import { useResendEmailVerification } from '../hooks/useResendEmailVerification';
import type { RootStackParamList } from '../navigation/types';
import { getRoleLabel } from '../utils/profileDisplay';
import { isAgentRole, isOwnerRole } from '../utils/roles';
import { isValidOptionalGst, normalizeGst } from '../utils/gstNumber';
import {
  agentApprovalStatusLabel,
  isAgentProfileApproved,
  isAgentProfileRejected,
} from '../utils/agentApproval';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { resend, sending, emailConfirmed } = useResendEmailVerification();
  const isAgent = isAgentRole(profile?.role);
  const showGst = !isOwnerRole(profile?.role) && !isAgent;
  const showMarketIntent = !isAgent;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [authProvider, setAuthProvider] = useState('');
  const [phone, setPhone] = useState('');
  const [marketIntent, setMarketIntent] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [operatingLocalities, setOperatingLocalities] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [reraCertificateUrl, setReraCertificateUrl] = useState('');
  const [savingAgent, setSavingAgent] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const approved = isAgentProfileApproved(agentProfile?.approvalStatus);
  const rejected = isAgentProfileRejected(agentProfile?.approvalStatus);

  const load = useCallback(async () => {
    try {
      const me = await usersApi.getMe();
      setFullName(me.fullName ?? '');
      setEmail(me.email ?? '');
      setAuthProvider(me.authProvider ?? '');
      setPhone(me.phoneNumber ?? '');
      setMarketIntent(me.marketIntent ?? '');
      setGstNumber(me.gstNumber ?? '');

      if (isAgentRole(me.role)) {
        const agent = await agentProfilesApi.getMe();
        setAgentProfile(agent);
        setCompanyName(agent.companyName ?? '');
        setWhatsAppNumber(agent.whatsAppNumber ?? '');
        setReraNumber(agent.reraNumber ?? '');
        setOperatingLocalities(agent.operatingLocalities ?? '');
        setProfilePhotoUrl(agent.profilePhotoUrl ?? '');
        setReraCertificateUrl(agent.reraCertificateUrl ?? '');
      }

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
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Full name, email and phone are required.');
      return;
    }
    if (showGst && gstNumber.trim() && !isValidOptionalGst(gstNumber)) {
      Alert.alert('Invalid GSTIN', 'Enter a valid 15-character GSTIN or leave blank.');
      return;
    }
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        marketIntent: showMarketIntent ? marketIntent.trim() || null : null,
        gstNumber: showGst && gstNumber.trim() ? normalizeGst(gstNumber) : null,
      });
      setEmail(updated.email ?? email.trim());
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

  async function handleSaveAgent() {
    if (!companyName.trim() || !whatsAppNumber.trim() || !reraNumber.trim()) {
      Alert.alert(
        'Missing details',
        'Company name, WhatsApp number and RERA number are required.'
      );
      return;
    }
    setSavingAgent(true);
    try {
      const updated = await agentProfilesApi.updateMe({
        profilePhotoUrl: profilePhotoUrl.trim() || null,
        companyName: companyName.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        reraNumber: reraNumber.trim(),
        operatingLocalities: operatingLocalities.trim(),
      });
      setAgentProfile(updated);
      Alert.alert(
        isAgentProfileApproved(updated.approvalStatus) ? 'Saved' : 'Sent for review',
        isAgentProfileApproved(updated.approvalStatus)
          ? 'Your agency profile has been updated.'
          : 'Your agency profile was updated and sent back for admin review.'
      );
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setSavingAgent(false);
    }
  }

  async function pickCertificate() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photos access needed',
        'Allow photo library access to upload your RERA certificate, or paste a link instead.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const ext = asset.mimeType?.includes('png')
      ? 'png'
      : asset.mimeType?.includes('webp')
        ? 'webp'
        : 'jpg';
    setUploadingCert(true);
    try {
      const res = await agentListingsApi.uploadVerificationDocument({
        uri: asset.uri,
        fileName: asset.fileName ?? `rera-${Date.now()}.${ext}`,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      setReraCertificateUrl(res.documentUrl);
      Alert.alert('Certificate uploaded', 'Your RERA certificate is attached.');
    } catch (e) {
      Alert.alert(
        'Upload failed',
        e instanceof ApiError ? e.message : 'Try again, or paste a certificate link instead.'
      );
    } finally {
      setUploadingCert(false);
    }
  }

  async function handleResubmit() {
    if (!reraNumber.trim() || !reraCertificateUrl.trim()) {
      Alert.alert(
        'Missing details',
        'RERA number and a RERA certificate link are required to resubmit.'
      );
      return;
    }
    setSavingAgent(true);
    try {
      const updated = await agentProfilesApi.resubmitMe({
        reraNumber: reraNumber.trim(),
        reraCertificateUrl: reraCertificateUrl.trim(),
        companyName: companyName.trim() || null,
        whatsAppNumber: whatsAppNumber.trim() || null,
        operatingLocalities: operatingLocalities.trim() || null,
      });
      setAgentProfile(updated);
      Alert.alert('Resubmitted', 'Your agency profile was sent back for admin review.');
    } catch (e) {
      Alert.alert(
        'Could not resubmit',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setSavingAgent(false);
    }
  }

  const emailLocked = authProvider.toLowerCase() === 'google';

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
            title="Edit profile"
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
            <Text style={styles.readLabel}>Role</Text>
            <Text style={styles.readValue}>{getRoleLabel(profile?.role)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account details</Text>
            <AuthTextField
              label="Full name"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
            />
            <AuthTextField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!emailLocked}
              style={emailLocked ? styles.lockedInput : undefined}
            />
            {emailLocked ? (
              <Text style={styles.fieldHint}>
                Email is managed by your Google sign-in and can't be changed here.
              </Text>
            ) : (
              <Text style={styles.fieldHint}>
                Changing your email marks it unverified again.
              </Text>
            )}
            <AuthTextField
              label="Phone (10-digit Indian mobile)"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.fieldHint}>
              Changing your phone number marks it unverified again.
            </Text>
            {showMarketIntent ? (
              <AuthTextField
                label="Market intent (optional)"
                icon="compass-outline"
                placeholder="e.g. Rent in Thane West"
                value={marketIntent}
                onChangeText={setMarketIntent}
              />
            ) : null}
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

          {isAgent ? (
            <View style={styles.card}>
              <View style={styles.agentHead}>
                <Text style={styles.cardTitle}>Agency profile</Text>
                <View
                  style={[
                    styles.statusBadge,
                    approved
                      ? styles.statusApproved
                      : rejected
                        ? styles.statusRejected
                        : styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {agentApprovalStatusLabel(agentProfile?.approvalStatus)}
                  </Text>
                </View>
              </View>

              {agentProfile?.verificationDetail ? (
                <Text style={styles.verificationDetail}>
                  {agentProfile.verificationDetail}
                </Text>
              ) : null}

              {approved ? (
                <>
                  <Text style={styles.fieldHint}>
                    Editing these details sends your profile back for admin review.
                  </Text>
                  <AuthTextField
                    label="Company / agency name"
                    icon="business-outline"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                  <AuthTextField
                    label="WhatsApp number"
                    icon="logo-whatsapp"
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                    keyboardType="phone-pad"
                  />
                  <AuthTextField
                    label="RERA number (locked)"
                    icon="ribbon-outline"
                    value={reraNumber}
                    editable={false}
                    style={styles.lockedInput}
                  />
                  <Text style={styles.fieldHint}>
                    Your MahaRERA number is locked after approval. Contact support if
                    it needs correcting.
                  </Text>
                  <AuthTextField
                    label="Operating localities (optional)"
                    icon="map-outline"
                    placeholder="Areas you cover, comma separated"
                    value={operatingLocalities}
                    onChangeText={setOperatingLocalities}
                    multiline
                    numberOfLines={3}
                  />
                  <AuthTextField
                    label="Profile photo URL (optional)"
                    icon="image-outline"
                    placeholder="https://…"
                    autoCapitalize="none"
                    value={profilePhotoUrl}
                    onChangeText={setProfilePhotoUrl}
                  />
                  <GradientButton
                    label="Save agency profile"
                    loading={savingAgent}
                    onPress={handleSaveAgent}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.fieldHint}>
                    Your profile is read-only until it's approved. Update your RERA
                    details and resubmit for review.
                  </Text>
                  <AuthTextField
                    label="Company / agency name (optional)"
                    icon="business-outline"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                  <AuthTextField
                    label="WhatsApp number (optional)"
                    icon="logo-whatsapp"
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                    keyboardType="phone-pad"
                  />
                  <AuthTextField
                    label="RERA number"
                    icon="ribbon-outline"
                    value={reraNumber}
                    onChangeText={setReraNumber}
                  />
                  <Pressable
                    style={[styles.uploadBtn, uploadingCert && styles.uploadBtnDisabled]}
                    onPress={pickCertificate}
                    disabled={uploadingCert}
                  >
                    <Ionicons
                      name={reraCertificateUrl ? 'checkmark-circle' : 'cloud-upload-outline'}
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.uploadBtnText}>
                      {uploadingCert
                        ? 'Uploading…'
                        : reraCertificateUrl
                          ? 'Certificate attached — replace'
                          : 'Upload RERA certificate (jpg/png)'}
                    </Text>
                  </Pressable>
                  <AuthTextField
                    label="…or paste a certificate link (PDF/URL)"
                    icon="document-attach-outline"
                    placeholder="https://… (document URL)"
                    autoCapitalize="none"
                    value={reraCertificateUrl}
                    onChangeText={setReraCertificateUrl}
                  />
                  <AuthTextField
                    label="Operating localities (optional)"
                    icon="map-outline"
                    placeholder="Areas you cover, comma separated"
                    value={operatingLocalities}
                    onChangeText={setOperatingLocalities}
                    multiline
                    numberOfLines={3}
                  />
                  <GradientButton
                    label="Resubmit for review"
                    loading={savingAgent}
                    disabled={uploadingCert}
                    onPress={handleResubmit}
                  />
                </>
              )}
            </View>
          ) : null}
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.md,
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
  fieldHint: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 15,
  },
  lockedInput: {
    color: colors.slateLight,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  agentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  statusRejected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
  },
  verificationDetail: {
    fontSize: 12,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
});
