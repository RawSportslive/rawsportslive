// firebase-messaging-sw.js
// RawSports Live — FCM Service Worker for background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ⚠️ Firebase config — keep in sync with lib/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyBwNbegQIrZicq7_GItryuyESSQdle7fM4",
  authDomain: "sportsview-75296.firebaseapp.com",
  projectId: "sportsview-75296",
  storageBucket: "sportsview-75296.firebasestorage.app",
  messagingSenderId: "100551356578",
  appId: "1:100551356578:web:b6154ea790a1bc88af67fb"
});

const messaging = firebase.messaging();

// Handle background messages (when app is NOT in foreground)
messaging.onBackgroundMessage((payload) => {
  console.log('[RawSports SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'RawSports LIVE';
  const notificationOptions = {
    body: payload.notification?.body || 'New update available',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.tag || 'rawsports-notification',
    data: payload.data,
    actions: [
      { action: 'open', title: 'View Now' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
