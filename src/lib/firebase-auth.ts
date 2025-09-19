import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithRedirect, signOut };
