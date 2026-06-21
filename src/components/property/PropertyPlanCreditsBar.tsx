import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { paymentsApi } from '../../api/singleton';
import type { EssentialStatus } from '../../api/paymentTypes';
import type { RootStackParamList } from '../../navigation/types';
import { useTranslation } from '../../context/LocaleContext';
import { hasActivePlanCredits, isEssentialPlanExpired, normalizeEssentialUsage } from '../../utils/planUsage';
import { colors, radius, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  propertyId: number;
  navigation: Nav;
};

export function PropertyPlanCreditsBar({ propertyId, navigation }: Props) {
  const { t } = useTranslation();
  const [essential, setEssential] = useState<EssentialStatus | null>(null);

  const load = useCallback(async () => {
    try {
      const e = await paymentsApi.getEssentialStatus();
      setEssential(e);
    } catch {
      setEssential(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!essential) return null;

  const expired = isEssentialPlanExpired(essential);
  const { usageMax, usageUsed, usageLeft } = normalizeEssentialUsage(essential);
  const hasPlan = hasActivePlanCredits(essential);
  const pct =
    usageMax > 0 ? Math.min(100, (usageUsed / usageMax) * 100) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.creditsCard}>
        <View style={styles.cardHead}>
          {expired ? (
            <View style={styles.expiredHead}>
              <Ionicons name="time-outline" size={18} color={colors.error} />
              <Text style={styles.expiredText}>{t('plan.expired')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardHeadLeft}>
                <Ionicons name="flash" size={18} color={colors.primary} />
                <Text style={styles.cardTitle}>{t('plan.planCredits')}</Text>
              </View>
              <Text style={styles.cardValue}>
                <Text style={styles.remain}>{usageLeft}</Text>
                <Text style={styles.total}> / {usageMax}</Text>
              </Text>
            </>
          )}
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              expired && styles.trackFillExpired,
              { width: `${expired ? 100 : pct}%` },
            ]}
          />
        </View>
        <Text style={styles.hint}>
          {expired ? t('plan.renewContactHint') : t('plan.creditHint')}
        </Text>
      </View>

      {!hasPlan ? (
        <Pressable
          style={styles.unlockPress}
          onPress={() =>
            navigation.navigate('EssentialService', { returnPropertyId: propertyId })
          }
          accessibilityRole="button"
          accessibilityLabel={expired ? t('plan.renewEssential') : t('plan.unlockChat')}
        >
          <LinearGradient
            colors={expired ? ['#7f1d1d', '#dc2626'] : ['#1e3a5f', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.unlockGradient}
          >
            <View style={styles.unlockIconWrap}>
              <Ionicons
                name={expired ? 'refresh' : 'flash'}
                size={20}
                color={colors.goldAccent}
              />
            </View>
            <View style={styles.unlockTextCol}>
              <Text style={styles.unlockTitle}>
                {expired ? t('plan.renewEssential') : t('plan.unlockChat')}
              </Text>
              <Text style={styles.unlockSub}>
                {expired ? t('plan.renewSub') : t('plan.unlockSub')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.heroText} />
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  creditsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  expiredHead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  remain: {
    color: colors.teal,
  },
  expiredText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '800',
  },
  total: {
    color: colors.slateLight,
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  trackFillExpired: {
    backgroundColor: colors.error,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
    lineHeight: 16,
  },
  unlockPress: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  unlockIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockTextCol: {
    flex: 1,
    minWidth: 0,
  },
  unlockTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.heroText,
  },
  unlockSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(248, 250, 252, 0.85)',
    marginTop: 2,
    lineHeight: 16,
  },
});
