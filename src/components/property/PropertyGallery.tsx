import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PropertyImage } from './PropertyImage';
import { colors, radius, spacing } from '../../theme';

type Props = {
  urls: string[];
};

export function PropertyGallery({ urls }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const maxMainHeight = Math.min(screenHeight * 0.52, 480);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = urls[activeIndex];

  return (
    <View style={styles.wrap}>
      <View style={styles.mainWrap}>
        {activeUrl ? (
          <PropertyImage
            uri={activeUrl}
            style={styles.main}
            autoAspectRatio
            maxHeight={maxMainHeight}
          />
        ) : (
          <View style={[styles.mainPlaceholder, styles.placeholder]}>
            <Text style={styles.placeholderText}>No photos</Text>
          </View>
        )}
        {urls.length > 0 && (
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
              <View
                key={index}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbs}
          >
            {urls.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => setActiveIndex(index)}
                style={[styles.thumbBtn, index === activeIndex && styles.thumbActive]}
              >
                <PropertyImage uri={uri} style={styles.thumb} />
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  mainWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  main: {
    width: '100%',
    backgroundColor: colors.borderLight,
  },
  mainPlaceholder: {
    width: '100%',
    height: 220,
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
    backgroundColor: '#0d9488',
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
    borderColor: '#0d9488',
  },
  thumb: {
    width: 76,
    height: 56,
    backgroundColor: colors.borderLight,
  },
});
