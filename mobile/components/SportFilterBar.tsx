import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { ALL_SPORT_KEYS, SPORT_LABELS, SPORT_COLORS, SPORT_ICONS, SportKey } from '../constants/liveChannels';

interface SportFilterBarProps {
  activeSport: SportKey;
  onSelect: (sport: SportKey) => void;
  liveCountBySport?: Partial<Record<SportKey, number>>;
}

const SportPill: React.FC<{
  sportKey: SportKey;
  active: boolean;
  liveCount?: number;
  onPress: () => void;
}> = ({ sportKey, active, liveCount, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const color = SPORT_COLORS[sportKey];
  const label = SPORT_LABELS[sportKey];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.pill,
          active && { backgroundColor: color, borderColor: color },
          !active && styles.pillInactive,
        ]}
      >
        <Text style={styles.pillIcon}>{SPORT_ICONS[sportKey]}</Text>
        <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
          {label.replace(/^.\s/, '')} {/* strip leading emoji from label text */}
        </Text>
        {liveCount !== undefined && liveCount > 0 && (
          <View style={[styles.liveCountBubble, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : color + '22' }]}>
            <Text style={[styles.liveCountText, { color: active ? '#fff' : color }]}>{liveCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SportFilterBar: React.FC<SportFilterBarProps> = ({
  activeSport,
  onSelect,
  liveCountBySport = {},
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_SPORT_KEYS.map((key) => (
          <SportPill
            key={key}
            sportKey={key}
            active={activeSport === key}
            liveCount={liveCountBySport[key]}
            onPress={() => onSelect(key)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#151515',
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  pillInactive: {
    backgroundColor: '#111111',
    borderColor: '#222222',
  },
  pillIcon: {
    fontSize: 13,
  },
  pillLabel: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pillLabelActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  liveCountBubble: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveCountText: {
    fontSize: 9,
    fontWeight: '900',
  },
});
