import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

// use .env 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get registration
let messagingInstance: Messaging | null = null;

const initializeMessaging = async (): Promise<Messaging> => {
  try {
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (error) {
    console.error("Error initializing messaging:", error);
    throw error;
  }
};

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    // Kiểm tra xem trình duyệt có hỗ trợ notifications không
    if (!("Notification" in window)) {
      throw new Error("Trình duyệt này không hỗ trợ thông báo đẩy");
    }

    // Kiểm tra service worker registration
    if (!("serviceWorker" in navigator)) {
      throw new Error("Trình duyệt này không hỗ trợ Service Worker");
    }

    // Yêu cầu quyền thông báo trước
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Quyền thông báo bị từ chối");
    }

    // Đăng ký service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
      }
    );

    // Đợi service worker active
    await navigator.serviceWorker.ready;

    // Khởi tạo messaging
    const messaging = await initializeMessaging();

    // Lấy FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error("Không thể lấy FCM token");
    }

    console.log("FCM token:", token);
    return token;
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
    throw error;
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
