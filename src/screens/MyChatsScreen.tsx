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
import { dedupeChatThreads } from '../utils/dedupeChatThreads';
import { formatRelativeActivity, threadActivityIso } from '../utils/chatFormat';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { getFloatingRailHeight } from '../components/layout/FloatingSupportChat';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useTranslation } from '../context/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MyChats'>;

type RoleFilter = 'all' | 'buyer' | 'owner';

export default function MyChatsScreen({ navigation }: Props) {
  const { t, locale } = useTranslation();
  const { markInboxSeen } = useUnreadMessages();
  const [threads, setThreads] = useState<MyChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await propertiesApi.getMyThreads();
      setThreads(dedupeChatThreads(data));
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      markInboxSeen();
      load();
    }, [load, markInboxSeen])
  );

  const filtered = useMemo(() => {
    let list = threads;
    if (roleFilter === 'buyer') list = list.filter((th) => !th.isOwner);
    if (roleFilter === 'owner') list = list.filter((th) => th.isOwner);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((th) => th.propertyTitle.toLowerCase().includes(q));
    }
    return list;
  }, [threads, roleFilter, query]);

  const unreadTotal = useMemo(
    () => threads.reduce((sum, th) => sum + (th.unreadCount ?? 0), 0),
    [threads]
  );

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
        contentContainerStyle={[
          styles.list,
          { paddingBottom: spacing.xxxl + getFloatingRailHeight(false) },
        ]}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={['#4c1d95', '#312e81', '#1e1b4b']}
              style={styles.hero}
            >
              <View style={styles.heroTop}>
                <Ionicons name="chatbubbles" size={28} color="#c4b5fd" />
                {unreadTotal > 0 ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>
                      {unreadTotal > 99 ? '99+' : unreadTotal}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.heroTitle}>{t('chats.title')}</Text>
              <Text style={styles.heroSub}>{t('chats.subtitle')}</Text>
            </LinearGradient>

            <View style={styles.toolbar}>
              <Text style={styles.count}>
                {threads.length === 1
                  ? t('shared.conversations', { count: threads.length })
                  : t('shared.conversations_plural', { count: threads.length })}
              </Text>
              <Pressable
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.heroText} />
                <Text style={styles.browseBtnText}>{t('shared.browse')}</Text>
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={colors.slateLight} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={t('shared.filterByTitle')}
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
                    {key === 'all'
                      ? t('shared.all')
                      : key === 'buyer'
                        ? t('shared.buyer')
                        : t('shared.ownerRole')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <BrandLoading fullScreen={false} message={t('chats.loading')} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color={colors.slateLight} />
              <Text style={styles.emptyTitle}>{t('chats.emptyTitle')}</Text>
              <Text style={styles.emptySub}>{t('chats.emptySub')}</Text>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.emptyBtnText}>{t('shared.browseProperties')}</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ChatThreadCard item={item} locale={locale} t={t} onPress={() => openThread(item)} />
        )}
      />
    </AuthenticatedScreenLayout>
  );
}

function ChatThreadCard({
  item,
  locale,
  t,
  onPress,
}: {
  item: MyChatThread;
  locale: Parameters<typeof formatRelativeActivity>[1];
  t: Parameters<typeof formatRelativeActivity>[2];
  onPress: () => void;
}) {
  const unread = item.unreadCount ?? 0;
  const activity = formatRelativeActivity(threadActivityIso(item), locale, t);

  return (
    <Pressable
      style={[styles.card, unread > 0 && styles.cardUnread]}
      onPress={onPress}
    >
      <View style={[styles.cardIcon, item.isOwner ? styles.cardIconOwner : styles.cardIconBuyer]}>
        <Ionicons
          name={item.isOwner ? 'business-outline' : 'home-outline'}
          size={20}
          color={item.isOwner ? '#6d28d9' : '#0d9488'}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, unread > 0 && styles.cardTitleUnread]} numberOfLines={2}>
            {item.propertyTitle}
          </Text>
          <Text style={[styles.cardTime, unread > 0 && styles.cardTimeUnread]}>{activity}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <View style={[styles.rolePill, item.isOwner ? styles.rolePillOwner : styles.rolePillBuyer]}>
            <Text style={[styles.rolePillText, item.isOwner ? styles.roleTextOwner : styles.roleTextBuyer]}>
              {item.isOwner ? t('shared.ownerRole') : t('shared.buyer')}
            </Text>
          </View>
          {unread > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.slateLight} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
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
  cardUnread: {
    borderColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBuyer: {
    backgroundColor: '#ecfdf5',
  },
  cardIconOwner: {
    backgroundColor: '#f5f3ff',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 20,
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    marginTop: 2,
  },
  cardTimeUnread: {
    color: '#6d28d9',
    fontWeight: '800',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rolePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  rolePillBuyer: {
    backgroundColor: '#ecfdf5',
  },
  rolePillOwner: {
    backgroundColor: '#ede9fe',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  roleTextBuyer: {
    color: '#0f766e',
  },
  roleTextOwner: {
    color: '#6d28d9',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
  },
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
