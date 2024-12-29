// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCNd7A6sXglQuTDXH3dwSgVPm-QtLZsgz4",
  authDomain: "culinaria-c6f74.firebaseapp.com",
  projectId: "culinaria-c6f74",
  storageBucket: "culinaria-c6f74.firebasestorage.app",
  messagingSenderId: "901436166281",
  appId: "1:901436166281:web:7fcf1138720d707f093658",
  measurementId: "G-K923939179"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)