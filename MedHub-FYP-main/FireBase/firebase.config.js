// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj8g-jOBiG4QdA-QmplVUTwtqjpJrDZYE",
  authDomain: "medhub-a0ba8.firebaseapp.com",
  projectId: "medhub-a0ba8",
  storageBucket: "medhub-a0ba8.appspot.com",
  messagingSenderId: "789589357994",
  appId: "1:789589357994:web:2a04e4371f6e0b91b4a7d3",
};

// This ensures it doesn't reinitialize if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
