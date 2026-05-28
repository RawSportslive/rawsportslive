import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import {
  View,
  SafeAreaView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {
  Home,
  Trophy,
  Radio,
  Play,
  Newspaper,
  User,
} from 'lucide-react-native';

import { SportsDashboardScreen } from './screens/SportsDashboardScreen';
import { SchedulesScreen } from './screens/SchedulesScreen';
import { VideoFeedScreen } from './screens/VideoFeedScreen';
import { LiveScreen } from './screens/LiveScreen';
import { NewsScreen } from './screens/NewsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

// ── Theme ─────────────────────────────────────────────────────────────────────
const BRAND_RED   = '#E50914';
const BG_WHITE    = '#faf9f6';
const TAB_BG      = '#ffffff';
const INACTIVE    = '#9a9a9a';
const BORDER_CLR  = 'rgba(0,0,0,0.07)';

// ── React Query ───────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 2 * 60 * 1000 } },
});

// ── Notification handler ──────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Tab type ──────────────────────────────────────────────────────────────────
type TabKey = 'home' | 'sports' | 'live' | 'videos' | 'news' | 'profile';

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Pulsing live dot
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

  // Splash animations
  const splashScale   = useRef(new Animated.Value(0.88)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const loaderProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotOpacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(liveDotOpacity, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const registerPush = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    };
    registerPush();

    Animated.parallel([
      Animated.timing(splashScale,   { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(splashOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(loaderProgress, { toValue: 1, duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => setIsSplashVisible(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const loaderTranslateX = loaderProgress.interpolate({ inputRange: [0, 1], outputRange: [-180, 0] });

  // Screen renderer
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':    return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('sports')} />;
      case 'sports':  return <SchedulesScreen />;
      case 'live':    return <LiveScreen />;
      case 'videos':  return <VideoFeedScreen />;
      case 'news':    return <NewsScreen />;
      case 'profile': return <ProfileScreen />;
      default:        return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('sports')} />;
    }
  };

  // Tab config — matches web BottomNav exactly:
  // Home | Sports | Live | Videos | News | Profile
  const TAB_CONFIG: { key: TabKey; label: string; renderIcon: (active: boolean) => React.ReactNode }[] = [
    {
      key: 'home',
      label: 'Home',
      renderIcon: (active) => <Home color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} />,
    },
    {
      key: 'sports',
      label: 'Sports',
      renderIcon: (active) => <Trophy color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} />,
    },
    {
      key: 'live',
      label: 'Live',
      renderIcon: (active) => (
        <View style={{ position: 'relative' }}>
          <Radio color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} />
          <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
        </View>
      ),
    },
    {
      key: 'videos',
      label: 'Videos',
      renderIcon: (active) => <Play color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} fill={active ? BRAND_RED : 'transparent'} />,
    },
    {
      key: 'news',
      label: 'News',
      renderIcon: (active) => <Newspaper color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} />,
    },
    {
      key: 'profile',
      label: 'Profile',
      renderIcon: (active) => <User color={active ? BRAND_RED : INACTIVE} size={21} strokeWidth={active ? 2.5 : 2} />,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      {isSplashVisible ? (
        /* ── Splash Screen ─────────────────────────────────────────────────── */
        <View style={styles.splashContainer}>
          <Animated.View style={[styles.splashBrand, { opacity: splashOpacity, transform: [{ scale: splashScale }] }]}>
            {/* Logo mark */}
            <View style={styles.logoMark}>
              <View style={styles.logoMarkBar} />
              <View style={styles.logoMarkDot} />
            </View>

            {/* Brand name */}
            <Text style={styles.splashRaw}>RAW</Text>
            <Text style={styles.splashSports}>SPORTS</Text>
            <View style={styles.splashLiveBadge}>
              <Text style={styles.splashLiveText}>LIVE</Text>
            </View>

            {/* Tagline */}
            <Text style={styles.splashTagline}>OFFICIAL SPORTS STREAMING</Text>

            {/* Loader bar */}
            <View style={styles.loaderTrack}>
              <Animated.View style={[styles.loaderFill, { transform: [{ translateX: loaderTranslateX }] }]} />
            </View>
          </Animated.View>
        </View>
      ) : (
        /* ── Main App ──────────────────────────────────────────────────────── */
        <View style={{ flex: 1, backgroundColor: BG_WHITE }}>
          {Platform.OS === 'ios' && <SafeAreaView style={{ flex: 0, backgroundColor: BG_WHITE }} />}
          <SafeAreaView style={{ flex: 1, backgroundColor: BG_WHITE }}>
            {/* Active Screen */}
            <View style={{ flex: 1 }}>{renderActiveScreen()}</View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
              {TAB_CONFIG.map(({ key, label, renderIcon }) => {
                const active = activeTab === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.tabItem}
                    activeOpacity={0.75}
                    onPress={() => setActiveTab(key)}
                  >
                    {/* Active indicator line at top */}
                    {active && <View style={styles.activeIndicator} />}
                    {renderIcon(active)}
                    <Text style={[styles.tabLabel, active ? styles.activeLbl : styles.inactiveLbl]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      )}
      <StatusBar style="dark" backgroundColor={BG_WHITE} translucent={false} />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  /* ─── Splash ─────────────────────────────────────────────────────────────── */
  splashContainer: {
    flex: 1,
    backgroundColor: BG_WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashBrand: {
    alignItems: 'center',
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  logoMarkBar: {
    width: 28,
    height: 3,
    backgroundColor: BRAND_RED,
    borderRadius: 2,
  },
  logoMarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_RED,
  },
  splashRaw: {
    color: '#121212',
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    lineHeight: 52,
  },
  splashSports: {
    color: BRAND_RED,
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    lineHeight: 52,
    marginTop: -4,
  },
  splashLiveBadge: {
    backgroundColor: BRAND_RED,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
  },
  splashLiveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  splashTagline: {
    color: '#aaaaaa',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 16,
    marginBottom: 32,
  },
  loaderTrack: {
    width: 180,
    height: 2.5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 180,
    backgroundColor: BRAND_RED,
    borderRadius: 2,
  },

  /* ─── Tab Bar ────────────────────────────────────────────────────────────── */
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: TAB_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER_CLR,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  activeLbl: {
    color: BRAND_RED,
  },
  inactiveLbl: {
    color: INACTIVE,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2.5,
    backgroundColor: BRAND_RED,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  liveDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: BRAND_RED,
  },
});
