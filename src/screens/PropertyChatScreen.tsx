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
import type { InquiryMessage } from '../api/inquiryTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyChat'>;

export default function PropertyChatScreen({ navigation, route }: Props) {
  const { inquiryId } = route.params;
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await propertiesApi.getInquiryMessages(inquiryId);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await propertiesApi.sendInquiryMessage(inquiryId, trimmed);
      setText('');
      await load();
    } catch (e) {
      Alert.alert('Send failed', e instanceof ApiError ? e.message : 'Try again');
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
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
          <Pressable style={styles.sendBtn} onPress={send} disabled={sending}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceMuted },
  loader: { marginTop: spacing.xxxl },
  list: { padding: spacing.lg, paddingBottom: spacing.md },
  bubble: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sender: { fontWeight: '800', fontSize: 13, color: colors.navy },
  msg: { fontSize: 15, color: colors.slate, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 10, color: colors.slateLight, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.slateLight, marginTop: 40 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.navy,
  },
  sendBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  sendText: { color: colors.heroText, fontWeight: '800' },
});
