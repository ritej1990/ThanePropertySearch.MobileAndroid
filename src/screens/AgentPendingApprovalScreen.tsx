import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { agentProfilesApi } from '../api/singleton';
import type { AgentProfile } from '../api/agentTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentPendingApproval'>;

export default function AgentPendingApprovalScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = await agentProfilesApi.getMe();
      setProfile(p);
      if (p.approvalStatus === 'Approved') {
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

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHero
          variant="owner"
          icon="hourglass-outline"
          title="Profile under review"
          subtitle="Our team is verifying your RERA and agency details."
        />
        {loading ? (
          <BrandLoading fullScreen={false} message="Checking status…" />
        ) : (
          <View style={styles.card}>
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
            <Text style={styles.company}>{profile?.companyName ?? 'Agent profile'}</Text>
            <Text style={styles.meta}>RERA: {profile?.reraNumber ?? '—'}</Text>
            <Text style={styles.status}>Status: {profile?.approvalStatus ?? 'Pending'}</Text>
            <Text style={styles.hint}>
              You can sign in and browse listings. Posting and payments unlock after approval.
            </Text>
            <Pressable style={styles.btn} onPress={load}>
              <Text style={styles.btnText}>Refresh status</Text>
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
  status: { fontSize: 14, fontWeight: '700', color: colors.warning, marginTop: spacing.md },
  hint: {
    fontSize: 14,
    color: colors.slateMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.lg,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnText: { color: colors.heroText, fontWeight: '700' },
});
