import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LiveBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  label?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  size = 'md',
  showDot = true,
  label = 'LIVE',
}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulsating glow on the badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Blinking dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sizeStyles = {
    sm: { px: 5, py: 2, fontSize: 8, dotSize: 5 },
    md: { px: 8, py: 3, fontSize: 10, dotSize: 6 },
    lg: { px: 12, py: 5, fontSize: 13, dotSize: 8 },
  }[size];

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeStyles.px,
          paddingVertical: sizeStyles.py,
          transform: [{ scale: pulse }],
        },
      ]}
    >
      {showDot && (
        <Animated.View
          style={[
            styles.dot,
            { width: sizeStyles.dotSize, height: sizeStyles.dotSize, borderRadius: sizeStyles.dotSize / 2, opacity: dotOpacity },
          ]}
        />
      )}
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>{label}</Text>
    </Animated.View>
  );
};

// ─── Upcoming badge (no animation, just a countdown style) ───────────────────
export const UpcomingBadge: React.FC<{ label?: string }> = ({ label = 'SOON' }) => (
  <View style={styles.upcomingBadge}>
    <Text style={styles.upcomingText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    borderRadius: 5,
    gap: 4,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  dot: {
    backgroundColor: '#fff',
  },
  text: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#7B2FBE',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  upcomingText: {
    color: '#C77DFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
