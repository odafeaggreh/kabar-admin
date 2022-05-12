import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCxCigLO6ybcfiECqk11Bo-4_2qod9RN88',
  authDomain: 'al-barakacapital.firebaseapp.com',
  projectId: 'al-barakacapital',
  storageBucket: 'al-barakacapital.appspot.com',
  messagingSenderId: '206786078708',
  appId: '1:206786078708:web:6a6a0fd45f9439cc7abba1'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, app, functions };
