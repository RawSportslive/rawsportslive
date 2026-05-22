import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Play, Eye, Radio } from 'lucide-react-native';
import { LiveBadge, UpcomingBadge } from './LiveBadge';
import { CountdownTimer } from './CountdownTimer';
import { LiveStream } from '../services/liveVideoService';
import { SPORT_COLORS, SportKey } from '../constants/liveChannels';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface LiveStreamCardProps {
  stream: LiveStream;
  onPress: (stream: LiveStream) => void;
  variant?: 'full' | 'compact' | 'featured';
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({
  stream,
  onPress,
  variant = 'full',
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const sportColor = SPORT_COLORS[stream.sport as SportKey] ?? '#E50914';
  const isLive = stream.status === 'live';
  const isUpcoming = stream.status === 'upcoming';

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  if (variant === 'compact') {
    return (
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.compactCard}
          activeOpacity={1}
          onPress={() => onPress(stream)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.compactThumbWrapper}>
            <Image source={{ uri: stream.thumbnail }} style={styles.compactThumb} />
            {isLive && (
              <View style={styles.compactPlayIcon}>
                <Radio color="#fff" size={12} fill="#fff" />
              </View>
            )}
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={2}>{stream.title}</Text>
            <Text style={[styles.compactChannel, { color: sportColor }]}>{stream.channelName}</Text>
            {isLive && <LiveBadge size="sm" />}
            {isUpcoming && stream.scheduledStartTime && (
              <CountdownTimer targetIso={stream.scheduledStartTime} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'featured') {
    return (
      <Animated.View style={[styles.featuredCard, { transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPress(stream)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Image source={{ uri: stream.thumbnail }} style={styles.featuredImage} />
          {/* Gradient overlay */}
          <View style={styles.featuredOverlay} />
          {/* Top row */}
          <View style={styles.featuredTopRow}>
            {isLive ? <LiveBadge size="md" /> : <UpcomingBadge />}
            <View style={[styles.sportChip, { backgroundColor: sportColor + '22', borderColor: sportColor }]}>
              <Text style={[styles.sportChipText, { color: sportColor }]}>
                {stream.sport.toUpperCase()}
              </Text>
            </View>
          </View>
          {/* Bottom info */}
          <View style={styles.featuredBottom}>
            <Text style={styles.featuredTitle} numberOfLines={2}>{stream.title}</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredChannel}>{stream.channelName}</Text>
              {stream.viewerCount && (
                <View style={styles.viewerRow}>
                  <Eye color="#aaa" size={11} />
                  <Text style={styles.viewerCount}>
                    {stream.viewerCount.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            {isUpcoming && stream.scheduledStartTime && (
              <CountdownTimer targetIso={stream.scheduledStartTime} />
            )}
          </View>
          {/* Big play button center */}
          <View style={styles.featuredPlayBtn}>
            <Play color="#fff" size={22} fill="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Default: full card
  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.fullCard]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(stream)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrapper}>
          <Image source={{ uri: stream.thumbnail }} style={styles.thumbnail} />
          <View style={styles.thumbOverlay} />
          {/* Sport accent bar */}
          <View style={[styles.sportBar, { backgroundColor: sportColor }]} />
          {/* Status badge */}
          <View style={styles.badgePosition}>
            {isLive ? <LiveBadge size="md" /> : <UpcomingBadge />}
          </View>
          {/* Play button */}
          {isLive && (
            <View style={styles.playCircle}>
              <Radio color="#fff" size={18} fill="#fff" />
            </View>
          )}
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          {/* Sport color dot */}
          <View style={[styles.sportDot, { backgroundColor: sportColor }]} />
          <View style={styles.infoText}>
            <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.channelName, { color: sportColor }]}>{stream.channelName}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.sportLabel}>{stream.sport.toUpperCase()}</Text>
            </View>
            {/* Countdown for upcoming */}
            {isUpcoming && stream.scheduledStartTime && (
              <View style={{ marginTop: 6 }}>
                <CountdownTimer targetIso={stream.scheduledStartTime} />
              </View>
            )}
            {/* Source attribution – Play Store compliance */}
            <Text style={styles.sourceLabel} numberOfLines={1}>{stream.sourceLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Full card ───────────────────────────────────────────────────────────────
  fullCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  thumbWrapper: {
    width: '100%',
    height: CARD_WIDTH * 0.5625,
    position: 'relative',
    backgroundColor: '#111',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  sportBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  badgePosition: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  playCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  sportDot: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    minHeight: 40,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  streamTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metaDot: {
    color: '#333',
    fontSize: 10,
  },
  sportLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sourceLabel: {
    color: '#333',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // ── Compact card ─────────────────────────────────────────────────────────────
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 10,
    gap: 12,
  },
  compactThumbWrapper: {
    width: 110,
    height: 66,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
  },
  compactThumb: {
    width: '100%',
    height: '100%',
  },
  compactPlayIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
  },
  compactTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  compactChannel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // ── Featured card ─────────────────────────────────────────────────────────────
  featuredCard: {
    width: width * 0.82,
    height: width * 0.52,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  featuredTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportChip: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sportChipText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  featuredChannel: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: '700',
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerCount: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '600',
  },
  featuredPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -22,
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(229,9,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
});
