import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
import { BuilderProjectsBanner } from '../components/builder/BuilderProjectsBanner';
import { BrandLoading } from '../components/ui/BrandLoading';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { scrollLinkedHostStyle } from '../components/ui/ScrollLinkedOverlay';
import { useListScrollChrome, useScrollCollapseEligibility } from '../hooks/useListScrollChrome';
import type { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../context/LocaleContext';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderProjects'>;

export default function BuilderProjectsScreen(props: Props) {
  return (
    <AuthenticatedScreenLayout
      headerDensity="compact"
      showBack
      onBack={() => props.navigation.goBack()}
    >
      <BuilderProjectsContent {...props} />
    </AuthenticatedScreenLayout>
  );
}

function BuilderProjectsContent({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const listRef = useRef<FlatListType<BuilderProjectSummary>>(null);
  const [items, setItems] = useState<BuilderProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const load = useCallback(async (query?: string) => {
    setError(null);
    try {
      const data = await builderProjectsApi.list(
        query?.trim() ? { search: query.trim() } : undefined
      );
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('builder.couldNotLoadProjects'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(searchText);
    }, [load, searchText])
  );

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const hay = [
        p.projectName,
        p.builderName,
        p.areaName,
        p.address,
        p.projectStatus,
        p.reraNumber,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchText]);

  const { canCollapse, bindScrollMetrics } = useScrollCollapseEligibility();
  const { scrollY, onScroll, scrollToTop } = useListScrollChrome({
    scrollRef: listRef,
    scrollToTopActive: filtered.length > 0,
    collapseEnabled: canCollapse && filtered.length > 0,
  });

  const searchSummary =
    searchText.trim().length > 0 ? searchText.trim() : t('builder.allProjects');

  const listHeader = (
    <View style={styles.header}>
      <BuilderProjectsBanner projectCount={filtered.length} />

      <View style={styles.searchCard}>
        <Ionicons name="search" size={20} color={colors.builder} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('builder.searchPlaceholder')}
          placeholderTextColor={colors.slateLight}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={() => {
            setLoading(true);
            load(searchText);
          }}
        />
        {searchText.length > 0 ? (
          <Pressable
            onPress={() => {
              setSearchText('');
              setLoading(true);
              load('');
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color={colors.slateLight} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.trustRow}>
        <TrustChip icon="shield-checkmark-outline" label={t('builder.reraListed')} />
        <TrustChip icon="home-outline" label={t('builder.unitInventory')} />
        <TrustChip icon="chatbubbles-outline" label={t('builder.directEnquiry')} />
      </View>
    </View>
  );

  return (
    <View style={scrollLinkedHostStyle}>
      <ScrollChromeBar scrollY={scrollY} revealAt={200} overlay>
        <DashboardCompactBar
          title={t('builder.projects')}
          subtitle={t('builder.projectsCount', { count: filtered.length, summary: searchSummary })}
          onPress={scrollToTop}
          variant="builder"
        />
      </ScrollChromeBar>

      {loading && items.length === 0 ? (
        <BrandLoading message={t('builder.loadingProjects')} />
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errIcon}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.slateLight} />
          </View>
          <Text style={styles.errTitle}>{t('builder.couldNotLoad')}</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => load(searchText)}>
            <Text style={styles.retryText}>{t('shared.tryAgain')}</Text>
          </Pressable>
        </View>
      ) : (
        <AnimatedFlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
          {...bindScrollMetrics}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={canCollapse && filtered.length > 0}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(searchText);
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="business-outline" size={44} color={colors.builder} />
              </View>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptySub}>
                Try another search or check back soon for new launches in Thane.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BuilderProjectCard
              item={item}
              onPress={() =>
                navigation.navigate('BuilderProjectDetails', {
                  projectId: item.id,
                  title: item.projectName,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.trustChip}>
      <Ionicons name={icon} size={12} color={colors.builder} />
      <Text style={styles.trustChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.builderBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
    paddingVertical: 4,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  trustChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.builderDark,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: colors.builder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.builderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  emptySub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    maxWidth: 280,
  },
});
