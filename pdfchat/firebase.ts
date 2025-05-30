import { getApps, getApp, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-beEGA2i6U8-EZrfzWMnzF3mSWF35T2M",
  authDomain: "chatpdf-2f36b.firebaseapp.com",
  projectId: "chatpdf-2f36b",
  storageBucket: "chatpdf-2f36b.firebasestorage.app",
  messagingSenderId: "143662433856",
  appId: "1:143662433856:web:c085fc400392e0341201a5",
  measurementId: "G-FXNSZ08Q4V"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage};