import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

function ShimmerBlock({ style }: { style: object }) {
  return <View style={[styles.block, style]} />;
}

/** Card-shaped shimmer placeholder shown while the listing page does its first load. */
function PropertyListCardSkeletonBase() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.media} />
      <View style={styles.body}>
        <ShimmerBlock style={styles.titleLine} />
        <ShimmerBlock style={styles.titleLineShort} />
        <ShimmerBlock style={styles.locationLine} />
        <View style={styles.metaRow}>
          <ShimmerBlock style={styles.metaChip} />
          <ShimmerBlock style={styles.metaChip} />
          <ShimmerBlock style={styles.metaChipNarrow} />
        </View>
        <ShimmerBlock style={styles.ctaLine} />
      </View>
    </Animated.View>
  );
}

export const PropertyListCardSkeleton = React.memo(PropertyListCardSkeletonBase);

/** N stacked skeletons — drop-in replacement for the list while the first page loads. */
export function PropertyListSkeletonGroup({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyListCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  media: {
    height: 176,
    backgroundColor: colors.borderLight,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  block: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.sm,
  },
  titleLine: {
    height: 16,
    width: '85%',
  },
  titleLineShort: {
    height: 16,
    width: '55%',
  },
  locationLine: {
    height: 13,
    width: '60%',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaChip: {
    height: 22,
    width: 70,
    borderRadius: radius.pill,
  },
  metaChipNarrow: {
    height: 22,
    width: 48,
    borderRadius: radius.pill,
  },
  ctaLine: {
    height: 14,
    width: '40%',
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
});
