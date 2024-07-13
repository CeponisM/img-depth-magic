import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCytNCYpfFi1EykRcwGDUuEv8RFBujWMLk",
    authDomain: "d-img-f05df.firebaseapp.com",
    projectId: "d-img-f05df",
    storageBucket: "d-img-f05df.appspot.com",
    messagingSenderId: "704914080465",
    appId: "1:704914080465:web:8e7e2d9ed1257c8a79bbf0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, storage };