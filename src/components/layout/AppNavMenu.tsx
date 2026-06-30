import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LocaleContext';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { LanguageToggle } from '../ui/LanguageToggle';
import {
  buildNavMenuItems,
  buildQuickMenuKeys,
  navSectionLabel,
  quickMenuLabel,
  type NavMenuItem,
  type NavMenuTarget,
} from './navMenuConfig';
import { getProfileInitials, getRoleLabel } from '../../utils/profileDisplay';
import { isAgentRole, isBuilderRole, isOwnerRole } from '../../utils/roles';
import { colors, radius, spacing } from '../../theme';

export type { NavMenuTarget };

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: NavMenuTarget) => void;
  onSignOut?: () => void;
  unreadChats?: number;
};

function roleAccent(role: string | null | undefined) {
  if (isBuilderRole(role)) return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
  if (isAgentRole(role)) return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
  if (isOwnerRole(role)) return { bg: '#ecfdf5', text: '#0f766e', border: '#99f6e4' };
  return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
}

export function AppNavMenu({
  visible,
  onClose,
  onNavigate,
  onSignOut,
  unreadChats = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const role = profile?.role;

  const sheetWidth = Math.min(Math.round(screenW * 0.82), 288);
  const maxSheetHeight = screenH - insets.top - 8;

  const items = useMemo(() => buildNavMenuItems(role, t), [role, t]);
  const quickKeys = useMemo(() => buildQuickMenuKeys(role), [role]);

  const quickItems = useMemo(
    () =>
      quickKeys
        .map((key) => items.find((i) => i.key === key))
        .filter((i): i is NavMenuItem => i != null),
    [items, quickKeys]
  );

  const sections = useMemo(() => {
    const order: NavMenuItem['section'][] = ['explore', 'account', 'support'];
    const quickSet = new Set(quickKeys);
    return order
      .map((section) => ({
        section,
        items: items.filter(
          (i) => i.section === section && !quickSet.has(i.key)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [items, quickKeys]);

  const displayName = profile?.fullName?.trim() || profile?.username || t('common.guest');
  const initials = getProfileInitials(profile?.fullName);
  const accent = roleAccent(role);
  const primaryTarget = quickKeys[0];

  function go(target: NavMenuTarget) {
    onClose();
    onNavigate(target);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.closeMenu')} />

        <View
          style={[
            styles.sheet,
            {
              width: sheetWidth,
              maxHeight: maxSheetHeight,
              paddingTop: insets.top + 8,
              paddingBottom: Math.max(insets.bottom, spacing.sm),
            },
          ]}
        >
          <LinearGradient
            colors={['#c9a227', '#0d9488', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topStripe}
            pointerEvents="none"
          />

          <View style={styles.header}>
            <ThaneFlatsLogo size={22} showWordmark onDark={false} />
            <View style={styles.headerActions}>
              <LanguageToggle variant="surface" compact />
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={16} color={colors.slateMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.profileCard} onPress={() => go('profile')}>
            <LinearGradient
              colors={[colors.navyDeep, '#1a4d6e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {displayName}
                </Text>
                <View style={[styles.rolePill, { backgroundColor: accent.bg, borderColor: accent.border }]}>
                  <Text style={[styles.roleText, { color: accent.text }]}>
                    {getRoleLabel(role, t)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={15} color="rgba(248,250,252,0.5)" />
            </LinearGradient>
          </Pressable>

          {primaryTarget ? (
            <Pressable
              style={({ pressed }) => [styles.primaryCta, pressed && styles.primaryCtaPressed]}
              onPress={() => go(primaryTarget)}
            >
              <LinearGradient
                colors={
                  isBuilderRole(role)
                    ? ['#5b21b6', '#7c3aed']
                    : isAgentRole(role)
                      ? ['#1d4ed8', '#2563eb']
                      : ['#0f766e', '#0d9488']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryCtaInner}
              >
                <Ionicons
                  name={
                    isBuilderRole(role)
                      ? 'grid'
                      : isAgentRole(role)
                        ? 'briefcase'
                        : isOwnerRole(role)
                          ? 'home'
                          : 'search'
                  }
                  size={18}
                  color={colors.heroText}
                />
                <Text style={styles.primaryCtaText}>
                  {isBuilderRole(role)
                    ? t('nav.ctaOpenBuilderDashboard')
                    : isAgentRole(role)
                      ? t('nav.ctaOpenAgentDashboard')
                      : isOwnerRole(role)
                        ? t('nav.ctaMyListings')
                        : t('nav.ctaSearchProperties')}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : null}

          {quickItems.length > 0 ? (
            <View style={styles.quickRow}>
              {quickItems.map((item) => {
                const badge = item.key === 'myChats' ? unreadChats : 0;
                return (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      styles.quickTile,
                      pressed && styles.quickTilePressed,
                    ]}
                    onPress={() => go(item.key)}
                  >
                    <View style={[styles.quickIcon, { backgroundColor: item.accentBg }]}>
                      <Ionicons name={item.icon} size={16} color={item.accent} />
                      {badge > 0 ? (
                        <View style={styles.quickBadge}>
                          <Text style={styles.quickBadgeText}>
                            {badge > 9 ? '9+' : badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.quickLabel} numberOfLines={1}>
                      {quickMenuLabel(item.key, t)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {sections.map((group, gi) => (
              <View key={group.section} style={gi > 0 ? styles.sectionSpaced : undefined}>
                <Text style={styles.sectionLabel}>{navSectionLabel(group.section, t)}</Text>
                <View style={styles.sectionCard}>
                  {group.items.map((item, idx) => (
                    <MenuRow
                      key={item.key}
                      item={item}
                      isLast={idx === group.items.length - 1}
                      badge={
                        item.key === 'myChats' && unreadChats > 0 ? unreadChats : undefined
                      }
                      onPress={() => go(item.key)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footerBlock}>
            {onSignOut ? (
              <Pressable
                style={({ pressed }) => [
                  styles.signOutBtn,
                  pressed && styles.signOutBtnPressed,
                ]}
                onPress={() => {
                  onClose();
                  onSignOut();
                }}
              >
                <Ionicons name="log-out-outline" size={15} color={colors.error} />
                <Text style={styles.signOutText}>{t('common.signOut')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MenuRow({
  item,
  isLast,
  badge,
  onPress,
}: {
  item: NavMenuItem;
  isLast: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.accentBg }]}>
        <Ionicons name={item.icon} size={15} color={item.accent} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.menuSub} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={13} color={colors.slateLight} />
      )}
      {!isLast ? <View style={styles.rowDivider} /> : null}
    </Pressable>
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
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  sheet: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 24,
    overflow: 'hidden',
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.heroText,
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.heroText,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  primaryCta: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  primaryCtaPressed: {
    opacity: 0.92,
  },
  primaryCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  primaryCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.heroText,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickTilePressed: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  quickBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.heroText,
  },
  quickLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionSpaced: {
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.65,
    marginBottom: 4,
    marginLeft: 2,
  },
  sectionCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    position: 'relative',
  },
  menuRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  menuSub: {
    fontSize: 10,
    color: colors.slateLight,
    marginTop: 1,
  },
  rowDivider: {
    position: 'absolute',
    left: 46,
    right: spacing.sm,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
  badge: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.heroText,
  },
  footerBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  signOutBtnPressed: {
    backgroundColor: colors.errorSoft,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
});
