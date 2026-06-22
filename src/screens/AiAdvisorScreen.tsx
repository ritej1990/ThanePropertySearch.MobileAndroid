import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { aiApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AiAdvisor'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const STARTER_PROMPTS = [
  'What is a fair rent for a 2BHK in Thane West?',
  'Compare Ghodbunder Road vs Kolshet for families',
  'Is this a good time to buy in Thane?',
];

export default function AiAdvisorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [starting, setStarting] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const startConversation = useCallback(async () => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await aiApi.startAdvisorConversation('Thane Flats AI advisor');
      setConversationId(res.conversationId);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text:
            "Hi! I'm the Thane Flats AI advisor. Ask me about fair pricing, localities, commute, or anything about a listing you're considering.",
        },
      ]);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : 'Could not start the advisor chat.');
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || sending) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await aiApi.sendAdvisorMessage(conversationId, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a-${res.messageId}`, role: 'assistant', text: res.reply },
      ]);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Could not reach the AI advisor.';
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: message },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  if (starting) {
    return (
      <AuthenticatedScreenLayout
        showBack
        onBack={() => navigation.goBack()}
        showFloatingActions={false}
        showLegalFooter={false}
      >
        <BrandLoading message="Starting AI advisor…" />
      </AuthenticatedScreenLayout>
    );
  }

  if (startError) {
    return (
      <AuthenticatedScreenLayout
        showBack
        onBack={() => navigation.goBack()}
        showFloatingActions={false}
        showLegalFooter={false}
      >
        <View style={styles.centered}>
          <Ionicons name="sparkles-outline" size={32} color={colors.slateLight} />
          <Text style={styles.errorTitle}>AI advisor unavailable</Text>
          <Text style={styles.errorText}>{startError}</Text>
          <Pressable style={styles.retryBtn} onPress={startConversation}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </AuthenticatedScreenLayout>
    );
  }

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
      showFloatingActions={false}
      showLegalFooter={false}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Ionicons name="sparkles" size={18} color="#7c3aed" />
          </View>
          <View>
            <Text style={styles.title}>AI Property Advisor</Text>
            <Text style={styles.subtitle}>Ask about pricing, areas & negotiation</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.role === 'user' && styles.bubbleTextUser,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          ListFooterComponent={
            messages.length === 1 ? (
              <View style={styles.promptRow}>
                {STARTER_PROMPTS.map((p) => (
                  <Pressable key={p} style={styles.promptChip} onPress={() => send(p)}>
                    <Text style={styles.promptChipText}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask the AI advisor…"
            placeholderTextColor={colors.slateLight}
            multiline
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={18} color={colors.heroText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  errorText: {
    fontSize: 13,
    color: colors.slateLight,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  title: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.navy,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
  bubbleTextUser: {
    color: colors.heroText,
  },
  promptRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  promptChip: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  promptChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6d28d9',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
