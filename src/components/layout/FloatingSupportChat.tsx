import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '../../api/singleton';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

const FAB_SIZE = 38;
const FAB_GAP = 10;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type ScrollToTopAction = {
  visible: boolean;
  onPress: () => void;
};

type Props = {
  bottomOffset?: number;
  scrollToTop?: ScrollToTopAction;
};

/** Stacked quick-action FABs (support, chat, optional scroll-to-top). */
export function getFloatingRailHeight(showScrollToTop: boolean): number {
  const count = showScrollToTop ? 3 : 2;
  return FAB_SIZE * count + FAB_GAP * (count - 1) + 12;
}

export function FloatingSupportChat({ bottomOffset = 0, scrollToTop }: Props) {
  const navigation = useNavigation<Nav>();
  const [messageCount, setMessageCount] = useState(0);
  const showTop = scrollToTop?.visible === true;

  const refreshCount = useCallback(async () => {
    try {
      const res = await propertiesApi.getMyMessageCount();
      setMessageCount(res.count ?? 0);
    } catch {
      setMessageCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshCount();
    }, [refreshCount])
  );

  return (
    <View
      style={[styles.anchor, { paddingBottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <View
        style={styles.stack}
        pointerEvents="box-none"
        accessibilityLabel="Quick actions"
      >
        {showTop && scrollToTop ? (
          <Pressable
            onPress={scrollToTop.onPress}
            style={({ pressed }) => [
              styles.fab,
              styles.fabTop,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="Back to top"
            accessibilityRole="button"
            hitSlop={8}
          >
            <LinearGradient
              colors={['#0d9488', '#0f766e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabInner}
            >
              <Ionicons name="arrow-up" size={18} color={colors.heroText} />
            </LinearGradient>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate('SupportTickets')}
          style={({ pressed }) => [styles.fab, styles.fabSupport, pressed && styles.pressed]}
          accessibilityLabel="Support"
          accessibilityRole="button"
          hitSlop={8}
        >
          <LinearGradient
            colors={['#0e7490', '#0c4a6e', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}
          >
            <Ionicons name="help-buoy" size={17} color="#bae6fd" />
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('MyChats')}
          style={({ pressed }) => [
            styles.fab,
            styles.fabChat,
            pressed && styles.pressed,
          ]}
          accessibilityLabel={
            messageCount > 0 ? `Chats, ${messageCount} unread` : 'Chats'
          }
          accessibilityRole="button"
          hitSlop={8}
        >
          <LinearGradient
            colors={['#6d28d9', '#4c1d95', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}
          >
            <Ionicons name="chatbubbles" size={16} color="#e9d5ff" />
          </LinearGradient>
          {messageCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {messageCount > 9 ? '9+' : messageCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  stack: {
    alignItems: 'center',
    gap: FAB_GAP,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 10,
  },
  fabTop: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  fabSupport: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  fabChat: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  fabInner: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.heroText,
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.94 }],
  },
});
