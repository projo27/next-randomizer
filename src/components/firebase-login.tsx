"use client";

import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";

// Firebase config Anda
const firebaseConfig = {
  apiKey: "AIzaSyDkb7csKDRq4d2aCDJnybMoa-oKRS7DfOI",
  authDomain: "studio-1124030078-b67a7.firebaseapp.com",
  projectId: "studio-1124030078-b67a7",
  storageBucket: "studio-1124030078-b67a7.firebasestorage.app",
  messagingSenderId: "532277365034",
  appId: "1:532277365034:web:88812bf89bf699e832b653"
};

// Inisialisasi Firebase hanya sekali
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function FirebaseLogin() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.log(error);
      alert("Login gagal");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Halo, {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login dengan Google</button>
      )}
    </div>
  );
}