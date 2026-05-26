import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import type { PropertyResponse } from '../api/types';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { PropertyChip } from '../components/property/PropertyChip';
import { PropertyDetailStickyBar } from '../components/property/PropertyDetailStickyBar';
import { PropertyDetailTabs } from '../components/property/PropertyDetailTabs';
import { PropertyGallery } from '../components/property/PropertyGallery';
import { SimilarPropertyCard } from '../components/property/SimilarPropertyCard';
import { SpecRow } from '../components/property/SpecRow';
import type { RootStackParamList } from '../navigation/types';
import { colors, gradients, radius, spacing, typography } from '../theme';
import {
  formatInr,
  formatListingDate,
  listingTypeChips,
  parseRichMetadata,
} from '../utils/propertyFormat';
import { PropertyNextStepsPanel } from '../components/property/PropertyNextStepsPanel';
import { PropertyPlanCreditsBar } from '../components/property/PropertyPlanCreditsBar';
import { PropertyRatingSection } from '../components/property/PropertyRatingSection';
import { useAuth } from '../context/AuthContext';
import { useScrollCompactHeader } from '../hooks/useScrollCompactHeader';
import { getPrimaryPrice } from '../utils/propertyDisplay';
import { isOwnerRole, isUserRole } from '../utils/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetails'>;

const SAFETY_TIPS = [
  'Do not send money in advance before site visit and ownership verification.',
  'Avoid sharing OTP, bank PIN, UPI PIN, or card details with anyone.',
  'Verify owner identity and property documents before token payment.',
  'Report suspected fraud via in-app Support.',
] as const;

function StatTile({
  icon,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  onPress?: () => void;
}) {
  const body = (
    <>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={18} color="#0d9488" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, onPress ? styles.statLabelLink : null]}>
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.statTile, pressed && styles.statTilePressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${value}, ${label}. Go to ratings and reviews`}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.statTile}>{body}</View>;
}

export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const { propertyId } = route.params;
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { goToTopVisible, onScroll, resetCompactHeader } = useScrollCompactHeader();
  const showUserActions = isUserRole(profile?.role);
  const showOwnerActions = isOwnerRole(profile?.role);
  const scrollRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const nextStepsRef = useRef<View>(null);
  const ratingsRef = useRef<View>(null);
  const [item, setItem] = useState<PropertyResponse | null>(null);
  const [similar, setSimilar] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);

  async function load(silent = false) {
    setError(null);
    if (!silent) setLoading(true);
    try {
      const [detail, list] = await Promise.all([
        propertiesApi.getById(propertyId),
        propertiesApi.list().catch(() => [] as PropertyResponse[]),
      ]);
      setItem(detail);
      setSimilar(list.filter((p) => p.id !== propertyId).slice(0, 8));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load property');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [propertyId]);

  const meta = useMemo(
    () => parseRichMetadata(item?.richMetadataJson),
    [item?.richMetadataJson]
  );

  const gallery = useMemo(() => {
    if (!item) return [];
    const urls = item.imageUrls?.length ? item.imageUrls : [];
    if (urls.length === 0 && item.imageUrl) return [item.imageUrl];
    return urls;
  }, [item]);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    resetCompactHeader();
  }, [resetCompactHeader]);

  if (loading) {
    return (
      <AuthenticatedScreenLayout
        showBack
        onBack={() => navigation.goBack()}
      >
        <BrandLoading message="Loading property…" />
      </AuthenticatedScreenLayout>
    );
  }

  if (error || !item) {
    return (
      <AuthenticatedScreenLayout
        showBack
        onBack={() => navigation.goBack()}
      >
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Property unavailable</Text>
          <Text style={styles.error}>{error ?? 'Property not found'}</Text>
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </AuthenticatedScreenLayout>
    );
  }

  const chips = listingTypeChips(item);
  const price = getPrimaryPrice(item);
  const hasMap = Boolean(item.latitude && item.longitude);
  const isOwnListing =
    showOwnerActions &&
    item.ownerId != null &&
    profile?.userId != null &&
    item.ownerId === profile.userId;

  function scrollToSection(targetRef: React.RefObject<View | null>) {
    const content = scrollContentRef.current;
    const target = targetRef.current;
    if (!content || !target) return;
    target.measureLayout(
      content,
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 12),
          animated: true,
        });
      },
      () => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    );
  }

  const overviewPanel = (
    <View>
      <Text style={styles.panelHeading}>Key specifications</Text>
      <View style={styles.specCard}>
        <SpecRow label="Built-up" value={`${item.builtupSqft} sq.ft`} />
        <SpecRow label="Configuration" value={item.bhkConfiguration || '—'} />
        {item.isForRent && (
          <SpecRow label="Rent" value={`${formatInr(item.rentAmount)} / month`} />
        )}
        {item.isForSale && (
          <SpecRow
            label="Sale price"
            value={item.sellPrice != null ? formatInr(item.sellPrice) : '—'}
          />
        )}
        <SpecRow label="Deposit" value={formatInr(item.depositAmount)} />
        <SpecRow label="Area" value={item.areaName} />
        <SpecRow label="Status" value={item.reviewStatus} />
        <SpecRow label="Listed" value={formatListingDate(item.createdAtUtc)} last />
      </View>
      {meta.highlights && meta.highlights.length > 0 && (
        <LinearGradient
          colors={['#eff6ff', '#f8fafc']}
          style={styles.highlights}
        >
          <Text style={styles.panelHeading}>Highlights</Text>
          {meta.highlights.map((h) => (
            <Text key={h} style={styles.checkItem}>
              ✓ {h}
            </Text>
          ))}
        </LinearGradient>
      )}
    </View>
  );

  const societyPanel = (
    <View>
      {meta.societyName || meta.societyBlock ? (
        <View style={styles.specCard}>
          {meta.societyName && <SpecRow label="Society" value={meta.societyName} />}
          {meta.societyBlock && (
            <SpecRow label="Block / wing" value={meta.societyBlock} last />
          )}
        </View>
      ) : (
        <Text style={styles.mutedBody}>
          No society details for this listing yet. Owners can add them when posting a
          property from the app.
        </Text>
      )}
    </View>
  );

  const aboutPanel = (
    <View>
      <View style={styles.aboutCard}>
        <Text style={styles.panelHeading}>About this property</Text>
        <Text style={styles.aboutText}>
          {item.description?.trim() || 'No description provided.'}
        </Text>
      </View>
      {meta.amenities && meta.amenities.length > 0 && (
        <View style={[styles.specCard, styles.amenityCard]}>
          <Text style={styles.panelHeading}>Amenities</Text>
          <View style={styles.amenityWrap}>
            {meta.amenities.map((a) => (
              <View key={a} style={styles.amenityPill}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
      scrollToTop={{ visible: goToTopVisible, onPress: scrollToTop }}
    >
      <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View ref={scrollContentRef} collapsable={false}>
        <View style={styles.mediaBlock}>
          <PropertyGallery
            urls={gallery}
            autoRotate={gallery.length > 1}
            compact
          />
        </View>

        {showUserActions ? (
          <PropertyPlanCreditsBar
            key={creditsRefreshKey}
            propertyId={propertyId}
            navigation={navigation}
          />
        ) : null}

        <View style={styles.heroCard}>
          <LinearGradient
            colors={[...gradients.detailAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroAccent}
            pointerEvents="none"
          />
          <View style={styles.heroBody}>
            <View style={styles.chipRow}>
              {chips.map((c) => (
                <PropertyChip key={c.label} label={c.label} tone={c.tone} />
              ))}
              {item.bhkConfiguration ? (
                <PropertyChip label={item.bhkConfiguration} tone="bhk" />
              ) : null}
              {item.isFeaturedInSearch ? (
                <PropertyChip label="Featured" tone="featured" />
              ) : null}
            </View>

            <Text style={styles.priceLabel}>{price.label}</Text>
            <Text style={[styles.priceLg, price.isRent && styles.priceRent]}>
              {price.amount}
              {price.suffix ? (
                <Text style={styles.priceSuffix}>{price.suffix}</Text>
              ) : null}
            </Text>
            {item.isForRent && item.depositAmount > 0 && (
              <Text style={styles.depositNote}>
                Deposit {formatInr(item.depositAmount)}
              </Text>
            )}

            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={18} color="#0d9488" />
              <Text style={styles.address}>{item.address || item.areaName}</Text>
            </View>

            <View style={styles.statsGrid}>
              <StatTile
                icon="star"
                value={
                  item.ratingCount > 0
                    ? item.averageRating.toFixed(1)
                    : 'New'
                }
                label={
                  item.ratingCount > 0
                    ? `${item.ratingCount} review${item.ratingCount === 1 ? '' : 's'}`
                    : 'No reviews yet'
                }
                onPress={() => scrollToSection(ratingsRef)}
              />
              <StatTile
                icon="resize-outline"
                value={`${item.builtupSqft}`}
                label="Sq.ft"
              />
              <StatTile
                icon="calendar-outline"
                value={formatListingDate(item.createdAtUtc)}
                label="Listed"
              />
            </View>

            <View style={styles.ownerCard}>
              <Ionicons name="person-circle" size={28} color={colors.primary} />
              <View style={styles.ownerTextCol}>
                <Text style={styles.ownerLabel}>Listed by</Text>
                <Text style={styles.ownerName}>{item.ownerName}</Text>
              </View>
            </View>
          </View>
        </View>

        <PropertyDetailTabs
          overview={overviewPanel}
          society={societyPanel}
          about={aboutPanel}
        />

        {showUserActions ? (
          <View ref={nextStepsRef} collapsable={false}>
            <PropertyNextStepsPanel
              propertyId={propertyId}
              navigation={navigation}
              onUsageChanged={() => setCreditsRefreshKey((k) => k + 1)}
            />
          </View>
        ) : null}

        <View ref={ratingsRef} collapsable={false} style={styles.ratingsSection}>
          <Text style={styles.sectionHeading}>Ratings & reviews</Text>
          <PropertyRatingSection
            propertyId={propertyId}
            averageRating={item.averageRating}
            ratingCount={item.ratingCount}
            canSubmit={showUserActions}
            onRated={() => load(true)}
          />
        </View>

        {similar.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionHeading}>Similar properties</Text>
            <Text style={styles.similarSub}>You may also like these in Thane</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.map((p) => (
                <SimilarPropertyCard
                  key={p.id}
                  item={p}
                  onPress={() =>
                    navigation.push('PropertyDetails', {
                      propertyId: p.id,
                      title: p.title,
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.safetyCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#92400e" />
          <View style={styles.safetyTextCol}>
            <Text style={styles.safetyTitle}>Safety before you finalize</Text>
            {SAFETY_TIPS.map((tip) => (
              <Text key={tip} style={styles.safetyItem}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>
        </View>
      </ScrollView>

      {(showUserActions || isOwnListing) && (
        <PropertyDetailStickyBar
          primaryLabel={isOwnListing ? 'View inquiries' : 'Contact owner'}
          primaryIcon={
            isOwnListing ? 'mail-unread-outline' : 'chatbubble-ellipses-outline'
          }
          secondaryIcon={isOwnListing ? 'calendar-outline' : undefined}
          secondaryAccessibilityLabel="Visit requests"
          onSecondaryPress={
            isOwnListing
              ? () =>
                  navigation.navigate('VisitRequests', {
                    propertyId,
                    title: item.title,
                  })
              : undefined
          }
          onPrimaryPress={() => {
            if (isOwnListing) {
              navigation.navigate('PropertyInquiries', {
                propertyId,
                title: item.title,
              });
              return;
            }
            scrollToSection(nextStepsRef);
          }}
          hasMap={hasMap}
          latitude={item.latitude ?? undefined}
          longitude={item.longitude ?? undefined}
        />
      )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  pageContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 160,
  },
  mediaBlock: {
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surfaceMuted,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.slateLight,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retry: {
    backgroundColor: '#0d9488',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  heroAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  heroBody: {
    padding: spacing.md,
    paddingLeft: spacing.md + 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  priceLabel: {
    ...typography.eyebrow,
    fontSize: 11,
    color: colors.slateLight,
    marginBottom: 4,
  },
  priceLg: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.navy,
  },
  priceRent: {
    color: '#0f766e',
  },
  priceSuffix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  depositNote: {
    marginTop: 4,
    marginBottom: spacing.md,
    fontSize: 14,
    color: colors.slateMuted,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  address: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.slateMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statTile: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  statTilePressed: {
    backgroundColor: '#ecfdf5',
    borderColor: '#5eead4',
  },
  statIconWrap: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.slateLight,
    marginTop: 2,
    textAlign: 'center',
  },
  statLabelLink: {
    color: '#0f766e',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ownerTextCol: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 2,
  },
  panelHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  specCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  highlights: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  checkItem: {
    fontSize: 14,
    color: '#1e3a5f',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  mutedBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.slateLight,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.slate,
  },
  amenityCard: {
    marginTop: spacing.lg,
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  ratingsSection: {
    marginTop: spacing.xl,
  },
  similarSection: {
    marginTop: spacing.xl,
  },
  similarSub: {
    fontSize: 13,
    color: colors.slateLight,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  safetyCard: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  safetyTextCol: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: spacing.md,
  },
  safetyItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#78350f',
    marginBottom: spacing.sm,
  },
});
