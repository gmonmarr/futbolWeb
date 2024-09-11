import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Firestore imports

// Configuración de Firebase usando las variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Cambia Realtime Database por Firestore

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Exporta los servicios y funciones necesarios de Firebase
export { auth, googleProvider, db, doc, setDoc, getDoc, updateDoc };
