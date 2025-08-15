
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "veridash",
  appId: "1:1028843951231:web:edef2eea02da3f0f1c9b4a",
  storageBucket: "veridash.firebasestorage.app",
  apiKey: "AIzaSyAewTHkyOVkug79Ajcnh1qoerWNx0VEoJU",
  authDomain: "veridash.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1028843951231"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
