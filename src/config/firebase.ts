// src/config/firsbase.ts
import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in dev (hot reload)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ FIX 1: Use memory-only cache instead of IndexedDB persistence.
//    With persistence enabled (default), setDoc() can hang indefinitely
//    when the server connection is unstable — the promise waits for
//    server confirmation that never arrives.
//
// ✅ FIX 2: Force long polling instead of WebSockets.
//    Many networks (college WiFi, corporate proxies) block WebSocket
//    connections, preventing Firestore from ever reaching the server.
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true,
});

const auth = getAuth(app);

export { app, db, auth };
