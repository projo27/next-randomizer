import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkb7csKDRq4d2aCDJnybMoa-oKRS7DfOI",
  authDomain: "studio-1124030078-b67a7.firebaseapp.com",
  projectId: "studio-1124030078-b67a7",
  storageBucket: "studio-1124030078-b67a7.appspot.com",
  messagingSenderId: "532277365034",
  appId: "1:532277365034:web:88812bf89bf699e832b653"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;

// Check if we're in the browser before initializing auth
if (typeof window !== "undefined") {
    auth = initializeAuth(app, {
        persistence: browserLocalPersistence
    });
} else {
    auth = getAuth(app);
}

const provider = new GoogleAuthProvider();

export { app, auth, provider };
