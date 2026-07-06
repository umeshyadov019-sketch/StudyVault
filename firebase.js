import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  child,
  get,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  set,
  remove,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyCZh0T_phrL2NdKfvYGpfIOkAJNIJQlyV0",
  authDomain: "studyvault-b6dd4.firebaseapp.com",
  projectId: "studyvault-b6dd4",
  storageBucket: "studyvault-b6dd4.firebasestorage.app",
  messagingSenderId: "764168740602",
  appId: "1:764168740602:web:5faa6e15de51e2175c3343",
  databaseURL: "https://studyvault-b6dd4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);

export {
  auth,
  db,
  ref,
  child,
  get,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  set,
  remove,
  onDisconnect,
  serverTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
};