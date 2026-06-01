import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type FlatList as FlatListType,
} from 'react-native';
import { AnimatedFlatList } from '../components/ui/AnimatedFlatList';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  agentListingsApi,
  agentProfilesApi,
  paymentsApi,
} from '../api/singleton';
import type { AgentListingSummary, AgentProfile } from '../api/agentTypes';
import { ApiError } from '../api/client';
import { AgentDashboardHeader } from '../components/agent/AgentDashboardHeader';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { DashboardCompactBar } from '../components/layout/DashboardCompactBar';
import { useListScrollChrome, useScrollCollapseEligibility } from '../hooks/useListScrollChrome';
import { BrandLoading } from '../components/ui/BrandLoading';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { scrollLinkedHostStyle } from '../components/ui/ScrollLinkedOverlay';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentDashboard'>;

function reviewStatusStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes('approve')) {
    return { bg: colors.successSoft, text: colors.success };
  }
  if (s.includes('reject')) {
    return { bg: colors.errorSoft, text: colors.error };
  }
  if (s.includes('pending')) {
    return { bg: colors.warningSoft, text: colors.warning };
  }
  return { bg: colors.surfaceMuted, text: colors.slateMuted };
}

export default function AgentDashboardScreen(props: Props) {
  return (
    <AuthenticatedScreenLayout headerDensity="compact">
      <AgentDashboardContent {...props} />
    </AuthenticatedScreenLayout>
  );
}

function AgentDashboardContent({ navigation }: Props) {
  const listRef = useRef<FlatListType<AgentListingSummary>>(null);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [listings, setListings] = useState<AgentListingSummary[]>([]);
  const [publishCredits, setPublishCredits] = useState(0);
  const [leadCredits, setLeadCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canCollapse, bindScrollMetrics } = useScrollCollapseEligibility();
  const { scrollY, onScroll, scrollToTop } = useListScrollChrome({
    scrollRef: listRef,
    scrollToTopActive: listings.length > 0,
    collapseEnabled: canCollapse && listings.length > 0,
  });

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, l, pay] = await Promise.all([
        agentProfilesApi.getMe(),
        agentListingsApi.listMine(),
        paymentsApi.getAgentSummary().catch(() => null),
      ]);
      setProfile(p);
      setListings(l);
      if (pay) {
        setPublishCredits(pay.publishCredits);
        setLeadCredits(pay.leadCredits);
      }
      if (p.approvalStatus !== 'Approved') {
        navigation.replace('AgentPendingApproval');
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        navigation.replace('AgentPendingApproval');
        return;
      }
      setError(e instanceof ApiError ? e.message : 'Could not load dashboard');
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

  const approved = profile?.approvalStatus === 'Approved';

  return (
    <View style={[styles.wrap, scrollLinkedHostStyle]}>
      <ScrollChromeBar scrollY={scrollY} revealAt={280} overlay>
        <DashboardCompactBar
          title="Agent dashboard"
          subtitle={`${listings.length} listings · ${publishCredits} publish credits`}
          onPress={scrollToTop}
        />
      </ScrollChromeBar>

      <AnimatedFlatList
          ref={listRef}
          data={loading ? [] : listings}
          keyExtractor={(item) => String(item.id)}
          {...bindScrollMetrics}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={canCollapse && listings.length > 0}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <AgentDashboardHeader
                profile={profile}
                listingCount={listings.length}
                publishCredits={publishCredits}
                leadCredits={leadCredits}
                canPost={approved && publishCredits > 0}
                onPayments={() => navigation.navigate('AgentPayments')}
                onPost={() => {
                  if (publishCredits <= 0) {
                    navigation.navigate('AgentPayments');
                    return;
                  }
                  navigation.navigate('PostProperty');
                }}
                onBrowse={() => navigation.navigate('Home')}
              />
              {!loading && !error ? (
                <Text style={styles.listTitle}>Your listings</Text>
              ) : null}
            </>
          }
          ListEmptyComponent={
            loading ? (
              <BrandLoading fullScreen={false} message="Loading dashboard…" />
            ) : error ? (
              <View style={styles.centered}>
                <Text style={styles.err}>{error}</Text>
                <Pressable style={styles.retry} onPress={load}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="home-outline" size={40} color={colors.slateLight} />
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptySub}>
                  Purchase a publish plan, then post your first agent listing — same flow
                  as the web dashboard.
                </Text>
                {approved ? (
                  <Pressable
                    style={styles.cta}
                    onPress={() =>
                      publishCredits > 0
                        ? navigation.navigate('PostProperty')
                        : navigation.navigate('AgentPayments')
                    }
                  >
                    <Ionicons
                      name={publishCredits > 0 ? 'add-circle-outline' : 'card-outline'}
                      size={16}
                      color={colors.heroText}
                    />
                    <Text style={styles.ctaText}>
                      {publishCredits > 0 ? 'Post your first listing' : 'Get publish plan'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )
          }
          renderItem={({ item }) => {
            const statusStyle = reviewStatusStyle(item.reviewStatus);
            return (
              <View style={styles.row}>
                <Pressable
                  style={styles.rowMain}
                  onPress={() =>
                    navigation.navigate('PropertyDetails', {
                      propertyId: item.id,
                      title: item.title,
                      listingSource: 'agent',
                    })
                  }
                >
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.rowMeta}>{item.areaName}</Text>
                    <View
                      style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
                    >
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {item.reviewStatus}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.slateLight} />
                </Pressable>
                <Pressable
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate('PostProperty', { listingId: item.id })
                  }
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: { flex: 1, minWidth: 0 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  rowTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  rowMeta: { fontSize: 12, color: colors.slateLight, marginTop: 4 },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  empty: { alignItems: 'center', padding: spacing.xxxl },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  ctaText: { color: colors.heroText, fontWeight: '700' },
  centered: { padding: spacing.xxl, alignItems: 'center' },
  err: { color: colors.error, textAlign: 'center', marginBottom: spacing.lg },
  retry: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: { color: colors.heroText, fontWeight: '700' },
});
