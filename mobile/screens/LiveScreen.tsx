import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  Radio,
  Search,
  X,
  RefreshCw,
  ChevronRight,
  Tv,
  Clock,
  TrendingUp,
  Zap,
  ShieldCheck,
} from 'lucide-react-native';

import { LiveBadge, UpcomingBadge } from '../components/LiveBadge';
import { LiveStreamCard } from '../components/LiveStreamCard';
import { SportFilterBar } from '../components/SportFilterBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useLiveHub } from '../hooks/useLiveStreams';
import { LiveStream } from '../services/liveVideoService';
import { SPORT_COLORS, SportKey } from '../constants/liveChannels';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  count?: number;
  color?: string;
  onSeeAll?: () => void;
}> = ({ icon, title, count, color = '#E50914', onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBubble, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.countBubbleText, { color }]}>{count}</Text>
        </View>
      )}
    </View>
    {onSeeAll && (
      <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={styles.seeAllText}>SEE ALL</Text>
        <ChevronRight color="#555" size={12} />
      </TouchableOpacity>
    )}
  </View>
);

const EmptyState: React.FC<{ icon: string; title: string; sub: string }> = ({ icon, title, sub }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{sub}</Text>
  </View>
);

const ComplianceBanner = () => (
  <View style={styles.complianceBanner}>
    <ShieldCheck color="#00C853" size={14} />
    <Text style={styles.complianceText}>
      All streams are embedded from official YouTube channels only. RawSports Live does not host or restream any content.
    </Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Player Modal
// ─────────────────────────────────────────────────────────────────────────────

interface PlayerModalProps {
  stream: LiveStream | null;
  onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ stream, onClose }) => {
  const [useWebView, setUseWebView] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const sportColor = stream ? (SPORT_COLORS[stream.sport as SportKey] ?? '#E50914') : '#E50914';

  useEffect(() => {
    setUseWebView(false); // Reset on each new video
    
    // Unlock to support both orientations while watching, lock to portrait up on close
    const setupOrientation = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (e) {}
    };
    setupOrientation();

    return () => {
      // When player closes, return phone orientation to standard portrait
      const lockPortrait = async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } catch (e) {}
      };
      lockPortrait();
    };
  }, [stream]);

  if (!stream) return null;

  const playerWidth = windowWidth;
  const playerHeight = isLandscape ? windowHeight : windowWidth * 0.5625;

  return (
    <Modal
      visible={!!stream}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Dynamic status bar visibility based on orientation */}
        <StatusBar hidden={isLandscape} barStyle="light-content" backgroundColor="#000000" translucent={true} />

        {/* Player Area takes full screen in Landscape with 0 margin */}
        <View style={[
          styles.playerArea, 
          isLandscape ? { marginTop: 0, width: windowWidth, height: windowHeight } : { marginTop: Platform.OS === 'ios' ? 90 : 72 }
        ]}>
          {useWebView ? (
            <WebView
              style={{ width: playerWidth, height: playerHeight, backgroundColor: '#000000' }}
              source={{ uri: `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&fs=1` }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['https://*.youtube.com', 'https://*.youtube-nocookie.com']}
              onShouldStartLoadWithRequest={(request) => {
                return request.url.includes('/embed/') || request.url.includes('youtube.com/generate_204') || request.url.includes('youtube-nocookie.com');
              }}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#E50914" />
                </View>
              )}
            />
          ) : (
            <YoutubePlayer
              height={playerHeight}
              width={playerWidth}
              play
              videoId={stream.videoId}
              onError={() => setUseWebView(true)}
              onChangeState={(s: string) => { if (s === 'ended') onClose(); }}
              onFullScreenChange={(status: boolean) => {
                const handleFullscreenLock = async () => {
                  try {
                    if (status) {
                      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    } else {
                      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                    }
                  } catch (e) {
                    console.log("YoutubePlayer fullscreen orientation lock error:", e);
                  }
                };
                handleFullscreenLock();
              }}
            />
          )}

          {/* Floating close button in Landscape mode */}
          {isLandscape && (
            <TouchableOpacity 
              style={[
                styles.closeBtn, 
                { 
                  position: 'absolute', 
                  top: 20, 
                  right: 20, 
                  borderColor: sportColor, 
                  backgroundColor: 'rgba(0,0,0,0.6)', 
                  zIndex: 99999 
                }
              ]} 
              onPress={onClose} 
              activeOpacity={0.85}
            >
              <X color="#fff" size={14} />
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Video Info and standard close button shown only in Portrait mode */}
        {!isLandscape && (
          <>
            <TouchableOpacity style={[styles.closeBtn, { borderColor: sportColor }]} onPress={onClose} activeOpacity={0.85}>
              <X color="#fff" size={14} />
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>

            <ScrollView style={styles.videoInfoScroll} showsVerticalScrollIndicator={false}>
              {/* Status badge */}
              <View style={styles.videoStatusRow}>
                {stream.status === 'live' ? <LiveBadge size="md" /> : <UpcomingBadge />}
                <View style={[styles.sportChipModal, { borderColor: sportColor }]}>
                  <Text style={[styles.sportChipModalText, { color: sportColor }]}>
                    {stream.sport.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.videoTitle}>{stream.title}</Text>

              {/* Channel + attribution */}
              <View style={styles.channelRow}>
                <View style={[styles.channelDot, { backgroundColor: sportColor }]} />
                <Text style={[styles.channelNameModal, { color: sportColor }]}>{stream.channelName}</Text>
              </View>

              {/* Play Store compliance – source attribution */}
              <View style={styles.attributionBox}>
                <ShieldCheck color="#00C853" size={12} />
                <Text style={styles.attributionText}>{stream.sourceLabel}</Text>
              </View>

              {stream.description.length > 0 && (
                <Text style={styles.videoDesc} numberOfLines={6}>{stream.description}</Text>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main LiveScreen
// ─────────────────────────────────────────────────────────────────────────────

export const LiveScreen: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [showAllLive, setShowAllLive] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const { liveStreams, upcomingStreams, trending, isLoading, isRefetching, refetchAll, totalLive } =
    useLiveHub(activeSport);

  // Compute live count per sport for filter bar badges
  const liveCountBySport: Partial<Record<SportKey, number>> = {};
  liveStreams.forEach((s) => {
    const sk = s.sport as SportKey;
    liveCountBySport[sk] = (liveCountBySport[sk] ?? 0) + 1;
  });

  // Search filter (client-side)
  const filtered = useCallback(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { live: liveStreams, upcoming: upcomingStreams };
    const filter = (s: LiveStream) =>
      s.title.toLowerCase().includes(q) ||
      s.channelName.toLowerCase().includes(q) ||
      s.sport.toLowerCase().includes(q);
    return { live: liveStreams.filter(filter), upcoming: upcomingStreams.filter(filter) };
  }, [searchQuery, liveStreams, upcomingStreams]);

  const { live: filteredLive, upcoming: filteredUpcoming } = filtered();

  const displayLive = showAllLive ? filteredLive : filteredLive.slice(0, 4);
  const displayUpcoming = showAllUpcoming ? filteredUpcoming : filteredUpcoming.slice(0, 5);

  // Ticker animation for "LIVE NOW" count in header
  const tickerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (totalLive > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tickerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(tickerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [totalLive]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <Search color="#555" size={16} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search live matches, channels..."
          placeholderTextColor="#444"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color="#555" size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFeaturedCarousel = () => {
    if (trending.length === 0 || searchQuery) return null;
    return (
      <View style={styles.section}>
        <SectionHeader
          icon={<TrendingUp color="#FF6B00" size={16} />}
          title="TRENDING LIVE"
          count={trending.length}
          color="#FF6B00"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          decelerationRate="fast"
          snapToInterval={width * 0.82 + 14}
        >
          {trending.slice(0, 6).map((s) => (
            <LiveStreamCard key={s.videoId} stream={s} onPress={setSelectedStream} variant="featured" />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLiveNow = () => (
    <View style={styles.section}>
      <SectionHeader
        icon={<Radio color="#E50914" size={16} fill="#E50914" />}
        title="LIVE NOW"
        count={filteredLive.length}
        color="#E50914"
        onSeeAll={filteredLive.length > 4 ? () => setShowAllLive((v) => !v) : undefined}
      />
      {filteredLive.length === 0 ? (
        <EmptyState
          icon="📡"
          title="No Live Streams Right Now"
          sub="All official channels are offline. Check back soon or browse upcoming events below."
        />
      ) : (
        displayLive.map((s) => (
          <LiveStreamCard key={s.videoId} stream={s} onPress={setSelectedStream} variant="full" />
        ))
      )}
      {filteredLive.length > 4 && (
        <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllLive((v) => !v)}>
          <Text style={styles.showMoreText}>{showAllLive ? 'SHOW LESS' : `SHOW ALL ${filteredLive.length} STREAMS`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUpcoming = () => {
    if (filteredUpcoming.length === 0) return null;
    return (
      <View style={styles.section}>
        <SectionHeader
          icon={<Clock color="#C77DFF" size={16} />}
          title="UPCOMING STREAMS"
          count={filteredUpcoming.length}
          color="#C77DFF"
          onSeeAll={filteredUpcoming.length > 5 ? () => setShowAllUpcoming((v) => !v) : undefined}
        />
        {displayUpcoming.map((s) => (
          <LiveStreamCard key={s.videoId} stream={s} onPress={setSelectedStream} variant="compact" />
        ))}
        {filteredUpcoming.length > 5 && (
          <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllUpcoming((v) => !v)}>
            <Text style={styles.showMoreText}>{showAllUpcoming ? 'SHOW LESS' : `SHOW ALL ${filteredUpcoming.length} UPCOMING`}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchAll}
            tintColor="#E50914"
            colors={['#E50914']}
          />
        }
      >
        {renderFeaturedCarousel()}
        {renderLiveNow()}
        {renderUpcoming()}
        <ComplianceBanner />
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>
              RAWSPORTS <Text style={{ color: '#E50914' }}>LIVE</Text>
            </Text>
            {totalLive > 0 && (
              <Animated.View style={{ opacity: tickerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }}>
                <LiveBadge size="sm" label={`${totalLive} LIVE`} />
              </Animated.View>
            )}
          </View>
          <Text style={styles.headerSub}>OFFICIAL STREAMS ONLY</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={refetchAll}
          activeOpacity={0.75}
          disabled={isRefetching}
        >
          {isRefetching
            ? <ActivityIndicator color="#fff" size="small" />
            : <RefreshCw color="#fff" size={15} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {renderSearchBar()}

      {/* ── Sport Filter ────────────────────────────────────────────────────── */}
      <SportFilterBar
        activeSport={activeSport}
        onSelect={(s) => { setActiveSport(s); setShowAllLive(false); setShowAllUpcoming(false); }}
        liveCountBySport={liveCountBySport}
      />

      {/* ── Main content ───────────────────────────────────────────────────── */}
      {renderContent()}

      {/* ── Player Modal ───────────────────────────────────────────────────── */}
      <PlayerModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 36,
    paddingBottom: 14,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
  headerSub: {
    color: '#555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },

  // Search
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  countBubble: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBubbleText: {
    fontSize: 9,
    fontWeight: '900',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Featured carousel
  featuredScroll: {
    paddingLeft: 0,
    paddingRight: 16,
    paddingBottom: 4,
  },

  // Show more
  showMoreBtn: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  showMoreText: {
    color: '#555',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  // Loading
  loadingContainer: { padding: 16 },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptySub: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '80%',
  },

  // Compliance banner
  complianceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    backgroundColor: '#00C85308',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00C85320',
    gap: 10,
  },
  complianceText: {
    flex: 1,
    color: '#555',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    fontStyle: 'italic',
  },

  // Player modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerArea: {
    marginTop: Platform.OS === 'ios' ? 90 : 72,
    backgroundColor: '#000',
  },
  videoInfoScroll: {
    flex: 1,
    padding: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  videoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sportChipModal: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sportChipModalText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelNameModal: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  attributionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#00C85308',
    borderWidth: 1,
    borderColor: '#00C85320',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  attributionText: {
    flex: 1,
    color: '#00C853',
    fontSize: 10,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  videoDesc: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
});
