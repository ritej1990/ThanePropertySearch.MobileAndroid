import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  buildNavMenuItems,
  type NavMenuItem,
  type NavMenuTarget,
} from './navMenuConfig';
import { getProfileInitials, getRoleLabel } from '../../utils/profileDisplay';
import { colors, gradients, radius, spacing } from '../../theme';

export type { NavMenuTarget };

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: NavMenuTarget) => void;
  onSignOut?: () => void;
  unreadChats?: number;
};

const SECTION_LABELS: Record<NavMenuItem['section'], string> = {
  explore: 'Explore',
  account: 'Account',
  support: 'Support',
};

export function AppNavMenu({
  visible,
  onClose,
  onNavigate,
  onSignOut,
  unreadChats = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const role = profile?.role;

  const items = useMemo(() => buildNavMenuItems(role), [role]);

  const sections = useMemo(() => {
    const order: NavMenuItem['section'][] = ['explore', 'account', 'support'];
    return order
      .map((section) => ({
        section,
        items: items.filter((i) => i.section === section),
      }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  const displayName = profile?.fullName?.trim() || profile?.username || 'Guest';
  const initials = getProfileInitials(profile?.fullName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />

        <View
          style={[
            styles.sheet,
            {
              paddingTop: insets.top + spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.slateMuted} />
            </Pressable>
          </View>

          <LinearGradient
            colors={[...gradients.hero]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{getRoleLabel(role)}</Text>
              </View>
              {profile?.email ? (
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {profile.email}
                </Text>
              ) : null}
            </View>
            <Pressable
              style={styles.profileEdit}
              onPress={() => {
                onClose();
                onNavigate('profile');
              }}
            >
              <Ionicons name="create-outline" size={18} color={colors.heroText} />
            </Pressable>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((group) => (
              <View key={group.section} style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {SECTION_LABELS[group.section]}
                </Text>
                {group.items.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && styles.menuRowPressed,
                    ]}
                    onPress={() => {
                      onClose();
                      onNavigate(item.key);
                    }}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: item.accentBg },
                      ]}
                    >
                      <Ionicons name={item.icon} size={20} color={item.accent} />
                    </View>
                    <View style={styles.menuText}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuSub}>{item.subtitle}</Text>
                    </View>
                    {item.key === 'myChats' && unreadChats > 0 ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {unreadChats > 9 ? '9+' : unreadChats}
                        </Text>
                      </View>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.slateLight}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>

          {onSignOut ? (
            <Pressable
              style={styles.signOutBtn}
              onPress={() => {
                onClose();
                onSignOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          ) : null}

          <Text style={styles.footer}>Thane Flats · Property search</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + 4,
    borderBottomLeftRadius: radius.xl + 4,
    shadowColor: colors.navy,
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.heroText,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.3,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(252, 211, 77, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.45)',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldAccent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(248, 250, 252, 0.75)',
    marginTop: 6,
  },
  profileEdit: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuRowPressed: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  menuSub: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 2,
    lineHeight: 16,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.error,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.slateLight,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
