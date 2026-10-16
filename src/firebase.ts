import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "sharpinven",
  // Add these when you have them (Project settings → Your apps → Web app):
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain: "sharpinven.firebaseapp.com",
  // appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);