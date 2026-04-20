import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function TabScreenBackground() {
  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <LinearGradient
        colors={['#F9FBFF', '#F3F8FF', '#EEF4FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.base}
      />
      <LinearGradient
        colors={['rgba(45,103,255,0.10)', 'rgba(50,141,255,0.02)', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 0.85 }}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={['rgba(42,146,184,0.12)', 'rgba(42,146,184,0.03)', 'transparent']}
        start={{ x: 0.8, y: 0.1 }}
        end={{ x: 0.2, y: 0.95 }}
        style={styles.bottomGlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: -40,
    left: -30,
    right: 60,
    height: 260,
    borderRadius: 260,
  },
  bottomGlow: {
    position: 'absolute',
    right: -40,
    bottom: 80,
    width: 240,
    height: 240,
    borderRadius: 240,
  },
});
