// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  persistentLocalCache,
  persistentMultipleTabManager,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache:
    typeof window !== "undefined"
      ? persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        })
      : memoryLocalCache(),
});
// const db = getFirestore(app);

// Enable Firestore persistence
// if (typeof window !== 'undefined') {
//   enableIndexedDbPersistence(db)
//     .catch((err) => {
//       if (err.code == 'failed-precondition') {
//         // Multiple tabs open, persistence can only be enabled in one tab at a time.
//         console.warn('Firestore persistence failed: Multiple tabs open.');
//       } else if (err.code == 'unimplemented') {
//         // The browser does not support all of the features required to enable persistence
//         console.warn('Firestore persistence failed: Browser does not support persistence.');
//       }
//     });
// }

export { app, auth, db };
