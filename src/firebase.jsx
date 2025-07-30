import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: "AIzaSyAJbv98eOPs91oM5Gn8gWvGxV4J6Eld71o",
  authDomain: "lal-cottage.firebaseapp.com",
  projectId: "lal-cottage",
  storageBucket: "lal-cottage.appspot.com",
  messagingSenderId: "969765563051",
  appId: "1:969765563051:web:11b1f5748bf4915fc965ee",
  measurementId: "G-TVEH6ZFD3P"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;