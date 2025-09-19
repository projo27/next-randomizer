// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkb7csKDRq4d2aCDJnybMoa-oKRS7DfOI",
  authDomain: "studio-1124030078-b67a7.firebaseapp.com",
  projectId: "studio-1124030078-b67a7",
  storageBucket: "studio-1124030078-b67a7.firebasestorage.app",
  messagingSenderId: "532277365034",
  appId: "1:532277365034:web:88812bf89bf699e832b653"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google Login
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    console.log("User Info:", user);
    return { user, token };
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error("Error during Google Login:", errorCode, errorMessage, email, credential);
    throw error;
  }
};