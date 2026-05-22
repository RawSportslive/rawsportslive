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

    const timer = setTimeout(() => setIsSplashVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

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
          <Text style={styles.splashText}>
            RAW<Text style={styles.splashTextWhite}>SPORTS</Text>{' '}
            <Text style={styles.splashTextSmall}>LIVE</Text>
          </Text>
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
  splashText: {
    color: '#FFBF00',
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  splashTextWhite: {
    color: '#ffffff',
  },
  splashTextSmall: {
    color: '#E50914',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'normal',
    lineHeight: 20,
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
