import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';
import { isBuilderRole, isOwnerRole, isUserRole } from '../../utils/roles';

export type NavMenuTarget =
  | 'home'
  | 'builders'
  | 'ownerDashboard'
  | 'builderDashboard'
  | 'myChats'
  | 'support';

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: NavMenuTarget) => void;
};

type Item = {
  key: NavMenuTarget;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function AppNavMenu({ visible, onClose, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const role = profile?.role;

  const items: Item[] = [
    {
      key: 'home',
      label: 'Property search',
      subtitle: 'Buy, rent & resale listings',
      icon: 'search',
    },
    {
      key: 'builders',
      label: 'Builder projects',
      subtitle: 'New developments in Thane',
      icon: 'business',
    },
  ];

  if (isOwnerRole(role)) {
    items.push({
      key: 'ownerDashboard',
      label: 'My listings',
      subtitle: 'Manage owner properties',
      icon: 'home',
    });
  }

  if (isBuilderRole(role)) {
    items.push({
      key: 'builderDashboard',
      label: 'Builder dashboard',
      subtitle: 'Projects, leads & plans',
      icon: 'construct',
    });
  } else if (!isOwnerRole(role)) {
    items.push({
      key: 'ownerDashboard',
      label: 'Owner dashboard',
      subtitle: 'Post a property for sale or rent',
      icon: 'home-outline',
    });
  }

  if (isUserRole(role) || isOwnerRole(role)) {
    items.push({
      key: 'myChats',
      label: 'My chats',
      subtitle: 'Property conversations',
      icon: 'chatbubbles-outline',
    });
  }

  items.push({
    key: 'support',
    label: 'Support',
    subtitle: 'Help & tickets',
    icon: 'help-buoy-outline',
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.panel,
            {
              marginTop: insets.top + spacing.sm,
              marginRight: spacing.md,
            },
          ]}
        >
          <Text style={styles.panelTitle}>Menu</Text>
          {items.map((item) => (
            <Pressable
              key={item.key}
              style={styles.row}
              onPress={() => {
                onClose();
                onNavigate(item.key);
              }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.slateLight} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'flex-end',
  },
  panel: {
    width: 300,
    maxWidth: '92%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
  },
  rowSub: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 2,
  },
});
