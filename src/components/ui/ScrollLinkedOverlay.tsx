import React from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

type AnimatedProgress = Animated.Value | Animated.AnimatedInterpolation<number>;

type OverlayProps = {
  /** 1 = expanded, 0 = collapsed — native-driver safe (opacity + translateY only). */
  chromeVisible: AnimatedProgress;
  toolbarHeight: number;
  onHeightChange: (height: number) => void;
  children: React.ReactNode;
};

/** Fixed slot in a list header — keeps scroll offset stable while toolbar overlays. */
export function ScrollToolbarSpacer({ height }: { height: number }) {
  if (height <= 0) return null;
  return <View style={{ height }} />;
}

/** Scroll-linked toolbar body — overlays list content; no layout properties animated. */
export function ScrollLinkedOverlay({
  chromeVisible,
  toolbarHeight,
  onHeightChange,
  children,
}: OverlayProps) {
  const opacity = chromeVisible.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const translateY = chromeVisible.interpolate({
    inputRange: [0, 1],
    outputRange: [-(toolbarHeight || 240), 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.overlay, { opacity, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - toolbarHeight) > 2) {
            onHeightChange(h);
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

export const scrollLinkedHostStyle = StyleSheet.create({
  host: {
    flex: 1,
    position: 'relative',
  },
}).host;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
