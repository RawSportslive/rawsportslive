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
import { Zap, Calendar as CalIcon, Film, Radio } from 'lucide-react-native';

import { SportsDashboardScreen } from './screens/SportsDashboardScreen';
import { SchedulesScreen } from './screens/SchedulesScreen';
import { VideoFeedScreen } from './screens/VideoFeedScreen';
import { LiveScreen } from './screens/LiveScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000,
    },
  },
});

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type TabKey = 'home' | 'live' | 'schedules' | 'wrestling';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Pulsing dot on LIVE tab
  const liveDotOpacity = useRef(new Animated.Value(1)).current;
  
  // Premium custom splash animations
  const splashScale = useRef(new Animated.Value(0.85)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const loaderProgress = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotOpacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(liveDotOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
    };
    registerForPushNotifications();

    // Start splash animation sequence
    Animated.parallel([
      Animated.timing(splashScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(loaderProgress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();

    const timer = setTimeout(() => setIsSplashVisible(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  const loaderTranslateX = loaderProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 0],
  });

  const rotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('schedules')} />;
      case 'live':
        return <LiveScreen />;
      case 'schedules':
        return <SchedulesScreen />;
      case 'wrestling':
        return <VideoFeedScreen />;
      default:
        return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('schedules')} />;
    }
  };

  const TAB_CONFIG: { key: TabKey; label: string; renderIcon: (active: boolean) => React.ReactNode }[] = [
    {
      key: 'home',
      label: 'SPORTS HUB',
      renderIcon: (active) => (
        <Zap color={active ? '#E50914' : '#555'} size={20} fill={active ? '#E50914' : 'transparent'} />
      ),
    },
    {
      key: 'live',
      label: 'LIVE',
      renderIcon: (active) => (
        <View style={{ position: 'relative' }}>
          <Radio color={active ? '#E50914' : '#555'} size={20} fill={active ? '#E50914' : 'transparent'} />
          {/* Pulsing red dot indicating live content available */}
          <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
        </View>
      ),
    },
    {
      key: 'schedules',
      label: 'SCHEDULES',
      renderIcon: (active) => <CalIcon color={active ? '#E50914' : '#555'} size={20} />,
    },
    {
      key: 'wrestling',
      label: 'WWE PORTAL',
      renderIcon: (active) => (
        <Film color={active ? '#E50914' : '#555'} size={20} fill={active ? '#E50914' : 'transparent'} />
      ),
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      {isSplashVisible ? (
        <View style={styles.splashContainer}>
          {/* Glowing stadium background rings */}
          <View style={styles.glowRingContainer}>
            <Animated.View style={[
              styles.glowRing, 
              { 
                transform: [{ rotate: rotationInterpolate }] 
              }
            ]} />
            <View style={styles.glowRingInner} />
          </View>

          <Animated.View style={[
            styles.splashBrandContainer,
            {
              opacity: splashOpacity,
              transform: [{ scale: splashScale }]
            }
          ]}>
            {/* Minimalist Human-Designed Badge Icon */}
            <View style={styles.logoBadge}>
              <View style={styles.logoBadgeLine} />
              <Zap color="#FFBF00" size={32} fill="#FFBF00" />
            </View>

            <Text style={styles.splashText}>
              RAW<Text style={styles.splashTextWhite}>SPORTS</Text>
            </Text>
            
            <View style={styles.taglineRow}>
              <View style={styles.taglineLine} />
              <Text style={styles.splashTagline}>LIVE STREAMING GATEWAY</Text>
              <View style={styles.taglineLine} />
            </View>

            {/* Premium Loader Bar */}
            <View style={styles.loaderContainer}>
              <View style={styles.loaderTrack}>
                <Animated.View style={[
                  styles.loaderProgress,
                  {
                    transform: [{ translateX: loaderTranslateX }]
                  }
                ]} />
              </View>
            </View>

            <Text style={styles.complianceText}>OFFICIAL PLAY STORE PRODUCTION BUILD</Text>
          </Animated.View>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: '#050505' }}>
          {Platform.OS === 'ios' && (
            <SafeAreaView style={{ flex: 0, backgroundColor: '#050505' }} />
          )}
          <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
            {/* Main Active Screen */}
            <View style={{ flex: 1 }}>{renderActiveScreen()}</View>

            {/* Bottom Navigation Tab Bar */}
            <View style={styles.tabBar}>
              {TAB_CONFIG.map(({ key, label, renderIcon }) => {
                const active = activeTab === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.tabItem}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(key)}
                  >
                    {renderIcon(active)}
                    <Text style={[styles.tabLabel, active ? styles.activeLabel : styles.inactiveLabel]}>
                      {label}
                    </Text>
                    {/* Active indicator bar */}
                    {active && <View style={styles.activeBar} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      )}
      <StatusBar style="light" backgroundColor="#050505" translucent={true} />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRingContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.15)',
    borderStyle: 'dashed',
  },
  glowRingInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 191, 0, 0.08)',
  },
  splashBrandContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  logoBadgeLine: {
    width: 24,
    height: 2,
    backgroundColor: '#FFBF00',
    borderRadius: 1,
  },
  splashText: {
    color: '#FFBF00',
    fontSize: 44,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  splashTextWhite: {
    color: '#ffffff',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  taglineLine: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  splashTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 3,
  },
  loaderContainer: {
    marginTop: 36,
    alignItems: 'center',
  },
  loaderTrack: {
    width: 180,
    height: 3,
    backgroundColor: '#151515',
    borderRadius: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  loaderProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 180,
    backgroundColor: '#E50914',
    borderRadius: 1.5,
  },
  complianceText: {
    color: '#333333',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 24,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#0c0c0c',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: '#E50914',
  },
  inactiveLabel: {
    color: '#555555',
  },
  liveDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E50914',
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#E50914',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
