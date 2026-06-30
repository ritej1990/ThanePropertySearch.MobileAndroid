import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '../../api/singleton';
import type { PropertyRatingItem } from '../../api/ratingTypes';
import { ApiError } from '../../api/client';
import { useTranslation } from '../../context/LocaleContext';
import { localeToCulture } from '../../i18n/types';
import { colors, radius, spacing } from '../../theme';

type Props = {
  propertyId: number;
  averageRating: number;
  ratingCount: number;
  /** Seeker (User) can submit a rating; everyone can read reviews. */
  canSubmit?: boolean;
  onRated?: () => void;
};

function StarRow({ stars, size = 16 }: { stars: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= stars ? 'star' : 'star-outline'}
          size={size}
          color={n <= stars ? colors.gold : colors.border}
        />
      ))}
    </View>
  );
}

function formatReviewDate(iso: string, locale: ReturnType<typeof useTranslation>['locale']): string {
  try {
    return new Date(iso).toLocaleDateString(localeToCulture(locale), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function PropertyRatingSection({
  propertyId,
  averageRating,
  ratingCount,
  canSubmit = false,
  onRated,
}: Props) {
  const { t, locale } = useTranslation();
  const [reviews, setReviews] = useState<PropertyRatingItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [stars, setStars] = useState('5');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewBlockReason, setReviewBlockReason] = useState<string | null>(null);

  const hasReviews = ratingCount > 0;
  const displayAverage = hasReviews ? averageRating.toFixed(1) : null;

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await propertiesApi.getPropertyRatings(propertyId);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [propertyId]);

  // Only seekers who completed a visit may write a review (gate the form).
  const loadEligibility = useCallback(async () => {
    if (!canSubmit) {
      setCanReview(false);
      return;
    }
    try {
      const e = await propertiesApi.getRatingEligibility(propertyId);
      setCanReview(e.canReview);
      setReviewBlockReason(e.reason);
    } catch {
      setCanReview(false);
      setReviewBlockReason(null);
    }
  }, [propertyId, canSubmit]);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
      loadEligibility();
    }, [loadReviews, loadEligibility])
  );

  async function submit() {
    const n = Number(stars);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      Alert.alert(t('ratings.invalidRating'), t('ratings.invalidRatingBody'));
      return;
    }
    setSubmitting(true);
    try {
      await propertiesApi.rateProperty(propertyId, n, review.trim());
      Alert.alert(t('shared.thankYou'), t('ratings.submitted'));
      setReview('');
      await loadReviews();
      onRated?.();
    } catch (e) {
      Alert.alert(
        t('ratings.couldNotSubmit'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Ionicons name="star" size={28} color={colors.gold} />
          <View>
            {hasReviews ? (
              <>
                <Text style={styles.summaryScore}>{displayAverage}</Text>
                <StarRow stars={Math.round(averageRating)} size={14} />
                <Text style={styles.summaryCount}>
                  {ratingCount}{' '}
                  {ratingCount === 1 ? t('ratings.review') : t('ratings.reviews')}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.summaryScore}>—</Text>
                <Text style={styles.summaryCount}>{t('ratings.noReviewsYet')}</Text>
                <Text style={styles.summaryHint}>{t('ratings.beFirst')}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {(hasReviews || reviews.length > 0) && (
        <View style={styles.reviewsCard}>
          <Pressable
            style={styles.reviewsHead}
            onPress={() => setReviewsExpanded((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: reviewsExpanded }}
          >
            <Text style={styles.reviewsTitle}>{t('ratings.reviewsTitle')}</Text>
            <Ionicons
              name={reviewsExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.slateMuted}
            />
          </Pressable>
          {reviewsExpanded ? (
            loadingReviews ? (
              <Text style={styles.loadingText}>{t('ratings.loadingReviews')}</Text>
            ) : reviews.length === 0 ? (
              <Text style={styles.emptyReviews}>{t('ratings.noWrittenReviews')}</Text>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewItem}>
                  <View style={styles.reviewHead}>
                    <Text style={styles.reviewer}>{r.userName}</Text>
                    <StarRow stars={r.stars} size={12} />
                  </View>
                  {r.review?.trim() ? (
                    <Text style={styles.reviewBody}>{r.review.trim()}</Text>
                  ) : null}
                  <Text style={styles.reviewDate}>
                    {formatReviewDate(r.createdAtUtc, locale)}
                  </Text>
                </View>
              ))
            )
          ) : null}
        </View>
      )}

      {canSubmit && !canReview ? (
        <View style={styles.lockedCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.slateMuted}
          />
          <Text style={styles.lockedText}>
            {reviewBlockReason ?? t('ratings.lockedDefault')}
          </Text>
        </View>
      ) : null}

      {canSubmit && canReview ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t('ratings.rateTitle')}</Text>
          <View style={styles.row}>
            <View style={styles.starsCol}>
              <Text style={styles.label}>{t('ratings.starsLabel')}</Text>
              <TextInput
                style={styles.starsInput}
                value={stars}
                onChangeText={(t) => setStars(t.replace(/[^0-9]/g, '').slice(0, 1))}
                keyboardType="number-pad"
                maxLength={1}
              />
            </View>
            <View style={styles.reviewCol}>
              <Text style={styles.label}>{t('ratings.yourReview')}</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder={t('ratings.reviewPlaceholder')}
                value={review}
                onChangeText={setReview}
                multiline
              />
            </View>
          </View>
          <Pressable
            style={[styles.btn, submitting && styles.btnDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            <Ionicons name="checkmark" size={18} color={colors.heroText} />
            <Text style={styles.btnText}>{t('ratings.submitRating')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryScore: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slateMuted,
    marginTop: 2,
  },
  summaryHint: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  reviewsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  loadingText: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    color: colors.slateLight,
    fontSize: 14,
  },
  emptyReviews: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    color: colors.slateLight,
    fontSize: 14,
  },
  reviewItem: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewer: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    flex: 1,
  },
  reviewBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.slateMuted,
    marginTop: spacing.sm,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  lockedText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slateMuted,
    fontWeight: '600',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  starsCol: { width: 72 },
  reviewCol: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    marginBottom: 4,
  },
  starsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.navy,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.navy,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.heroText, fontWeight: '800', fontSize: 15 },
});
