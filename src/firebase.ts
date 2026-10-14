import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCipWKLPbeVhOqs7_R3qWvjtogI4gx1hM8",
  authDomain: "app-aroma-e-sabores.firebaseapp.com",
  projectId: "app-aroma-e-sabores",
  storageBucket: "app-aroma-e-sabores.firebasestorage.app",
  messagingSenderId: "334491628405",
  appId: "1:334491628405:web:8b91247b6251c07e21193c",
  measurementId: "G-X4V4RJHPL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics not initialized:", e);
      }
    }
  }).catch(() => {});
}

