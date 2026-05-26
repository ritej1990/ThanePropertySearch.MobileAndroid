import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PropertyImage } from './PropertyImage';
import { colors, radius, spacing } from '../../theme';

const ROTATE_INTERVAL_MS = 4500;
const PAUSE_AFTER_MANUAL_MS = 10000;
const GALLERY_ASPECT_WIDE = 16 / 10;
const GALLERY_ASPECT_DEFAULT = 4 / 3;

type Props = {
  urls: string[];
  /** Cycle through photos on the detail page (default true when 2+ images). */
  autoRotate?: boolean;
  /** Shorter gallery for property details (~28% screen). */
  compact?: boolean;
  /** Only mount nearby slides (faster on large galleries). */
  lazySlides?: boolean;
  /** Thumbnail strip under main image (off on compact detail for speed). */
  showThumbnails?: boolean;
  maxThumbnails?: number;
};

const SLIDE_RENDER_WINDOW = 1;
const DEFAULT_MAX_THUMBS = 8;

export function PropertyGallery({
  urls,
  autoRotate = true,
  compact = false,
  lazySlides = true,
  showThumbnails,
  maxThumbnails = DEFAULT_MAX_THUMBS,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [slideWidth, setSlideWidth] = useState(screenWidth);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pausedUntilRef = useRef(0);
  const activeIndexRef = useRef(0);
  const urlsKey = urls.join('|');

  const showThumbStrip = showThumbnails ?? !compact;
  const thumbUrls = showThumbStrip ? urls.slice(0, maxThumbnails) : [];

  const aspect = compact ? GALLERY_ASPECT_WIDE : GALLERY_ASPECT_DEFAULT;
  const maxMainHeight = compact
    ? Math.min(screenHeight * 0.28, 260)
    : Math.min(screenHeight * 0.4, 400);
  const mainHeight = Math.min(slideWidth / aspect, maxMainHeight);

  const syncIndexFromOffset = useCallback(
    (offsetX: number) => {
      if (slideWidth <= 0) return;
      const idx = Math.max(0, Math.min(urls.length - 1, Math.round(offsetX / slideWidth)));
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }
    },
    [slideWidth, urls.length]
  );

  const selectIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= urls.length) return;
      pausedUntilRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
      activeIndexRef.current = index;
      setActiveIndex(index);
      scrollRef.current?.scrollTo({ x: index * slideWidth, animated: true });
    },
    [slideWidth, urls.length]
  );

  useEffect(() => {
    setActiveIndex(0);
    activeIndexRef.current = 0;
    pausedUntilRef.current = 0;
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [urlsKey]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (!autoRotate || urls.length <= 1 || slideWidth <= 0) return;

    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      const next = (activeIndexRef.current + 1) % urls.length;
      activeIndexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [autoRotate, slideWidth, urls.length, urlsKey]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncIndexFromOffset(e.nativeEvent.contentOffset.x);
  };

  if (urls.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.mainWrap, { height: mainHeight || 220 }]}>
          <View style={[styles.mainPlaceholder, styles.placeholder]}>
            <Text style={styles.placeholderText}>No photos</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View
        style={styles.mainWrap}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== slideWidth) setSlideWidth(w);
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={urls.length > 1}
        >
          {urls.map((uri, index) => {
            const shouldRender =
              !lazySlides || Math.abs(index - activeIndex) <= SLIDE_RENDER_WINDOW;
            return (
              <View
                key={`${uri}-${index}`}
                style={{ width: slideWidth, height: mainHeight }}
              >
                {shouldRender ? (
                  <PropertyImage
                    uri={uri}
                    style={styles.mainSlide}
                    resizeMode="cover"
                    quietLoading
                  />
                ) : (
                  <View style={[styles.mainSlide, styles.slidePlaceholder]} />
                )}
              </View>
            );
          })}
        </ScrollView>

        {urls.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {activeIndex + 1} / {urls.length}
            </Text>
          </View>
        )}
      </View>

      {urls.length > 1 && (
        <>
          <View style={styles.dots}>
            {urls.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => selectIndex(index)}
                hitSlop={8}
                accessibilityLabel={`Photo ${index + 1} of ${urls.length}`}
              >
                <View
                  style={[styles.dot, index === activeIndex && styles.dotActive]}
                />
              </Pressable>
            ))}
          </View>
          {showThumbStrip && thumbUrls.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbs}
            >
              {thumbUrls.map((uri, index) => (
                <Pressable
                  key={`${uri}-${index}`}
                  onPress={() => selectIndex(index)}
                  style={[styles.thumbBtn, index === activeIndex && styles.thumbActive]}
                >
                  <PropertyImage uri={uri} style={styles.thumb} quietLoading />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  mainWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  mainSlide: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderLight,
  },
  slidePlaceholder: {
    backgroundColor: colors.borderLight,
  },
  mainPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderLight,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.slateLight,
    fontWeight: '600',
  },
  countBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  countText: {
    color: colors.heroText,
    fontSize: 12,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.teal,
  },
  thumbs: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  thumbBtn: {
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbActive: {
    borderColor: colors.teal,
  },
  thumb: {
    width: 76,
    height: 56,
    backgroundColor: colors.borderLight,
  },
});
