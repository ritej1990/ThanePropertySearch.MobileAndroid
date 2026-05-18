import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme';

/** Decorative layers only — must not capture touches (keyboard-safe). */
export function LoginBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...gradients.page]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.navyDeep, '#1a4d6e', '#0e7490', 'transparent']}
        locations={[0, 0.45, 0.75, 1]}
        style={styles.heroBand}
      />
      <View style={styles.goldOrb} />
      <View style={styles.blueOrb} />
      <View style={styles.warmWash} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  goldOrb: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201, 162, 39, 0.22)',
  },
  blueOrb: {
    position: 'absolute',
    top: 120,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
  },
  warmWash: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(250, 248, 245, 0.65)',
  },
});
