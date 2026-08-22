import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 136;
const STROKE_WIDTH = 5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BADGE_SIZE = 88;

/**
 * Full-screen animated intro shown for a few seconds on cold launch: the
 * amber ring draws itself once around the train badge, the wordmark fades
 * in underneath, then the whole thing fades out to reveal the app.
 *
 * Rendered as an absolute overlay on top of NetworkGate/RootNavigator
 * (see App.tsx) rather than gating their mount — that way data fetches
 * that already happen on first render (exchange rates, network status)
 * start immediately in the background instead of waiting behind the
 * animation.
 */
export const SplashIntro: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const ringProgress = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.7)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringProgress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        // strokeDashoffset isn't animatable on the native driver.
        useNativeDriver: false,
      }),
      Animated.delay(350),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: screenOpacity }]}>
      <Animated.View style={{ opacity: contentOpacity, alignItems: 'center' }}>
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.navy700}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.amber500}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
            <Ionicons name="train" size={40} color={colors.amber500} />
          </Animated.View>
        </View>
        <Text style={styles.brand}>EuroTrain</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.navy900,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...typography.h1,
    color: colors.white,
    marginTop: spacing.xl,
    letterSpacing: 0.3,
  },
});
