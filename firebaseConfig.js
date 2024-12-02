import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCF3QAVRjZgmXLRoWeam9hleiXbt42SdGQ",
  authDomain: "traveleasy-e2493.firebaseapp.com",
  projectId: "traveleasy-e2493",
  storageBucket: "traveleasy-e2493.firebasestorage.app",
  messagingSenderId: "386620668174",
  appId: "1:386620668174:web:f78ac38725ba3c9c5a7f5f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };