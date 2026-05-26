import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BuilderProjectMedia } from '../../api/builderTypes';
import { PropertyGallery } from '../property/PropertyGallery';
import { PropertyImage } from '../property/PropertyImage';
import { colors, radius, spacing } from '../../theme';
import { isLikelyImageUrl } from '../../utils/builderMedia';
import { getYouTubeThumbnailUrl, getYouTubeWatchUrl, isYouTubeUrl } from '../../utils/youtubeEmbed';

type Props = {
  gallery: BuilderProjectMedia[];
  floorPlans: BuilderProjectMedia[];
  videos: BuilderProjectMedia[];
};

const VIDEO_PREVIEW_HEIGHT = 200;

function SectionShell({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color={colors.builder} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FloorPlanTile({ plan }: { plan: BuilderProjectMedia }) {
  const label = plan.caption?.trim() || 'Floor plan';
  const showPreview = isLikelyImageUrl(plan.url);

  return (
    <View style={styles.floorPlanTile}>
      {showPreview ? (
        <Pressable onPress={() => Linking.openURL(plan.url)} accessibilityRole="link">
          <PropertyImage uri={plan.url} style={styles.floorPlanImage} resizeMode="contain" />
        </Pressable>
      ) : null}
      <Pressable
        style={styles.openBtn}
        onPress={() => Linking.openURL(plan.url)}
        accessibilityRole="link"
      >
        <Ionicons name="document-text-outline" size={16} color={colors.builder} />
        <Text style={styles.openBtnText}>{label}</Text>
        <Ionicons name="open-outline" size={14} color={colors.builder} />
      </Pressable>
    </View>
  );
}

function BuilderVideoCard({ video }: { video: BuilderProjectMedia }) {
  const watchUrl = getYouTubeWatchUrl(video.url) ?? video.url?.trim();
  const thumbnailUrl = getYouTubeThumbnailUrl(video.url);
  const label = video.caption?.trim() || 'Project video';
  const isYoutube = isYouTubeUrl(video.url);
  const pending =
    video.reviewStatus?.trim().toLowerCase() === 'pending';

  if (!watchUrl) {
    return null;
  }

  async function openVideo() {
    await Linking.openURL(watchUrl);
  }

  return (
    <Pressable
      style={styles.videoCard}
      onPress={openVideo}
      accessibilityRole="button"
      accessibilityLabel={`Play ${label}`}
    >
      <View style={styles.videoPreview}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.videoThumb} resizeMode="cover" />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={44} color="rgba(248, 250, 252, 0.9)" />
          </View>
        )}
        <View style={styles.playOverlay} pointerEvents="none">
          <View style={styles.playCircle}>
            <Ionicons name="play" size={30} color={colors.heroText} />
          </View>
          <Text style={styles.playLabel}>
            {isYoutube ? 'Play on YouTube' : 'Watch video'}
          </Text>
        </View>
        {pending ? (
          <View style={styles.pendingBadge} pointerEvents="none">
            <Text style={styles.pendingText}>Pending review</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.videoTitle}>{label}</Text>
      <View style={styles.videoActionRow}>
        <Ionicons name="logo-youtube" size={16} color="#dc2626" />
        <Text style={styles.videoActionText}>Tap to open video</Text>
      </View>
    </Pressable>
  );
}

export function BuilderProjectMediaSections({ gallery, floorPlans, videos }: Props) {
  const galleryUrls = gallery.map((m) => m.url).filter(Boolean);
  const hasGallery = galleryUrls.length > 0;
  const hasFloorPlans = floorPlans.length > 0;
  const hasVideos = videos.length > 0;

  if (!hasGallery && !hasFloorPlans && !hasVideos) {
    return null;
  }

  return (
    <>
      {hasGallery ? (
        <SectionShell icon="images-outline" title="Gallery">
          <PropertyGallery
            urls={galleryUrls}
            autoRotate={galleryUrls.length > 1}
            compact
            lazySlides
            showThumbnails={false}
          />
          {gallery.some((m) => m.caption?.trim()) ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.captionRow}
            >
              {gallery
                .filter((m) => m.caption?.trim())
                .map((m) => (
                  <Text key={m.id || m.url} style={styles.captionChip}>
                    {m.caption.trim()}
                  </Text>
                ))}
            </ScrollView>
          ) : null}
        </SectionShell>
      ) : null}

      {hasVideos ? (
        <SectionShell icon="videocam-outline" title="Videos">
          {videos.map((video) => (
            <BuilderVideoCard key={video.id || video.url} video={video} />
          ))}
        </SectionShell>
      ) : null}

      {hasFloorPlans ? (
        <SectionShell icon="map-outline" title="Floor plans">
          {floorPlans.map((plan) => (
            <FloorPlanTile key={plan.id || plan.url} plan={plan} />
          ))}
        </SectionShell>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    flex: 1,
  },
  captionRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  captionChip: {
    fontSize: 12,
    color: colors.slateLight,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  floorPlanTile: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  floorPlanImage: {
    width: '100%',
    minHeight: 160,
    maxHeight: 280,
    backgroundColor: colors.surfaceMuted,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
    marginBottom: spacing.sm,
  },
  openBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.builder,
    flex: 1,
  },
  videoCard: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: VIDEO_PREVIEW_HEIGHT,
    backgroundColor: colors.navyDeep,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    gap: spacing.sm,
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  playLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.heroText,
  },
  pendingBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78350f',
    textTransform: 'uppercase',
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  videoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 4,
  },
  videoActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateLight,
  },
});
