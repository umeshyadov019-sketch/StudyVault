import {
  auth,
  db,
  ref,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  remove,
  set,
  onDisconnect,
  serverTimestamp,
  signOut
} from "./firebase.js";

// =========================
// DOM Elements
// =========================
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const userStatus = document.getElementById("userStatus");
const emojiBtn = document.getElementById("emojiBtn");
const emojiBox = document.getElementById("emojiBox");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

// =========================
// Firebase References
// =========================
const messagesRef = ref(db, "messages");

// =========================
// Variables
// =========================
let currentUser = null;

// =========================
// Authentication
// =========================
auth.onAuthStateChanged((user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    userEmail.textContent = "🟢 " + user.email;
    userStatus.textContent = "🟢 Online";

    // Online Status
    const statusRef = ref(db, "status/" + user.uid);

    set(statusRef, {
        state: "online",
        lastChanged: serverTimestamp()
    });

    onDisconnect(statusRef).set({
        state: "offline",
        lastChanged: serverTimestamp()
    });

});

/* SEND MESSAGE */
sendBtn.addEventListener("click", () => {

  const text = messageInput.value.trim();
  if (!text) return;

  if (!currentUser) {
    alert("User not ready, refresh karo");
    return;
  }

  push(messagesRef, {
  text: text,
  sender: currentUser.email,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),
  seen: false,
  edited: false,
  deleted: false
})
  .then(() => {
    messageInput.value = "";
  })
  .catch((err) => {
    alert(err.message);
  });

});

/* RECEIVE MESSAGE */
onChildAdded(messagesRef, (snapshot) => {

  const data = snapshot.val();
  
  if (
    currentUser &&
    data.sender !== currentUser.email &&
    data.seen === false
) {
    update(ref(db, "messages/" + snapshot.key), {
        seen: true
    });
}
onChildRemoved(messagesRef, (snapshot) => {

  const msg = document.querySelector(
    `[data-key="${snapshot.key}"]`
  );

  if (msg) {
    msg.remove();
  }

});
onChildChanged(messagesRef, (snapshot) => {

  const data = snapshot.val();

  const msg = document.querySelector(
    `[data-key="${snapshot.key}"]`
  );

  if (!msg) return;

  msg.innerHTML = `
    <div>${data.text}</div>

    <small>
      ${data.time}
      ${
        data.sender === currentUser.email
          ? (data.seen ? " ✓✓" : " ✓")
          : ""
      }
      ${data.edited ? " (edited)" : ""}
    </small>
  `;

});

  const div = document.createElement("div");
  div.dataset.key = snapshot.key;
div.dataset.sender = data.sender;

  div.className =
    currentUser && data.sender === currentUser.email
      ? "message sent"
      : "message received";

  div.innerHTML = `
  <div>${data.text}</div>

  <small>
    ${data.time}
    ${
      data.sender === currentUser.email
        ? (data.seen ? " ✓✓" : " ✓")
        : ""
    }
  </small>
`;

  chatBox.appendChild(div);
  div.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    if (data.sender !== currentUser.email) return;

  const action = prompt(
  "Type:\n1 = Edit\n2 = Delete"
);

if (action === "1") {

  const newText = prompt("Edit your message:", data.text);

  if (!newText || newText.trim() === "") return;

  update(ref(db, "messages/" + snapshot.key), {
    text: newText.trim(),
    edited: true
  });

  return;
}

    const ok = confirm("Delete this message?");

    if (ok) {
    remove(ref(db, "messages/" + snapshot.key));
}
});

  chatBox.scrollTop = chatBox.scrollHeight;

});


// Enter key se message send
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

emojiBtn.addEventListener("click", () => {

    if (emojiBox.style.display === "block") {
        emojiBox.style.display = "none";
    } else {
        emojiBox.style.display = "block";
    }

});
document.querySelectorAll("#emojiBox span").forEach((emoji) => {

    emoji.addEventListener("click", () => {

        messageInput.value += emoji.textContent;

        messageInput.focus();

        emojiBox.style.display = "none";

    });

});
// 📷 Image Button
imageBtn.addEventListener("click", () => {
    imageInput.click();
});



/* LOGOUT */
logoutBtn.addEventListener("click", () => {
  update(ref(db, "status/" + currentUser.uid), {
    state: "offline",
    lastChanged: Date.now()
});

  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
    
}); 