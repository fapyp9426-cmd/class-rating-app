// ===================== FIREBASE =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth, signInAnonymously, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore, collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, addDoc, writeBatch, getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3HhrwUimCKqw2CFvqcqzPY4GgFVk1B_s",
  authDomain: "class-rating-db.firebaseapp.com",
  projectId: "class-rating-db",
  storageBucket: "class-rating-db.firebasestorage.app",
  messagingSenderId: "1065420723057",
  appId: "1:1065420723057:web:8a05589047644dfd921cd0"
};

const fbApp = initializeApp(firebaseConfig);

export const auth = getAuth(fbApp);
export const db = getFirestore(fbApp);

export const studentsCol = collection(db, "students");
export const historyCol = collection(db, "history");

// Реэкспортируем нужные функции Firestore/Auth, чтобы остальные модули
// импортировали всё из одного места и не тащили CDN-урлы у себя.
export {
  signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, writeBatch, getDocs
};

// ===================== APP FEED =====================

// Посты ленты класса
export const postsCol = collection(db, "posts");

// ===================== /FIREBASE =====================