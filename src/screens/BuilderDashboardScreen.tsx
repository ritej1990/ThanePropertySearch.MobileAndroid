import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type FlatList as FlatListType,
} from 'react-native';
import { AnimatedFlatList } from '../components/ui/AnimatedFlatList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { BuilderProjectSummary } from '../api/builderTypes';
import { builderProjectsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { DashboardCompactBar } from '../components/layout/DashboardCompactBar';
import { BuilderProjectCard } from '../components/builder/BuilderProjectCard';
import { BrandLoading } from '../components/ui/BrandLoading';
import { PageHero } from '../components/ui/PageHero';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { scrollLinkedHostStyle } from '../components/ui/ScrollLinkedOverlay';
import { useListScrollChrome, useScrollCollapseEligibility } from '../hooks/useListScrollChrome';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { isBuilderRole } from '../utils/roles';
import { formatBuilderPrice } from '../utils/builderFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderDashboard'>;

export default function BuilderDashboardScreen(props: Props) {
  return (
    <AuthenticatedScreenLayout headerDensity="compact">
      <BuilderDashboardContent {...props} />
    </AuthenticatedScreenLayout>
  );
}

function BuilderDashboardContent({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<BuilderProjectSummary>>(null);
  const { profile, ready } = useAuth();
  const isBuilder = isBuilderRole(profile?.role);

  useEffect(() => {
    if (!ready) return;
    if (!isBuilder) {
      navigation.replace('BuilderProjects');
    }
  }, [isBuilder, navigation, ready]);
  const [rows, setRows] = useState<BuilderProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await builderProjectsApi.listMine();
      setRows(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError('Builder access only. Sign in with a builder account.');
      } else {
        setError(e instanceof ApiError ? e.message : 'Could not load your projects');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!ready || !isBuilder) return;
      setLoading(true);
      load();
    }, [load, isBuilder, ready])
  );

  const stats = useMemo(() => {
    const totalLeads = rows.reduce((sum, r) => sum + (r.leadCount ?? 0), 0);
    const totalAvailable = rows.reduce((sum, r) => sum + (r.availableUnits ?? 0), 0);
    const published = rows.filter((r) => r.isPublished).length;
    return { totalLeads, totalAvailable, published, count: rows.length };
  }, [rows]);

  const { canCollapse, bindScrollMetrics } = useScrollCollapseEligibility();
  const { scrollY, onScroll, scrollToTop } = useListScrollChrome({
    scrollRef: listRef,
    scrollToTopActive: rows.length > 0,
    collapseEnabled: canCollapse && rows.length > 0,
  });

  const listHeader = (
    <View style={styles.header}>
      <PageHero
        variant="builder"
        icon="construct-outline"
        title="Builder dashboard"
        subtitle="Manage projects, track leads, and respond to enquiries."
      />

      <View style={styles.statsRow}>
        <StatCard label="Projects" value={String(stats.count)} icon="business" />
        <StatCard label="Leads" value={String(stats.totalLeads)} icon="people" />
        <StatCard label="Available units" value={String(stats.totalAvailable)} icon="home" />
        <StatCard label="Published" value={String(stats.published)} icon="checkmark-circle" />
      </View>

      <Pressable
        style={styles.browseBtn}
        onPress={() => navigation.navigate('BuilderProjects')}
      >
        <Text style={styles.browseBtnText}>Browse all builder projects</Text>
      </Pressable>

      <Pressable
        style={styles.paymentsBtn}
        onPress={() => navigation.navigate('BuilderPayments')}
      >
        <Ionicons name="card-outline" size={18} color={colors.builder} />
        <Text style={styles.paymentsBtnText}>Plans & upload credits</Text>
      </Pressable>

      <Pressable
        style={styles.postProjectBtn}
        onPress={() => navigation.navigate('BuilderProjectForm')}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.heroText} />
        <Text style={styles.postProjectBtnText}>Post new project</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Your projects</Text>
    </View>
  );

  return (
    <View style={[styles.wrap, scrollLinkedHostStyle]}>
      <ScrollChromeBar scrollY={scrollY} revealAt={260} overlay>
        <DashboardCompactBar
          title="Builder dashboard"
          subtitle={`${stats.count} projects · ${stats.totalLeads} leads`}
          onPress={scrollToTop}
          variant="builder"
        />
      </ScrollChromeBar>

      {!ready || (loading && rows.length === 0) ? (
        <BrandLoading message="Loading builder dashboard…" />
      ) : !isBuilder ? (
        <BrandLoading message="Redirecting…" />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errTitle}>Dashboard unavailable</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <AnimatedFlatList
          ref={listRef}
          data={rows}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
          {...bindScrollMetrics}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={canCollapse && rows.length > 0}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="construct-outline" size={48} color={colors.slateLight} />
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptySub}>
                Post your first builder project — same fields as the web dashboard.
              </Text>
              <Pressable
                style={styles.emptyCta}
                onPress={() => navigation.navigate('BuilderProjectForm')}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.heroText} />
                <Text style={styles.emptyCtaText}>Post your first project</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View>
              <BuilderProjectCard
                item={item}
                onPress={() =>
                  navigation.navigate('BuilderProjectDetails', {
                    projectId: item.id,
                    title: item.projectName,
                    manage: true,
                  })
                }
              />
              <View style={styles.rowActions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate('BuilderProjectForm', { projectId: item.id })
                  }
                >
                  <Ionicons name="pencil-outline" size={14} color={colors.builder} />
                  <Text style={styles.editBtnText}>Edit project</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.leadStrip}
                onPress={() =>
                  navigation.navigate('BuilderLeads', {
                    projectId: item.id,
                    projectName: item.projectName,
                  })
                }
              >
                <Ionicons name="mail-unread-outline" size={14} color={colors.builder} />
                <Text style={styles.leadStripText}>
                  {item.leadCount} {item.leadCount === 1 ? 'lead' : 'leads'} · tap to view
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.slateLight} />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={16} color="#0d9488" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    fontSize: 14,
    color: colors.slateMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
  },
  browseBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },
  paymentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  paymentsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.builder,
  },
  postProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.builder,
  },
  postProjectBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.heroText,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  rowActions: {
    flexDirection: 'row',
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.builder,
  },
  leadStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    marginLeft: spacing.sm,
  },
  leadStripText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  err: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
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
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    backgroundColor: colors.builder,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyCtaText: {
    color: colors.heroText,
    fontWeight: '700',
  },
});
