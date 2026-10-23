import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA4X--c0Flp3_kGjM-vRc0bGLKZ8B-n1TE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-9952204356-7b7c0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-9952204356-7b7c0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-9952204356-7b7c0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "778334925367",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:778334925367:web:80079a883e8c8aa91545b2"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

