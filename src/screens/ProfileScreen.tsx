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
import { useTranslation } from '../context/LocaleContext';
import { useResendEmailVerification } from '../hooks/useResendEmailVerification';
import type { RootStackParamList } from '../navigation/types';
import { getRoleLabel } from '../utils/profileDisplay';
import { isAgentRole, isOwnerRole } from '../utils/roles';
import { isValidOptionalGst, normalizeGst } from '../utils/gstNumber';
import {
  isAgentProfileApproved,
  isAgentProfileRejected,
} from '../utils/agentApproval';
import type { TranslateFn } from '../i18n';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function agentApprovalStatusT(status: string | null | undefined, t: TranslateFn): string {
  switch (status) {
    case 'InProgress':
      return t('agent.approvalInProgress');
    case 'AwaitingRequester':
      return t('agent.approvalPendingWithYou');
    case 'SystemApproved':
      return t('agent.approvalUnderAdminReview');
    case 'Approved':
      return t('agent.approvalApproved');
    case 'AutoApproved':
      return t('agent.approvalAutoApproved');
    case 'Rejected':
      return t('agent.approvalRejected');
    case 'Expired':
      return t('agent.approvalExpired');
    default:
      return t('agent.approvalPendingReview');
  }
}

export default function ProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
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
        t('profile.couldNotLoad'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
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
      Alert.alert(t('shared.missingDetails'), t('profile.missingRequired'));
      return;
    }
    if (showGst && gstNumber.trim() && !isValidOptionalGst(gstNumber)) {
      Alert.alert(t('profile.invalidGstTitle'), t('profile.invalidGstBody'));
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
      Alert.alert(t('shared.saved'), t('profile.saved'));
    } catch (e) {
      Alert.alert(
        t('profile.couldNotSave'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAgent() {
    if (!companyName.trim() || !whatsAppNumber.trim() || !reraNumber.trim()) {
      Alert.alert(t('shared.missingDetails'), t('agent.missingAgencyDetails'));
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
        isAgentProfileApproved(updated.approvalStatus)
          ? t('shared.saved')
          : t('agent.sentForReview'),
        isAgentProfileApproved(updated.approvalStatus)
          ? t('agent.profileUpdated')
          : t('agent.profileUpdatedSentForReview')
      );
    } catch (e) {
      Alert.alert(
        t('profile.couldNotSave'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setSavingAgent(false);
    }
  }

  async function pickCertificate() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('postProperty.photosAccessTitle'), t('agent.photosAccessRera'));
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
      Alert.alert(t('agent.certificateUploaded'), t('agent.certificateUploadedBody'));
    } catch (e) {
      Alert.alert(
        t('agent.uploadFailed'),
        e instanceof ApiError ? e.message : t('agent.uploadFailedBody')
      );
    } finally {
      setUploadingCert(false);
    }
  }

  async function handleResubmit() {
    if (!reraNumber.trim() || !reraCertificateUrl.trim()) {
      Alert.alert(t('shared.missingDetails'), t('agent.missingRera'));
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
      Alert.alert(t('agent.resubmitted'), t('agent.resubmittedBody'));
    } catch (e) {
      Alert.alert(
        t('agent.couldNotResubmit'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setSavingAgent(false);
    }
  }

  const emailLocked = authProvider.toLowerCase() === 'google';

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      {loading ? (
        <BrandLoading message={t('profile.loading')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <PageHero
            variant="user"
            icon="person-circle-outline"
            title={t('profile.editTitle')}
            subtitle={t('profile.editSub')}
          />

          {!emailConfirmed ? (
            <View style={styles.verifyBanner}>
              <Text style={styles.verifyTitle}>{t('profile.emailNotVerified')}</Text>
              <Text style={styles.verifySub}>{t('profile.verifyToUnlock')}</Text>
              <GradientButton
                label={sending ? t('profile.sending') : t('profile.resendVerification')}
                loading={sending}
                onPress={resend}
                style={styles.verifyBtn}
              />
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.readLabel}>{t('profile.username')}</Text>
            <Text style={styles.readValue}>{profile?.username ?? '—'}</Text>
            <Text style={styles.readLabel}>{t('profile.role')}</Text>
            <Text style={styles.readValue}>{getRoleLabel(profile?.role, t)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('profile.accountDetails')}</Text>
            <AuthTextField
              label={t('profile.fullName')}
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
            />
            <AuthTextField
              label={t('shared.email')}
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!emailLocked}
              style={emailLocked ? styles.lockedInput : undefined}
            />
            {emailLocked ? (
              <Text style={styles.fieldHint}>{t('profile.emailGoogleLocked')}</Text>
            ) : (
              <Text style={styles.fieldHint}>{t('profile.emailChangeUnverified')}</Text>
            )}
            <AuthTextField
              label={t('profile.phone')}
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.fieldHint}>{t('profile.phoneChangeUnverified')}</Text>
            {showMarketIntent ? (
              <AuthTextField
                label={t('profile.marketIntentOptional')}
                icon="compass-outline"
                placeholder={t('profile.marketIntentPlaceholder')}
                value={marketIntent}
                onChangeText={setMarketIntent}
              />
            ) : null}
            {showGst ? (
              <AuthTextField
                label={t('profile.gstOptional')}
                icon="receipt-outline"
                placeholder={t('profile.gstPlaceholder')}
                autoCapitalize="characters"
                value={gstNumber}
                onChangeText={setGstNumber}
              />
            ) : null}
            <GradientButton
              label={t('profile.saveChanges')}
              loading={saving}
              onPress={handleSave}
            />
          </View>

          {isAgent ? (
            <View style={styles.card}>
              <View style={styles.agentHead}>
                <Text style={styles.cardTitle}>{t('agent.agentProfile')}</Text>
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
                    {agentApprovalStatusT(agentProfile?.approvalStatus, t)}
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
                  <Text style={styles.fieldHint}>{t('agent.editSendsForReview')}</Text>
                  <AuthTextField
                    label={t('agent.companyNameRequired')}
                    icon="business-outline"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                  <AuthTextField
                    label={t('agent.whatsappRequired')}
                    icon="logo-whatsapp"
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                    keyboardType="phone-pad"
                  />
                  <AuthTextField
                    label={t('agent.reraLocked')}
                    icon="ribbon-outline"
                    value={reraNumber}
                    editable={false}
                    style={styles.lockedInput}
                  />
                  <Text style={styles.fieldHint}>{t('agent.reraLockedHint')}</Text>
                  <AuthTextField
                    label={t('agent.localities')}
                    icon="map-outline"
                    placeholder={t('agent.localitiesPlaceholder')}
                    value={operatingLocalities}
                    onChangeText={setOperatingLocalities}
                    multiline
                    numberOfLines={3}
                  />
                  <AuthTextField
                    label={t('agent.profilePhotoOptional')}
                    icon="image-outline"
                    placeholder={t('builder.urlPlaceholder')}
                    autoCapitalize="none"
                    value={profilePhotoUrl}
                    onChangeText={setProfilePhotoUrl}
                  />
                  <GradientButton
                    label={t('agent.saveAgencyProfile')}
                    loading={savingAgent}
                    onPress={handleSaveAgent}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.fieldHint}>{t('agent.readOnlyResubmit')}</Text>
                  <AuthTextField
                    label={t('agent.companyName')}
                    icon="business-outline"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                  <AuthTextField
                    label={t('agent.whatsapp')}
                    icon="logo-whatsapp"
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                    keyboardType="phone-pad"
                  />
                  <AuthTextField
                    label={t('agent.reraNumber')}
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
                        ? t('agent.uploading')
                        : reraCertificateUrl
                          ? t('agent.certificateAttached')
                          : t('agent.uploadRera')}
                    </Text>
                  </Pressable>
                  <AuthTextField
                    label={t('agent.certificateLinkLabel')}
                    icon="document-attach-outline"
                    placeholder={t('agent.certificateLinkPlaceholder')}
                    autoCapitalize="none"
                    value={reraCertificateUrl}
                    onChangeText={setReraCertificateUrl}
                  />
                  <AuthTextField
                    label={t('agent.localities')}
                    icon="map-outline"
                    placeholder={t('agent.localitiesPlaceholder')}
                    value={operatingLocalities}
                    onChangeText={setOperatingLocalities}
                    multiline
                    numberOfLines={3}
                  />
                  <GradientButton
                    label={t('agent.resubmitApproval')}
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
