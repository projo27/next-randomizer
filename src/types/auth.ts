import { User } from "firebase/auth";

// Re-export the User type from firebase/auth as FirebaseUser for clarity
export type FirebaseUser = User;

// Tipe untuk object user di context: User dari Firebase atau null
export type AuthUser = FirebaseUser | null;

// Interface untuk Auth Context
export interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseUser>; // Fungsi login
  signOut: () => Promise<void>; // Fungsi logout
}
