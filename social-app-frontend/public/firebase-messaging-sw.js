importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDN-9qCVmtN5sVLssHq0QYPyTa67kvrDyo",
  authDomain: "sonet-app-ce04b.firebaseapp.com",
  projectId: "sonet-app-ce04b",
  storageBucket: "sonet-app-ce04b.firebasestorage.app",
  messagingSenderId: "132087514187",
  appId: "1:132087514187:web:a3c77c2f75138de3af39ce",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo_sonet.png",
    badge: "/logo_sonet.png",
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: "notification",
    requireInteraction: true,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const clickAction = event.notification.data?.click_action;
  if (clickAction) {
    clients.openWindow(clickAction);
  } else {
    clients.openWindow("/");
  }
});
