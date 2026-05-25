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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import { paymentsApi } from '../api/singleton';
import type { InquiryMessage } from '../api/inquiryTypes';
import type { EssentialStatus } from '../api/paymentTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import {
  alertPlanRequired,
  handlePlanUsageError,
  hasActivePlanCredits,
} from '../utils/planUsage';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyChat'>;

export default function PropertyChatScreen({ navigation, route }: Props) {
  const { inquiryId, propertyId } = route.params;
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [essential, setEssential] = useState<EssentialStatus | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const data = await propertiesApi.getInquiryMessages(inquiryId);
      setMessages(data);
    } catch (e) {
      setMessages([]);
      if (handlePlanUsageError(e, navigation, propertyId)) return;
    }
  }, [inquiryId, navigation, propertyId]);

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
  }, [loadCredits, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refresh();
    }, [refresh])
  );

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!hasActivePlanCredits(essential)) {
      alertPlanRequired(navigation, propertyId);
      return;
    }
    setSending(true);
    try {
      await propertiesApi.sendInquiryMessage(inquiryId, trimmed);
      setText('');
      await refresh();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert('Send failed', e instanceof ApiError ? e.message : 'Try again');
      }
    } finally {
      setSending(false);
    }
  }

  const creditsLabel =
    essential != null
      ? `${essential.usageLeft} / ${essential.usageMax} credits left`
      : null;

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {creditsLabel ? (
          <View style={styles.creditsBar}>
            <Text style={styles.creditsText}>{creditsLabel}</Text>
            <Text style={styles.creditsSub}>1 credit per message you send</Text>
          </View>
        ) : null}

        {loading ? (
          <BrandLoading fullScreen={false} message="Loading messages…" />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.bubble}>
                <Text style={styles.sender}>{item.sender}</Text>
                <Text style={styles.msg}>{item.message}</Text>
                <Text style={styles.time}>
                  {new Date(item.sentAtUtc).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet. Say hello!</Text>
            }
          />
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            multiline
          />
          <Pressable
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={send}
            disabled={sending}
          >
            <Text style={styles.sendText}>{sending ? '…' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceMuted },
  creditsBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  creditsSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
    marginTop: 2,
  },
  list: { padding: spacing.lg, paddingBottom: spacing.md },
  bubble: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sender: { fontWeight: '800', color: colors.navy, marginBottom: 4 },
  msg: { color: colors.slate, lineHeight: 20 },
  time: { fontSize: 11, color: colors.slateLight, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.slateLight, marginTop: spacing.xl },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    color: colors.navy,
  },
  sendBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: colors.heroText, fontWeight: '800' },
});
