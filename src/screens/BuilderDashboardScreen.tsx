import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { BuilderProjectSummary } from '../api/builderTypes';
import { builderProjectsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BuilderProjectCard } from '../components/builder/BuilderProjectCard';
import { BrandLoading } from '../components/ui/BrandLoading';
import { WEB_BUILDER_DASHBOARD, webHostLabel } from '../config/webLinks';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { isBuilderRole } from '../utils/roles';
import { formatBuilderPrice } from '../utils/builderFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderDashboard'>;

export default function BuilderDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isBuilder = isBuilderRole(profile?.role);

  useEffect(() => {
    if (!isBuilder) {
      navigation.replace('BuilderProjects');
    }
  }, [isBuilder, navigation]);
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
      if (!isBuilder) return;
      setLoading(true);
      load();
    }, [load, isBuilder])
  );

  const stats = useMemo(() => {
    const totalLeads = rows.reduce((sum, r) => sum + (r.leadCount ?? 0), 0);
    const totalAvailable = rows.reduce((sum, r) => sum + (r.availableUnits ?? 0), 0);
    const published = rows.filter((r) => r.isPublished).length;
    return { totalLeads, totalAvailable, published, count: rows.length };
  }, [rows]);

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Builder dashboard</Text>
      <Text style={styles.sub}>
        Manage projects, leads, and promotions — synced with {webHostLabel()}
      </Text>

      <View style={styles.statsRow}>
        <StatCard label="Projects" value={String(stats.count)} icon="business" />
        <StatCard label="Leads" value={String(stats.totalLeads)} icon="people" />
        <StatCard label="Available units" value={String(stats.totalAvailable)} icon="home" />
        <StatCard label="Published" value={String(stats.published)} icon="checkmark-circle" />
      </View>

      <Pressable
        style={styles.webBtn}
        onPress={() => Linking.openURL(WEB_BUILDER_DASHBOARD)}
      >
        <Ionicons name="globe-outline" size={18} color={colors.primary} />
        <Text style={styles.webBtnText}>Full dashboard on {webHostLabel()}</Text>
        <Ionicons name="open-outline" size={16} color={colors.slateMuted} />
      </Pressable>

      <Pressable
        style={styles.browseBtn}
        onPress={() => navigation.navigate('BuilderProjects')}
      >
        <Text style={styles.browseBtnText}>Browse all builder projects</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Your projects</Text>
    </View>
  );

  return (
    <AuthenticatedScreenLayout>
      {loading && rows.length === 0 ? (
        <BrandLoading message="Loading builder dashboard…" />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errTitle}>Dashboard unavailable</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
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
                Upload and manage projects on the website builder dashboard.
              </Text>
              <Pressable
                style={styles.emptyCta}
                onPress={() => Linking.openURL(WEB_BUILDER_DASHBOARD)}
              >
                <Text style={styles.emptyCtaText}>Open builder dashboard</Text>
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
                  })
                }
              />
              <View style={styles.leadStrip}>
                <Ionicons name="mail-unread-outline" size={14} color="#0f766e" />
                <Text style={styles.leadStripText}>
                  {item.leadCount} {item.leadCount === 1 ? 'lead' : 'leads'} · from{' '}
                  {formatBuilderPrice(item.startingPrice)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </AuthenticatedScreenLayout>
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
  webBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#eff6ff',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: spacing.sm,
  },
  webBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
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
    marginTop: spacing.lg,
    backgroundColor: '#0d9488',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyCtaText: {
    color: colors.heroText,
    fontWeight: '700',
  },
});
