import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { headerExtraMotion, type AnimatedProgress } from '../../utils/scrollChromeMotion';

const EXPAND_MS = 280;
const COLLAPSE_MS = 240;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN = Easing.bezier(0.4, 0, 0.68, 0);

type Props = {
  /** When false, panel collapses (legacy boolean toggle only). */
  visible?: boolean;
  /** 1 = fully visible, 0 = hidden — scroll-linked; native-driver safe. */
  progress?: AnimatedProgress;
  /** Used for legacy boolean collapse height cap. */
  maxHeight?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Collapse toward top edge (email banner). */
  collapseFromTop?: boolean;
};

/** Reveal panel — scroll-linked fade/slide, or legacy boolean height collapse. */
export function ScrollRevealPanel({
  visible = true,
  progress,
  maxHeight = 320,
  children,
  style,
  collapseFromTop = false,
}: Props) {
  const internal = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const source = progress ?? internal;

  useEffect(() => {
    if (progress != null) return;
    Animated.timing(internal, {
      toValue: visible ? 1 : 0,
      duration: visible ? EXPAND_MS : COLLAPSE_MS,
      easing: visible ? EASE_OUT : EASE_IN,
      useNativeDriver: false,
    }).start();
  }, [internal, progress, visible]);

  if (progress != null) {
    const { opacity, translateY, scaleY } = headerExtraMotion(source);

    return (
      <Animated.View
        style={[
          collapseFromTop && styles.collapseFromTop,
          style,
          collapseFromTop
            ? {
                opacity,
                transform: [{ translateY }, { scaleY }],
              }
            : { opacity, transform: [{ translateY }] },
        ]}
        pointerEvents="box-none"
      >
        {children}
      </Animated.View>
    );
  }

  const panelHeight = source.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxHeight],
    extrapolate: 'clamp',
  });

  const contentOpacity = source.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const contentTranslateY = source.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.shell, style, { maxHeight: panelHeight }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
  },
  collapseFromTop: {
    overflow: 'hidden',
    transformOrigin: 'top',
  },
});
