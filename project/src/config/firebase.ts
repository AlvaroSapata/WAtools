import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCV-plaLMIocZ1a9-HOJVsuWPybAZhqrE0",
  authDomain: "watools-4c1d0.firebaseapp.com",
  projectId: "watools-4c1d0",
  storageBucket: "watools-4c1d0.firebasestorage.app",
  messagingSenderId: "956024799311",
  appId: "1:956024799311:web:6720aee64b4a1250fb2a3a",
  measurementId: "G-VP8NFDGTV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const firestore = getFirestore(app);

// Enable offline persistence for mobile
try {
  // This will enable offline persistence
  firestore._delegate._databaseId = firestore._delegate._databaseId;
} catch (error) {
  console.log('Offline persistence not available:', error);
}

export const db = firestore;

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;