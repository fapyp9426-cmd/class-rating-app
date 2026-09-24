// ===================== FIREBASE =====================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  deleteField,
  getDocs,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ===================== КОНФИГ =====================

const firebaseConfig = {
  apiKey: "AIzaSyA3HhrwUimCKqw2CFvqcqzPY4GgFVk1B_s",
  authDomain: "class-rating-db.firebaseapp.com",
  projectId: "class-rating-db",
  storageBucket: "class-rating-db.firebasestorage.app",
  messagingSenderId: "1065420723057",
  appId: "1:1065420723057:web:8a05589047644dfd921cd0"
};


// ===================== ИНИЦИАЛИЗАЦИЯ =====================

const fbApp =
  initializeApp(firebaseConfig);


// ===================== AUTH =====================

export const auth =
  getAuth(fbApp);


// ===================== FIRESTORE =====================

export const db =
  getFirestore(fbApp);


// ===================== КОЛЛЕКЦИИ =====================

export const studentsCol =
  collection(
    db,
    "students"
  );

export const historyCol =
  collection(
    db,
    "history"
);


// Авторизация учеников

export const studentAuthCol =
  collection(
    db,
    "studentAuth"
);


// Профили учеников

export const profilesCol =
  collection(
    db,
    "profiles"
);


// Посты ленты

export const postsCol =
  collection(
    db,
    "posts"
);


// ===================== FIREBASE API =====================

// Auth

export {
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};


// Firestore

export {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  getDocs,
  getDoc,
  deleteField,
  serverTimestamp
};


// ===================== /FIREBASE =====================