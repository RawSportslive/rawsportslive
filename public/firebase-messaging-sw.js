// firebase-messaging-sw.js
// RawSports Live — FCM Service Worker for background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ⚠️ Firebase config — keep in sync with lib/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyDPZyvJ_AfKaF2iJorxRnY9GRpSb41lDJ4",
  authDomain: "rawsportslive-4b556.firebaseapp.com",
  projectId: "rawsportslive-4b556",
  storageBucket: "rawsportslive-4b556.firebasestorage.app",
  messagingSenderId: "434982559115",
  appId: "1:434982559115:web:92d35c78aee4507bd9238e"
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
