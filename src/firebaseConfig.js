import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; //  Para login/cadastro
import { getFirestore } from 'firebase/firestore'; //  Para salvar dados

const firebaseConfig = {
  apiKey: "AIzaSyA0F5k5eZ35YS_pjpmEy7e2BSk0qt8hjzc",
  authDomain: "safeview-63ed5.firebaseapp.com",
  projectId: "safeview-63ed5",
  storageBucket: "safeview-63ed5.firebasestorage.app",
  messagingSenderId: "75316711729",
  appId: "1:75316711729:web:1a6fb94566b6b5fecf6010"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };