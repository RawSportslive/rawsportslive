import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { View, SafeAreaView, Platform, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import Screens & Components
import { SportsDashboardScreen } from './screens/SportsDashboardScreen';
import { SchedulesScreen } from './screens/SchedulesScreen';
import { VideoFeedScreen } from './screens/VideoFeedScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SearchScreen } from './screens/SearchScreen';

// Import Context
import { SportsAppProvider, useSportsApp, AppTab } from './context/SportsAppContext';

// Import Icons
import { Compass, Calendar, PlayCircle, Star, Search as SearchIcon } from 'lucide-react-native';

const queryClient = new QueryClient();

// Configure notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// App Router Component that listens to SportsAppContext
function AppContent() {
  const { activeTab, setActiveTab } = useSportsApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <SportsDashboardScreen />;
      case 'schedules':
        return <SchedulesScreen />;
      case 'wrestling':
        return <VideoFeedScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'search':
        return <SearchScreen />;
      default:
        return <SportsDashboardScreen />;
    }
  };

  const getTabIcon = (tab: AppTab, isActive: boolean) => {
    const color = isActive ? '#ff0000' : '#88888b';
    const size = 22;

    switch (tab) {
      case 'home':
        return <Compass color={color} size={size} />;
      case 'schedules':
        return <Calendar color={color} size={size} />;
      case 'wrestling':
        return <PlayCircle color={color} size={size} />;
      case 'favorites':
        return <Star color={color} size={size} fill={isActive ? '#ff0000' : 'transparent'} />;
      case 'search':
        return <SearchIcon color={color} size={size} />;
    }
  };

  const getTabLabel = (tab: AppTab) => {
    switch (tab) {
      case 'home': return 'Live';
      case 'schedules': return 'Schedules';
      case 'wrestling': return 'Wrestling';
      case 'favorites': return 'Favorites';
      case 'search': return 'Search';
    }
  };

  const tabs: AppTab[] = ['home', 'schedules', 'wrestling', 'favorites', 'search'];

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      {/* Bulletproof iOS status bar color filler */}
      {Platform.OS === 'ios' && (
        <SafeAreaView style={{ flex: 0, backgroundColor: '#ff0000' }} />
      )}
      
      {/* Active Screen Area */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
        {renderActiveScreen()}
      </SafeAreaView>

      {/* Modern High-End Glassmorphic Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                {getTabIcon(tab, isActive)}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SportsAppProvider>
        <AppContent />
      </SportsAppProvider>
      <StatusBar style="light" backgroundColor="#ff0000" translucent={false} />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 78 : 64,
    backgroundColor: '#0c0c0e',
    borderTopWidth: 1,
    borderTopColor: '#1f1f22',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
  },
  iconWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#88888b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: '#ff0000',
    fontWeight: '900',
  },
});
