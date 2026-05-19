import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { propertiesApi } from '../api/singleton';
import type { MyChatThread } from '../api/inquiryTypes';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyChats'>;

type RoleFilter = 'all' | 'buyer' | 'owner';

export default function MyChatsScreen({ navigation }: Props) {
  const [threads, setThreads] = useState<MyChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await propertiesApi.getMyThreads();
      setThreads(data);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    let list = threads;
    if (roleFilter === 'buyer') list = list.filter((t) => !t.isOwner);
    if (roleFilter === 'owner') list = list.filter((t) => t.isOwner);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => t.propertyTitle.toLowerCase().includes(q));
    }
    return list;
  }, [threads, roleFilter, query]);

  function openThread(item: MyChatThread) {
    navigation.navigate('PropertyChat', {
      inquiryId: item.id,
      propertyId: item.propertyId,
      title: item.propertyTitle,
    });
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={['#4c1d95', '#312e81', '#1e1b4b']}
              style={styles.hero}
            >
              <Ionicons name="chatbubbles" size={28} color="#c4b5fd" />
              <Text style={styles.heroTitle}>My conversations</Text>
              <Text style={styles.heroSub}>
                Continue threads about listings you own or are interested in.
              </Text>
            </LinearGradient>

            <View style={styles.toolbar}>
              <Text style={styles.count}>
                {threads.length} conversation{threads.length === 1 ? '' : 's'}
              </Text>
              <Pressable
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.heroText} />
                <Text style={styles.browseBtnText}>Browse</Text>
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={colors.slateLight} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Filter by title…"
                placeholderTextColor={colors.slateLight}
              />
            </View>

            <View style={styles.filters}>
              {(['all', 'buyer', 'owner'] as RoleFilter[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setRoleFilter(key)}
                  style={[styles.filterChip, roleFilter === key && styles.filterChipOn]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      roleFilter === key && styles.filterTextOn,
                    ]}
                  >
                    {key === 'all' ? 'All' : key === 'buyer' ? 'Buyer' : 'Owner'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <BrandLoading fullScreen={false} message="Loading chats…" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color={colors.slateLight} />
              <Text style={styles.emptyTitle}>No chat threads yet</Text>
              <Text style={styles.emptySub}>
                Open a property and send a request to start messaging the owner.
              </Text>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.emptyBtnText}>Browse properties</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openThread(item)}>
            <View style={styles.cardIcon}>
              <Ionicons name="home-outline" size={20} color="#0d9488" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.propertyTitle}
              </Text>
              <Text style={styles.cardMeta}>
                {item.isOwner ? 'You are the owner' : 'Buyer thread'} ·{' '}
                {new Date(item.createdAtUtc).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.slateLight} />
          </Pressable>
        )}
      />
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    marginTop: spacing.sm,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(248,250,252,0.88)',
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  count: { fontSize: 13, fontWeight: '700', color: colors.navy },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0d9488',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  browseBtnText: { color: colors.heroText, fontWeight: '700', fontSize: 12 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  filterChipOn: {
    backgroundColor: colors.navyMid,
    borderColor: colors.navyMid,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.slateMuted },
  filterTextOn: { color: colors.heroText },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  cardMeta: { fontSize: 12, color: colors.slateLight, marginTop: 4 },
  empty: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.navy },
  emptySub: {
    fontSize: 13,
    color: colors.slateMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: spacing.md,
    backgroundColor: '#2563eb',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: colors.heroText, fontWeight: '700' },
});
