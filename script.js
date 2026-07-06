import {
  auth,
  signInWithEmailAndPassword
} from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "home.html";
    }
});

// Romantic Quotes
const quotes = [
    "❤️ You're my favorite notification.",
    "🌙 Every message from you makes my day.",
    "💕 Forever & Always.",
    "✨ You make my world beautiful.",
    "🌹 Lucky to have you.",
    "💖 Home is wherever you are.",
    "🦋 My safe place is you.",
    "❤️ Every love story is beautiful, but ours is my favorite."
];

// Quote Animation
const quote = document.getElementById("quote");

if (quote) {

    let index = 0;

    setInterval(() => {

        index++;

        if (index >= quotes.length) {
            index = 0;
        }

        quote.style.opacity = "0";

        setTimeout(() => {
            quote.innerHTML = quotes[index];
            quote.style.opacity = "1";
        }, 400);

    }, 4000);

}

// Login
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    loginBtn.innerHTML = "❤️ Loading...";

    try {

      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Successful ❤️");

      window.location.href = "home.html";

    } catch (error) {

      alert(error.message);

    }

    loginBtn.innerHTML = "Login ❤️";

  });

}

// Google Button
const googleBtn = document.getElementById("googleBtn");

if (googleBtn) {

    googleBtn.addEventListener("click", () => {

        alert("🚀 Google Login coming soon!");

    });

}