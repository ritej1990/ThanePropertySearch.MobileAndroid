import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import { AiHubSection } from './AiHubSection';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslateFn } from '../../i18n';
import { colors, radius, spacing } from '../../theme';

type Props = {
  listingId: number;
  propertyTitle: string;
  onComposerFocus?: () => void;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

function propertyPrompts(title: string, t: TranslateFn): string[] {
  return [
    t('aiCopilot.promptFairPrice', { title }),
    t('aiCopilot.promptCommute'),
    t('aiCopilot.promptAskOwner'),
  ];
}

/** Property-scoped advisor chat — mirrors web AI Property Copilot. */
export function AiPropertyCopilot({
  listingId,
  propertyTitle,
  onComposerFocus,
}: Props) {
  const { t } = useTranslation();
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
      const res = await aiApi.startAdvisorConversation(
        `Property #${listingId}: ${propertyTitle}`,
        listingId
      );
      setConversationId(res.conversationId);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: t('aiCopilot.welcome', { title: propertyTitle }),
        },
      ]);
    } catch (e) {
      setStartError(
        e instanceof ApiError ? e.message : t('aiCopilot.couldNotStart')
      );
    } finally {
      setStarting(false);
    }
  }, [listingId, propertyTitle, t]);

  useEffect(() => {
    void startConversation();
  }, [startConversation]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || sending) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    Keyboard.dismiss();

    try {
      const res = await aiApi.sendAdvisorMessage(conversationId, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a-${res.messageId}`, role: 'assistant', text: res.reply },
      ]);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : t('aiCopilot.couldNotReach');
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: message },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <AiHubSection
      eyebrow={t('aiCopilot.eyebrow')}
      title={t('aiCopilot.title')}
      subtitle={t('aiCopilot.subtitle')}
      defaultExpanded={false}
    >
      {starting ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7c3aed" />
          <Text style={styles.loadingText}>{t('aiCopilot.starting')}</Text>
        </View>
      ) : startError ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{startError}</Text>
          <Pressable style={styles.retryBtn} onPress={startConversation}>
            <Text style={styles.retryText}>{t('shared.tryAgain')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            scrollEnabled={messages.length > 3}
            style={styles.list}
            contentContainerStyle={styles.listContent}
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
                  {propertyPrompts(propertyTitle, t).map((p) => (
                    <Pressable key={p} style={styles.promptChip} onPress={() => send(p)}>
                      <Text style={styles.promptChipText}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={t('aiCopilot.placeholder')}
              placeholderTextColor={colors.slateLight}
              multiline
              editable={!sending}
              onFocus={onComposerFocus}
            />
            <Pressable
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={() => send(input)}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.heroText} />
              ) : (
                <Ionicons name="send" size={16} color={colors.heroText} />
              )}
            </Pressable>
          </View>
        </>
      )}
    </AiHubSection>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.slateLight,
  },
  errorBlock: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: '#7c3aed',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.heroText,
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '92%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6d28d9',
    lineHeight: 17,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    maxHeight: 88,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
