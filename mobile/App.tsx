import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { View, SafeAreaView, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Zap, Calendar as CalIcon, Film } from 'lucide-react-native';

import { SportsDashboardScreen } from './screens/SportsDashboardScreen';
import { SchedulesScreen } from './screens/SchedulesScreen';
import { VideoFeedScreen } from './screens/VideoFeedScreen';

const queryClient = new QueryClient();

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'schedules' | 'wrestling'>('home');
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Request permission for push notifications
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

    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('schedules')} />;
      case 'schedules':
        return <SchedulesScreen />;
      case 'wrestling':
        return <VideoFeedScreen />;
      default:
        return <SportsDashboardScreen onNavigateToSchedules={() => setActiveTab('schedules')} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {isSplashVisible ? (
        <View style={styles.splashContainer}>
          <Text style={styles.splashText}>
            RAW<Text style={styles.splashTextWhite}>SPORTS</Text> <Text style={styles.splashTextSmall}>LIVE</Text>
          </Text>
        </View>
      ) : (
      <View style={{ flex: 1, backgroundColor: '#050505' }}>
        {/* Bulletproof iOS status bar color filler */}
        {Platform.OS === 'ios' && (
          <SafeAreaView style={{ flex: 0, backgroundColor: '#050505' }} />
        )}
        
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
          {/* Main Active Screen */}
          <View style={{ flex: 1 }}>
            {renderActiveScreen()}
          </View>

          {/* Premium Bottom Navigation Tab Bar */}
          <View style={styles.tabBar}>
            {/* Home Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => setActiveTab('home')}
            >
              <Zap 
                color={activeTab === 'home' ? '#E50914' : '#888888'} 
                size={20} 
                fill={activeTab === 'home' ? '#E50914' : 'transparent'} 
              />
              <Text style={[styles.tabLabel, activeTab === 'home' ? styles.activeLabel : styles.inactiveLabel]}>
                SPORTS HUB
              </Text>
            </TouchableOpacity>

            {/* Schedules Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => setActiveTab('schedules')}
            >
              <CalIcon 
                color={activeTab === 'schedules' ? '#E50914' : '#888888'} 
                size={20} 
              />
              <Text style={[styles.tabLabel, activeTab === 'schedules' ? styles.activeLabel : styles.inactiveLabel]}>
                SCHEDULES
              </Text>
            </TouchableOpacity>

            {/* WWE Videos Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => setActiveTab('wrestling')}
            >
              <Film 
                color={activeTab === 'wrestling' ? '#E50914' : '#888888'} 
                size={20} 
                fill={activeTab === 'wrestling' ? '#E50914' : 'transparent'} 
              />
              <Text style={[styles.tabLabel, activeTab === 'wrestling' ? styles.activeLabel : styles.inactiveLabel]}>
                WWE PORTAL
              </Text>
            </TouchableOpacity>
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
    color: '#888888',
  },
});
