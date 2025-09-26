import { User } from "firebase/auth";

// Tipe untuk object user di context: User dari Firebase atau null
export type AuthUser = User | null;

// Interface untuk Auth Context
export interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signInWithGoogle: () => Promise<User>; // Fungsi login
  signOut: () => Promise<void>; // Fungsi logout
}
