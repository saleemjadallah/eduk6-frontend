// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOPdqgdBxMgDGFRAcKyz4YtjYdzHprUPM",
  authDomain: "mydscvrfood.firebaseapp.com",
  projectId: "mydscvrfood",
  storageBucket: "mydscvrfood.firebasestorage.app",
  messagingSenderId: "9707316779",
  appId: "1:9707316779:web:d7a717f2d5b71763f8ac6e",
  measurementId: "G-W6ZKQ2RPKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;