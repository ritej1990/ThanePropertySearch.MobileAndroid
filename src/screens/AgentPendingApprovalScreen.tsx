import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { agentListingsApi, agentProfilesApi } from '../api/singleton';
import type { AgentProfile } from '../api/agentTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import {
  agentApprovalStatusLabel,
  agentProfileNeedsClarification,
  canResubmitAgentProfile,
  isAgentProfileApproved,
  isAgentProfileRejected,
} from '../utils/agentApproval';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentPendingApproval'>;

export default function AgentPendingApprovalScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [operatingLocalities, setOperatingLocalities] = useState('');
  const [reraCertificateUrl, setReraCertificateUrl] = useState('');

  const load = useCallback(async () => {
    try {
      const p = await agentProfilesApi.getMe();
      setProfile(p);
      setCompanyName(p.companyName ?? '');
      setWhatsAppNumber(p.whatsAppNumber ?? '');
      setReraNumber(p.reraNumber ?? '');
      setOperatingLocalities(p.operatingLocalities ?? '');
      setReraCertificateUrl(p.reraCertificateUrl ?? '');
      if (isAgentProfileApproved(p.approvalStatus)) {
        navigation.replace('AgentDashboard');
      }
    } catch {
      /* stay on pending */
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

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
    setUploading(true);
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
      setUploading(false);
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
    setSubmitting(true);
    try {
      const updated = await agentProfilesApi.resubmitMe({
        reraNumber: reraNumber.trim(),
        reraCertificateUrl: reraCertificateUrl.trim(),
        companyName: companyName.trim() || null,
        whatsAppNumber: whatsAppNumber.trim() || null,
        operatingLocalities: operatingLocalities.trim() || null,
      });
      setProfile(updated);
      Alert.alert(
        'Resubmitted',
        'Your agency profile was sent back for admin review.'
      );
    } catch (e) {
      Alert.alert(
        'Could not resubmit',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const status = profile?.approvalStatus;
  const rejected = isAgentProfileRejected(status);
  const needsClarification = agentProfileNeedsClarification(status);
  const canResubmit = canResubmitAgentProfile(status);

  const heroTitle = needsClarification
    ? 'Updates needed'
    : rejected
      ? 'Profile not approved'
      : 'Profile under review';
  const heroSubtitle = needsClarification
    ? 'Update the details below and resubmit so we can continue your RERA verification.'
    : rejected
      ? 'Fix the issue noted below and resubmit for another admin review.'
      : 'Our team is verifying your RERA and agency details.';

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHero
          variant="owner"
          icon={needsClarification ? 'create-outline' : 'hourglass-outline'}
          title={heroTitle}
          subtitle={heroSubtitle}
        />
        {loading ? (
          <BrandLoading fullScreen={false} message="Checking status…" />
        ) : (
          <View style={styles.card}>
            <Ionicons
              name={canResubmit ? 'create-outline' : 'shield-checkmark-outline'}
              size={40}
              color={colors.primary}
            />
            <Text style={styles.company}>
              {profile?.companyName || 'Agent profile'}
            </Text>
            <Text style={styles.meta}>RERA: {profile?.reraNumber ?? '—'}</Text>
            <View
              style={[
                styles.statusBadge,
                rejected ? styles.statusRejected : styles.statusPending,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {agentApprovalStatusLabel(status)}
              </Text>
            </View>

            {profile?.verificationDetail ? (
              <Text style={styles.verificationDetail}>
                {profile.verificationDetail}
              </Text>
            ) : null}

            {canResubmit ? (
              <View style={styles.form}>
                <Text style={styles.hint}>
                  {needsClarification
                    ? 'Address the notes above, complete any missing fields, and send your profile back for review.'
                    : 'Fix the issue noted above, re-upload your MahaRERA certificate, and send your profile back for another admin review.'}
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
                  label="Operating localities (optional)"
                  icon="map-outline"
                  placeholder="Areas you cover, comma separated"
                  value={operatingLocalities}
                  onChangeText={setOperatingLocalities}
                  multiline
                  numberOfLines={3}
                />
                <AuthTextField
                  label="MahaRERA registration number"
                  icon="ribbon-outline"
                  value={reraNumber}
                  onChangeText={setReraNumber}
                />
                <Pressable
                  style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
                  onPress={pickCertificate}
                  disabled={uploading}
                >
                  <Ionicons
                    name={reraCertificateUrl ? 'checkmark-circle' : 'cloud-upload-outline'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {uploading
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
                <GradientButton
                  label="Resubmit for approval"
                  loading={submitting}
                  disabled={uploading}
                  onPress={handleResubmit}
                />
              </View>
            ) : (
              <Text style={styles.hint}>
                You can sign in and browse listings. Posting and payments unlock
                after approval.
              </Text>
            )}

            <Pressable style={styles.refreshBtn} onPress={load}>
              <Text style={styles.refreshText}>Refresh status</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  company: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  meta: { fontSize: 13, color: colors.slateLight, marginTop: spacing.sm },
  statusBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusPending: { backgroundColor: colors.warningSoft },
  statusRejected: { backgroundColor: colors.errorSoft },
  statusBadgeText: { fontSize: 13, fontWeight: '700', color: colors.navy },
  verificationDetail: {
    fontSize: 13,
    color: colors.slateMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.md,
  },
  form: { alignSelf: 'stretch', marginTop: spacing.lg, gap: spacing.sm },
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
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  hint: {
    fontSize: 14,
    color: colors.slateMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.lg,
  },
  refreshBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  refreshText: { color: colors.heroText, fontWeight: '700' },
});
