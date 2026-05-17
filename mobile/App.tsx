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
      // Get the token (can be saved to Firestore for backend push)
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      // console.log("Expo Push Token:", token);
    };

    registerForPushNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <VideoFeedScreen />
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
