import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MessageAlertPayload } from '../../api/messageNotificationTypes';
import {
  messageAlertActionLabel,
  messageAlertContextLabel,
  messageAlertIcon,
  messageAlertTitle,
  truncateMessage,
} from '../../utils/messageNotifications';
import { colors, radius, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

type Props = {
  visible: boolean;
  item: MessageAlertPayload | null;
  totalUnread: number;
  onDismiss: () => void;
  onOpen: () => void;
};

export function MessageAlertToast({
  visible,
  item,
  totalUnread,
  onDismiss,
  onOpen,
}: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 240,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 24,
        duration: 240,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  if (!item) return null;

  const icon = messageAlertIcon(item);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrap,
        { bottom: insets.bottom + spacing.lg },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primaryDark} />
        </View>
        <View style={styles.body}>
          <View style={styles.head}>
            <Text style={styles.title}>{messageAlertTitle(item)}</Text>
            <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss">
              <Ionicons name="close" size={18} color={colors.slateMuted} />
            </Pressable>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            <Text style={styles.sender}>{item.sender ?? 'Someone'}</Text>
            {' · '}
            <Text style={styles.property}>{messageAlertContextLabel(item)}</Text>
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {truncateMessage(item.message)}
          </Text>
          {totalUnread > 1 ? (
            <Text style={styles.unreadMeta}>
              {totalUnread} unread messages in your inbox
            </Text>
          ) : null}
          <Pressable style={styles.action} onPress={onOpen}>
            <Text style={styles.actionText}>{messageAlertActionLabel(item)}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9998,
    alignItems: 'flex-end',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    maxWidth: 420,
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  meta: {
    fontSize: 12,
    color: colors.slateLight,
    marginBottom: 4,
  },
  sender: {
    fontWeight: '700',
    color: colors.slateMuted,
  },
  property: {
    fontWeight: '600',
    color: colors.slateLight,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  unreadMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    marginBottom: spacing.sm,
  },
  action: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  actionText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 13,
  },
});
