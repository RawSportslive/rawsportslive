import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
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

import { View, SafeAreaView, Platform } from 'react-native';

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
      <View style={{ flex: 1, backgroundColor: '#050505' }}>
        {/* iOS status bar background filler */}
        {Platform.OS === 'ios' && (
          <View style={{ height: 47, backgroundColor: '#ff0000', width: '100%' }} />
        )}
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
          <VideoFeedScreen />
        </SafeAreaView>
      </View>
      <StatusBar style="light" backgroundColor="#ff0000" translucent={false} />
    </QueryClientProvider>
  );
}
