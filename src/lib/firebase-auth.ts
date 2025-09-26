// src/lib/firebase/auth.ts

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User, // Impor tipe User dari Firebase
  AuthError // Impor tipe AuthError untuk penanganan error
} from "firebase/auth";
import { auth } from "./firebase-config";

// Inisialisasi provider Google
const googleProvider = new GoogleAuthProvider();

/**
 * Fungsi untuk Login dengan Pop-up Google
 * @returns Promise<User>
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Tipe data result.user adalah User
    return result.user; 
  } catch (error) {
    if ((error as AuthError).code) {
        console.error("Firebase Auth Error:", (error as AuthError).message);
    } else {
        console.error("General Error:", error);
    }
    throw error; // Lempar error agar bisa ditangani di komponen
  }
}

/**
 * Fungsi untuk Logout
 * @returns Promise<void>
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Re-export onAuthStateChanged untuk digunakan di context
export { onAuthStateChanged };