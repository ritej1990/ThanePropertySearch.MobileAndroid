import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InquiryMessage } from '../../api/inquiryTypes';
import type { AppLocale } from '../../i18n/types';
import type { TranslateFn } from '../../i18n';
import { formatChatTime } from '../../utils/chatFormat';
import { formatInr } from '../../utils/propertyFormat';
import { colors, radius, spacing } from '../../theme';

type Props = {
  message: InquiryMessage;
  isMine: boolean;
  locale: AppLocale;
  t: TranslateFn;
  showSender?: boolean;
};

export function PropertyChatBubble({
  message,
  isMine,
  locale,
  t,
  showSender = true,
}: Props) {
  const time = formatChatTime(message.sentAtUtc, locale);
  const hasOffer = message.offerAmount != null && message.offerAmount > 0;

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      {!isMine ? (
        <View style={styles.avatar}>
          <Ionicons name="person" size={14} color="#0f766e" />
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        {showSender && !isMine ? (
          <Text style={styles.sender}>{message.sender}</Text>
        ) : null}
        <Text style={[styles.body, isMine && styles.bodyMine]}>{message.message}</Text>
        {hasOffer ? (
          <View style={styles.offerChip}>
            <Ionicons name="pricetag" size={12} color="#b45309" />
            <Text style={styles.offerText}>
              {t('propertyChat.offerAmount', { amount: formatInr(message.offerAmount!) })}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.time, isMine && styles.timeMine]}>{time}</Text>
      </View>
    </View>
  );
}

export function ChatDaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.dayRow}>
      <View style={styles.dayLine} />
      <Text style={styles.dayText}>{label}</Text>
      <View style={styles.dayLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    maxWidth: '100%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleMine: {
    backgroundColor: '#6d28d9',
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 6,
  },
  sender: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
    marginBottom: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.navy,
  },
  bodyMine: {
    color: colors.heroText,
  },
  offerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  time: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slateLight,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(248,250,252,0.72)',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
