import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA4X--c0Flp3_kGjM-vRc0bGLKZ8B-n1TE",
  authDomain: "studio-9952204356-7b7c0.firebaseapp.com",
  projectId: "studio-9952204356-7b7c0",
  storageBucket: "studio-9952204356-7b7c0.firebasestorage.app",
  messagingSenderId: "778334925367",
  appId: "1:778334925367:web:80079a883e8c8aa91545b2"
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

