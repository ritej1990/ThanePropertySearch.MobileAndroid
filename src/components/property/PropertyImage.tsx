import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { resolveImageUrl } from '../../utils/imageUrl';
import { colors, radius } from '../../theme';

const DEFAULT_ASPECT_RATIO = 4 / 3;

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Size container from image width/height after load (matches web detail gallery). */
  autoAspectRatio?: boolean;
  maxHeight?: number;
};

export function PropertyImage({
  uri,
  style,
  resizeMode = 'cover',
  autoAspectRatio,
  maxHeight = 480,
}: Props) {
  const resolved = resolveImageUrl(uri);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [layoutWidth, setLayoutWidth] = useState(0);

  useEffect(() => {
    setAspectRatio(DEFAULT_ASPECT_RATIO);
    setFailed(false);
    setLoading(true);
  }, [resolved]);

  const flatStyle = StyleSheet.flatten(style) ?? {};
  const { height: _ignoredHeight, ...styleWithoutHeight } = flatStyle;

  const autoSize = useMemo((): ViewStyle | null => {
    if (!autoAspectRatio) return null;
    if (layoutWidth <= 0) {
      return { width: '100%', aspectRatio, maxHeight };
    }
    const naturalHeight = layoutWidth / aspectRatio;
    const height = Math.min(naturalHeight, maxHeight);
    return { width: layoutWidth, height };
  }, [autoAspectRatio, layoutWidth, aspectRatio, maxHeight]);

  if (!resolved || failed) {
    return (
      <View
        style={[
          styles.placeholder,
          autoAspectRatio && layoutWidth > 0
            ? { width: layoutWidth, height: Math.min(layoutWidth / DEFAULT_ASPECT_RATIO, maxHeight) }
            : null,
          style,
        ]}
        onLayout={
          autoAspectRatio
            ? (e) => setLayoutWidth(e.nativeEvent.layout.width)
            : undefined
        }
      >
        <Text style={styles.placeholderText}>No photo</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        autoAspectRatio ? styleWithoutHeight : style,
        styles.frame,
        autoSize,
      ]}
      onLayout={
        autoAspectRatio
          ? (e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setLayoutWidth(w);
            }
          : undefined
      }
    >
      <Image
        source={{ uri: resolved }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoad={(e) => {
          const { width, height } = e.nativeEvent.source;
          if (width > 0 && height > 0) {
            setAspectRatio(width / height);
          }
          setLoading(false);
        }}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
      {loading && (
        <View style={styles.loader}>
          <ThaneFlatsLogo size={36} animated />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  placeholder: {
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  placeholderText: {
    color: colors.slateLight,
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.65)',
  },
});
