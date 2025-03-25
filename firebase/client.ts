import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLUgzPhylpzlxnfDb5WHVAccpB3lfIvto",
  authDomain: "intervue-rht21.firebaseapp.com",
  projectId: "intervue-rht21",
  storageBucket: "intervue-rht21.firebasestorage.app",
  messagingSenderId: "319704999988",
  appId: "1:319704999988:web:5226171cbede61e06e8261",
  measurementId: "G-6L9Z3K9VMQ",
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
