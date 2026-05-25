import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuilderProjectDetail, BuilderUnit } from '../api/builderTypes';
import { builderProjectsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { BuilderCoverImage } from '../components/builder/BuilderCoverImage';
import { BuilderLeadForm } from '../components/builder/BuilderLeadForm';
import { BuilderProjectMediaSections } from '../components/builder/BuilderProjectMediaSections';
import { BuilderUnitCard } from '../components/builder/BuilderUnitCard';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, gradients, radius, spacing } from '../theme';
import {
  formatBuilderPrice,
  formatPossessionDate,
  parseAmenities,
  RERA_VERIFY_URL,
} from '../utils/builderFormat';
import { splitBuilderMedia } from '../utils/builderMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderProjectDetails'>;

const UNITS_PREVIEW = 10;

function StatTile({
  icon,
  value,
  label,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  accent?: 'violet' | 'teal' | 'gold';
}) {
  const accentColors = {
    violet: { bg: colors.builderSoft, icon: colors.builder, border: colors.builderBorder },
    teal: { bg: '#ecfdf5', icon: '#0f766e', border: '#a7f3d0' },
    gold: { bg: '#fffbeb', icon: '#b45309', border: '#fde68a' },
  };
  const c = accentColors[accent ?? 'violet'];

  return (
    <View style={[styles.statTile, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={18} color={c.icon} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function BuilderProjectDetailsScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const [item, setItem] = useState<BuilderProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadUnit, setLeadUnit] = useState<BuilderUnit | null>(null);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [showAllUnits, setShowAllUnits] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const detail = await builderProjectsApi.getById(projectId);
      setItem(detail);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load project');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  const amenities = useMemo(
    () => parseAmenities(item?.amenities),
    [item?.amenities]
  );

  const projectMedia = useMemo(() => {
    if (!item?.media?.length) {
      return { gallery: [], floorPlans: [], videos: [] };
    }
    return splitBuilderMedia(item.media);
  }, [item?.media]);

  const availableUnits = useMemo(
    () =>
      item?.units.filter((u) => u.availabilityStatus.toLowerCase() === 'available') ?? [],
    [item?.units]
  );

  const visibleUnits = useMemo(() => {
    if (!item) return [];
    return showAllUnits ? item.units : item.units.slice(0, UNITS_PREVIEW);
  }, [item, showAllUnits]);

  const priceLabel =
    item && item.startingPrice != null && item.startingPrice > 0
      ? formatBuilderPrice(item.startingPrice)
      : '—';

  function openLead(unit?: BuilderUnit | null) {
    setLeadUnit(unit ?? null);
    setLeadOpen(true);
  }

  if (loading) {
    return (
      <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
        <BrandLoading message="Loading project…" />
      </AuthenticatedScreenLayout>
    );
  }

  if (error || !item) {
    return (
      <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
        <View style={styles.centered}>
          <Text style={styles.errTitle}>Could not load project</Text>
          <Text style={styles.err}>{error ?? 'Not found'}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </AuthenticatedScreenLayout>
    );
  }

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
      floatingBottomOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <BuilderCoverImage
            uri={item.coverImageUrl}
            projectName={item.projectName}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(49, 46, 129, 0.1)', 'rgba(15, 23, 42, 0.92)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroTop}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{item.projectStatus}</Text>
            </View>
            {item.reraNumber ? (
              <Pressable
                style={styles.reraPill}
                onPress={() => Linking.openURL(RERA_VERIFY_URL)}
              >
                <Ionicons name="shield-checkmark" size={12} color={colors.goldSoft} />
                <Text style={styles.reraPillText}>RERA</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>{item.projectName}</Text>
            <View style={styles.builderChip}>
              <Ionicons name="ribbon" size={14} color="#c4b5fd" />
              <Text style={styles.heroBuilder}>{item.builderName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <LinearGradient
            colors={[...gradients.builder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priceHighlight}
          >
            <View>
              <Text style={styles.priceHighlightLabel}>Starting from</Text>
              <Text style={styles.priceHighlightValue}>{priceLabel}</Text>
            </View>
            <View style={styles.priceHighlightMeta}>
              <Text style={styles.priceHighlightMetaNum}>{item.availableUnits ?? 0}</Text>
              <Text style={styles.priceHighlightMetaLabel}>units available</Text>
            </View>
          </LinearGradient>

          <View style={styles.addressCard}>
            <Ionicons name="location" size={18} color={colors.builder} />
            <Text style={styles.address}>{item.address}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatTile icon="business-outline" value={String(item.towerCount)} label="Towers" accent="violet" />
            <StatTile icon="grid-outline" value={String(item.totalUnits)} label="Total units" accent="teal" />
            <StatTile
              icon="home-outline"
              value={String(item.availableUnits ?? 0)}
              label="Available"
              accent="teal"
            />
            <StatTile icon="cash-outline" value={priceLabel} label="From" accent="gold" />
          </View>

          {(projectMedia.gallery.length > 0 ||
            projectMedia.floorPlans.length > 0 ||
            projectMedia.videos.length > 0) && (
            <BuilderProjectMediaSections
              gallery={projectMedia.gallery}
              floorPlans={projectMedia.floorPlans}
              videos={projectMedia.videos}
            />
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Project snapshot</Text>
            <InfoLine icon="map-outline" label="Area" value={item.areaName} />
            <InfoLine
              icon="calendar-outline"
              label="Possession"
              value={formatPossessionDate(item.possessionDate)}
            />
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
          </View>

          {amenities.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader icon="sparkles-outline" title="Amenities" />
              <View style={styles.amenityRow}>
                {amenities.map((a) => (
                  <View key={a} style={styles.amenityChip}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.builder} />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Pressable
              style={styles.collapsibleHead}
              onPress={() => setInventoryExpanded((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: inventoryExpanded }}
              accessibilityLabel={`Available inventory, ${availableUnits.length} of ${item.units.length} units open`}
            >
              <SectionHeader
                icon="layers-outline"
                title="Available inventory"
                sub={`${availableUnits.length} of ${item.units.length} units open`}
              />
              <Ionicons
                name={inventoryExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.builder}
                style={styles.collapsibleChevron}
              />
            </Pressable>
            {inventoryExpanded ? (
              <>
                {visibleUnits.map((unit) => (
                  <BuilderUnitCard
                    key={unit.id}
                    unit={unit}
                    onEnquire={() => openLead(unit)}
                  />
                ))}
                {item.units.length > UNITS_PREVIEW ? (
                  <Pressable
                    style={styles.showMoreBtn}
                    onPress={() => setShowAllUnits((v) => !v)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllUnits
                        ? 'Show fewer units'
                        : `Show all ${item.units.length} units`}
                    </Text>
                    <Ionicons
                      name={showAllUnits ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.builder}
                    />
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>

        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <Pressable style={styles.stickyPrimary} onPress={() => openLead(null)}>
          <LinearGradient
            colors={[...gradients.builder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stickyGradient}
          >
            <Ionicons name="chatbubbles" size={22} color={colors.heroText} />
            <View style={styles.stickyTextCol}>
              <Text style={styles.stickyText}>Contact builder</Text>
              <Text style={styles.stickySub}>Free enquiry · quick response</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.heroText} />
          </LinearGradient>
        </Pressable>
      </View>

      <BuilderLeadForm
        visible={leadOpen}
        projectId={item.id}
        projectName={item.projectName}
        unitId={leadUnit?.id}
        unitLabel={
          leadUnit
            ? `${leadUnit.configuration} · Tower ${leadUnit.towerName} · ${leadUnit.unitNumber}`
            : undefined
        }
        onClose={() => setLeadOpen(false)}
      />
    </AuthenticatedScreenLayout>
  );
}

function SectionHeader({
  icon,
  title,
  sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub?: string;
}) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={colors.builder} />
      </View>
      <View style={styles.sectionHeadText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={16} color={colors.slateLight} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  hero: {
    height: 280,
    backgroundColor: colors.navyDeep,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.heroText,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.heroText,
    textTransform: 'uppercase',
  },
  reraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  reraPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldSoft,
  },
  heroBottom: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  builderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(109, 40, 217, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBuilder: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.heroText,
  },
  body: {
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
  },
  priceHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  priceHighlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceHighlightValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.goldSoft,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  priceHighlightMeta: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  priceHighlightMetaNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
  },
  priceHighlightMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.75)',
    marginTop: 2,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: colors.slateMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statTile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  statLabel: {
    fontSize: 11,
    color: colors.slateLight,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    minWidth: 88,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateLight,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: colors.slateMuted,
    lineHeight: 21,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  collapsibleHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  collapsibleChevron: {
    marginTop: 10,
  },
  sectionHead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 0,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.builderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  sectionHeadText: {
    flex: 1,
    paddingTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: 2,
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.builderDark,
    textTransform: 'capitalize',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.builder,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyPrimary: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  stickyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  stickyTextCol: {
    flex: 1,
  },
  stickyText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.heroText,
  },
  stickySub: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.8)',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  err: {
    color: colors.error,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.builder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
});
