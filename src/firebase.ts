import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "../firebase-applet-config.json";

// Initialize Firebase with the injected project credentials
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
});

// Access the specific firestore database allocated for this applet
export const db = getFirestore(app, config.firestoreDatabaseId);
