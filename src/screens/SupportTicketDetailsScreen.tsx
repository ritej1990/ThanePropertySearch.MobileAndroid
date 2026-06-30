import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supportApi } from '../api/singleton';
import { ApiError } from '../api/client';
import type { SupportTicketDetail, SupportTicketMessage } from '../api/supportTypes';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import type { AppLocale } from '../i18n/types';
import { localeToCulture } from '../i18n/types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SupportTicketDetails'>;

export default function SupportTicketDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
  const { ticketId, subject } = route.params;
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await supportApi.getTicket(ticketId);
      setTicket(data);
    } catch (e) {
      Alert.alert(
        t('support.couldNotLoadTicket'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigation, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function sendReply() {
    const text = reply.trim();
    if (!text) return;
    setSending(true);
    try {
      await supportApi.addMessage(ticketId, text);
      setReply('');
      await load();
    } catch (e) {
      Alert.alert(
        t('support.sendFailed'),
        e instanceof ApiError ? e.message : t('support.couldNotSend')
      );
    } finally {
      setSending(false);
    }
  }

  const closed =
    ticket?.status?.toLowerCase() === 'resolved' ||
    ticket?.status?.toLowerCase() === 'closed';

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {loading ? (
          <BrandLoading fullScreen={false} message={t('support.loadingTicket')} />
        ) : ticket ? (
          <>
            <View style={styles.head}>
              <Text style={styles.subject} numberOfLines={2}>
                #{ticket.id} · {subject ?? ticket.subject}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{ticket.status}</Text>
              </View>
            </View>

            <FlatList
              data={ticket.messages}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={styles.messages}
              renderItem={({ item }) => (
                <MessageBubble message={item} locale={locale} />
              )}
            />

            {!closed ? (
              <View style={[styles.composer, { paddingBottom: spacing.md + insets.bottom }]}>
                <TextInput
                  style={styles.input}
                  value={reply}
                  onChangeText={setReply}
                  placeholder={t('support.replyPlaceholder')}
                  placeholderTextColor={colors.slateLight}
                  multiline
                />
                <Pressable
                  style={[styles.sendBtn, sending && styles.sendDisabled]}
                  onPress={sendReply}
                  disabled={sending}
                >
                  <Text style={styles.sendText}>{t('shared.send')}</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={[styles.closedNote, { paddingBottom: spacing.md + insets.bottom }]}>
                {t('support.ticketClosed')}
              </Text>
            )}
          </>
        ) : null}
      </KeyboardAvoidingView>
    </AuthenticatedScreenLayout>
  );
}

function MessageBubble({
  message,
  locale,
}: {
  message: SupportTicketMessage;
  locale: AppLocale;
}) {
  const mine = !message.isFromAdmin;
  return (
    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
      <Text style={styles.sender}>
        {message.senderName} ·{' '}
        {new Date(message.sentAtUtc).toLocaleString(localeToCulture(locale), {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Text style={styles.body}>{message.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subject: { fontSize: 16, fontWeight: '800', color: colors.navy },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  statusText: { fontSize: 11, fontWeight: '700', color: colors.slateMuted },
  messages: { padding: spacing.lg, paddingBottom: spacing.md },
  bubble: {
    maxWidth: '92%',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#dbeafe',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sender: { fontSize: 10, fontWeight: '700', color: colors.slateLight, marginBottom: 4 },
  body: { fontSize: 14, color: colors.navy, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  sendDisabled: { opacity: 0.6 },
  sendText: { color: colors.heroText, fontWeight: '800' },
  closedNote: {
    textAlign: 'center',
    padding: spacing.md,
    color: colors.slateMuted,
    fontSize: 13,
  },
});
