import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { KenBurnsImage } from './KenBurnsImage';
import { colors } from '../../theme';

type Props = {
  urls: string[];
  height: number;
};

/** Slightly longer than KenBurnsImage's pan/zoom duration, so the shift lands once that settles. */
const AUTO_ADVANCE_MS = 5500;

function hashSeed(value: string | null | undefined): number {
  if (!value) return 0;
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * Swipeable photo preview for a list card — paged ScrollView + dot indicators.
 * Falls back to a single static image when there's nothing to swipe, so it never
 * adds overhead for the common single-photo case.
 */
export function PropertyCardGallery({ urls, height }: Props) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (urls.length <= 1 || width <= 0) return;
    timerRef.current = setTimeout(() => {
      const next = (index + 1) % urls.length;
      scrollRef.current?.scrollTo({ x: next * width, y: 0, animated: true });
      setIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, urls.length, width]);

  if (urls.length <= 1) {
    return <KenBurnsImage uri={urls[0] ?? null} style={[styles.image, { height }]} variant={hashSeed(urls[0])} />;
  }

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (width <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(urls.length - 1, next)));
  }

  return (
    <View
      style={styles.frame}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        onScrollBeginDrag={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
        }}
        scrollEventThrottle={32}
      >
        {urls.map((url, i) => (
          <View key={`${url}-${i}`} style={{ width: width || undefined, height, overflow: 'hidden' }}>
            <KenBurnsImage
              uri={url}
              style={styles.page}
              variant={i}
              quietLoading
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow} pointerEvents="none">
        {urls.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
  },
  frame: {
    width: '100%',
  },
  page: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    width: 14,
    backgroundColor: colors.heroText,
  },
});
