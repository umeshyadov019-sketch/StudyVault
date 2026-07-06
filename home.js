import {
  auth,
  db,
  ref,
  child,
  get,
  signOut
} from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const searchBtn = document.getElementById("searchBtn");
const searchEmail = document.getElementById("searchEmail");
const searchResult = document.getElementById("searchResult");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    userName.textContent = user.email;

});

logoutBtn.addEventListener("click", () => {

    signOut(auth).then(() => {

        window.location.href = "login.html";

    });

});
searchBtn.addEventListener("click", async () => {

    const email = searchEmail.value.trim().toLowerCase();

    if (!email) {
        alert("Enter an email");
        return;
    }

    const snapshot = await get(ref(db, "users"));

    if (!snapshot.exists()) {
        searchResult.innerHTML = "<p>No users found.</p>";
        return;
    }

    let found = false;

    snapshot.forEach((childSnapshot) => {

        const user = childSnapshot.val();

        if (
            user.email.toLowerCase() === email &&
            auth.currentUser.email !== user.email
        ) {

            found = true;

            searchResult.innerHTML = `
                <div class="message received">
                    <b>${user.name}</b><br>
                    ${user.email}
                    <br><br>
                    <button
id="startChatBtn"
data-uid="${childSnapshot.key}">
❤️ Start Chat
</button>
                </div>
            `;
            const startChatBtn = document.getElementById("startChatBtn");

startChatBtn.addEventListener("click", () => {

    const otherUid = startChatBtn.dataset.uid;

    const roomId = [auth.currentUser.uid, otherUid]
        .sort()
        .join("_");

   window.location.href =
`chat.html?room=${encodeURIComponent(roomId)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;

});
        }

    });

    if (!found) {
        searchResult.innerHTML =
            "<p>User not found.</p>";
    }

});
