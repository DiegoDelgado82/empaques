// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxpFN9hR42nF_pl009BVzO9HoHm7N0cMM",
  authDomain: "empaques-4f9f3.firebaseapp.com",
  projectId: "empaques-4f9f3",
  storageBucket: "empaques-4f9f3.firebasestorage.app",
  messagingSenderId: "998729124602",
  appId: "1:998729124602:web:d33400b4c53f04104c9743",
  measurementId: "G-9BRWEGETMM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };


