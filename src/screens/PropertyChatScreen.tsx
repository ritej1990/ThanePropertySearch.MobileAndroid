import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import { paymentsApi } from '../api/singleton';
import type { InquiryMessage } from '../api/inquiryTypes';
import type { EssentialStatus } from '../api/paymentTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatThreadHeader } from '../components/chat/ChatThreadHeader';
import {
  ChatDaySeparator,
  PropertyChatBubble,
} from '../components/chat/PropertyChatBubble';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import {
  alertPlanRequired,
  handlePlanUsageError,
  hasActivePlanCredits,
  isEssentialPlanExpired,
  normalizeEssentialUsage,
} from '../utils/planUsage';
import { formatChatDayLabel, sameChatDay } from '../utils/chatFormat';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyChat'>;

type ListItem =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'message'; id: string; message: InquiryMessage };

function buildListItems(
  messages: InquiryMessage[],
  locale: Parameters<typeof formatChatDayLabel>[1],
  t: Parameters<typeof formatChatDayLabel>[2]
): ListItem[] {
  const items: ListItem[] = [];
  messages.forEach((message, index) => {
    const prev = messages[index - 1];
    if (!prev || !sameChatDay(prev.sentAtUtc, message.sentAtUtc)) {
      items.push({
        kind: 'day',
        id: `day-${message.sentAtUtc}`,
        label: formatChatDayLabel(message.sentAtUtc, locale, t),
      });
    }
    items.push({ kind: 'message', id: String(message.id), message });
  });
  return items;
}

export default function PropertyChatScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { inquiryId, propertyId, title } = route.params;
  const { profile } = useAuth();
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [essential, setEssential] = useState<EssentialStatus | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const { t, locale } = useTranslation();
  const { setActiveInquiryId, refreshUnread } = useUnreadMessages();
  const listRef = useRef<FlatList<ListItem>>(null);

  const myName = profile?.fullName?.trim().toLowerCase() ?? '';

  const loadMessages = useCallback(async () => {
    try {
      const data = await propertiesApi.getInquiryMessages(inquiryId);
      setMessages(data);
      void refreshUnread();
    } catch (e) {
      setMessages([]);
      if (handlePlanUsageError(e, navigation, propertyId)) return;
    }
  }, [inquiryId, navigation, propertyId, refreshUnread]);

  const loadCredits = useCallback(async () => {
    try {
      const e = await paymentsApi.getEssentialStatus();
      setEssential(e);
    } catch {
      setEssential(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadMessages(), loadCredits()]);
    setLoading(false);
    setRefreshing(false);
  }, [loadCredits, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      setActiveInquiryId(inquiryId);
      setLoading(true);
      refresh();
      return () => setActiveInquiryId(null);
    }, [inquiryId, refresh, setActiveInquiryId])
  );

  const listItems = useMemo(
    () => buildListItems(messages, locale, t),
    [messages, locale, t]
  );

  const creditsLabel =
    essential != null
      ? isEssentialPlanExpired(essential)
        ? t('plan.planExpiredChat')
        : (() => {
            const { usageLeft, usageMax } = normalizeEssentialUsage(essential);
            return t('plan.creditsLeftChat', { left: usageLeft, max: usageMax });
          })()
      : null;

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!hasActivePlanCredits(essential)) {
      alertPlanRequired(navigation, propertyId, isEssentialPlanExpired(essential), t);
      return;
    }
    setSending(true);
    try {
      await propertiesApi.sendInquiryMessage(inquiryId, trimmed);
      setText('');
      await refresh();
      scrollToEnd();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          t('propertyChat.sendFailed'),
          e instanceof ApiError ? e.message : t('shared.tryAgain')
        );
      }
    } finally {
      setSending(false);
    }
  }

  function isMineMessage(message: InquiryMessage): boolean {
    const sender = message.sender?.trim().toLowerCase() ?? '';
    if (myName && sender === myName) return true;
    if (profile?.username && sender === profile.username.toLowerCase()) return true;
    return false;
  }

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
      showFloatingActions={false}
      showLegalFooter={false}
      headerDensity="compact"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ChatThreadHeader
          title={title ?? t('propertyChat.chatWithOwner')}
          subtitle={t('propertyChat.chatWithOwner')}
          viewPropertyLabel={t('propertyChat.viewProperty')}
          onViewProperty={() =>
            navigation.navigate('PropertyDetails', {
              propertyId,
              title,
            })
          }
        />

        {creditsLabel ? (
          <View style={styles.creditsBar}>
            <Ionicons name="wallet-outline" size={16} color="#6d28d9" />
            <View style={styles.creditsTextCol}>
              <Text style={styles.creditsText}>{creditsLabel}</Text>
              <Text style={styles.creditsSub}>{t('propertyChat.creditPerMessage')}</Text>
            </View>
          </View>
        ) : null}

        {loading ? (
          <BrandLoading fullScreen={false} message={t('propertyChat.loading')} />
        ) : (
          <FlatList
            ref={listRef}
            data={listItems}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              listItems.length === 0 && styles.listEmpty,
            ]}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void refresh();
                }}
                tintColor="#6d28d9"
              />
            }
            renderItem={({ item }) =>
              item.kind === 'day' ? (
                <ChatDaySeparator label={item.label} />
              ) : (
                <PropertyChatBubble
                  message={item.message}
                  isMine={isMineMessage(item.message)}
                  locale={locale}
                  t={t}
                />
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#7c3aed" />
                </View>
                <Text style={styles.emptyTitle}>{t('propertyChat.empty')}</Text>
                <Text style={styles.emptyHint}>{t('propertyChat.emptyHint')}</Text>
              </View>
            }
          />
        )}

        <ChatComposer
          value={text}
          onChangeText={setText}
          onSend={send}
          placeholder={t('propertyChat.placeholder')}
          sending={sending}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f1f5f9' },
  creditsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#faf5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  creditsTextCol: { flex: 1 },
  creditsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5b21b6',
  },
  creditsSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    marginTop: 2,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: colors.slateMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
});
