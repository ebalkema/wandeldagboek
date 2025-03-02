import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Je Firebase configuratie
// BELANGRIJK: Je moet deze waarden vervangen met je eigen Firebase configuratie
// Ga naar de Firebase Console (https://console.firebase.google.com/)
// Selecteer je project "wandeldagboek-1"
// Ga naar "Project instellingen" (tandwiel icoon)
// Scroll naar "Jouw apps" en kopieer de configuratiegegevens
const firebaseConfig = {
  apiKey: "AIzaSyANM0t0Jt4SpfGRe8Fm1sTyu5MiNcArE8M",
  authDomain: "wandeldagboek-1.firebaseapp.com",
  projectId: "wandeldagboek-1",
  storageBucket: "wandeldagboek-1.appspot.com",
  messagingSenderId: "491469039773",
  appId: "1:491469039773:web:b1b1129d6de831076acc74"
};

// Firebase initialiseren
const app = initializeApp(firebaseConfig);

// Firebase diensten exporteren
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Debug informatie voor Firebase connectiviteit
console.log("Firebase initialisatie compleet");
console.log("Auth service beschikbaar:", !!auth);
console.log("Firestore service beschikbaar:", !!db);
console.log("Storage service beschikbaar:", !!storage);
console.log("Storage bucket:", storage.app.options.storageBucket);
console.log("GitHub Pages domein:", window.location.origin);

export default app; 