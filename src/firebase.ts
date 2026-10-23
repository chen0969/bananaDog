import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6Bl4Yje9ZKuvfobBmRya7ahSDUpkAIfY",
  authDomain: "sharpinven.firebaseapp.com",
  projectId: "sharpinven",
  storageBucket: "sharpinven.firebasestorage.app",
  messagingSenderId: "126473892107",
  appId: "1:126473892107:web:58c6b5b738c614c8fb720e",
  measurementId: "G-GKZQKSS4BY",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // needed for sign-in later

// Analytics only works in browsers that support it (ad blockers can break it),
// so check first and never let it crash the app.
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {});