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
  onValue,
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
const params = new URLSearchParams(window.location.search);

const roomId = params.get("room");
const partnerName = params.get("name");
const partnerEmail = params.get("email");
const userStatus = document.getElementById("userStatus");
const emojiBtn = document.getElementById("emojiBtn");
const emojiBox = document.getElementById("emojiBox");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const replyBox = document.getElementById("replyBox");
const replyText = document.getElementById("replyText");
const cancelReply = document.getElementById("cancelReply");

let replyingTo = null;
const reactions = [
    "❤️",
    "😂",
    "😍",
    "😮",
    "😢",
    "👍",
    "🔥"
];
const typingStatus = document.getElementById("typingStatus");

const typingRef = ref(db, "typing/" + roomId);

// =========================
// Notification Permission
if ("Notification" in window) {
    Notification.requestPermission();
}
// Firebase References
// =========================

const messagesRef = ref(db, "chats/" + roomId + "/messages");

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

if (partnerName && partnerEmail) {
    userEmail.innerHTML = `🟢 ${partnerName}<br><small>${partnerEmail}</small>`;
} else {
    userEmail.textContent = "🟢 " + user.email;
}

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
    deleted: false,

    replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            sender: replyingTo.sender
        }
        : null

})
.then(() => {

    messageInput.value = "";

    replyingTo = null;

    replyBox.style.display = "none";

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
    update(ref(db, "chats/" + roomId + "/messages/" + snapshot.key), {
        seen: true
    });
}
if (
    currentUser &&
    data.sender !== currentUser.email &&
    Notification.permission === "granted"
) {
    new Notification(data.sender, {
        body: data.text
    });
}
const div = document.createElement("div");

div.dataset.key = snapshot.key;
div.dataset.sender = data.sender;

div.className =
  currentUser && data.sender === currentUser.email
    ? "message sent"
    : "message received";

div.innerHTML = `

${data.replyTo ? `
<div style="
border-left:3px solid #ff4d6d;
padding-left:8px;
margin-bottom:6px;
font-size:13px;
color:#666;
background:#f8f8f8;
border-radius:6px;
padding:6px;
">
<b>${data.replyTo.sender || "Unknown"}</b><br>
${(data.replyTo.text || "").substring(0, 50)}
</div>
` : ""}

<div>${data.text}</div>

<small>
${data.reaction ? `
<div style="
margin-top:4px;
font-size:18px;
">
${data.reaction}
</div>
` : ""}
${data.time}
${
data.sender === currentUser.email
  ? (data.seen ? " ✓✓" : " ✓")
  : ""
}
${data.edited ? " (edited)" : ""}
</small>

`;

chatBox.appendChild(div);

div.addEventListener("contextmenu", (e) => {

    e.preventDefault();

    let action;

    if (data.sender === currentUser.email) {

        action = prompt(`Type:

1 = Reply
2 = React
3 = Edit
4 = Delete`);

    } else {

        action = prompt(`Type:

1 = Reply
2 = React`);

    }

    // Reply code
    if (action === "1") {

        replyingTo = {
            id: snapshot.key,
            text: data.text,
            sender: data.sender
        };

        replyText.innerHTML = `
            <b>${data.sender}</b><br>
            ${data.text}
        `;

        replyBox.style.display = "block";

        messageInput.focus();

        return;
    }
// ================= React =================
if (action === "2") {

    const emoji = prompt(
`Choose Reaction:

1 ❤️
2 😂
3 😍
4 😮
5 😢
6 👍
7 🔥`
    );

    const map = {
        "1": "❤️",
        "2": "😂",
        "3": "😍",
        "4": "😮",
        "5": "😢",
        "6": "👍",
        "7": "🔥"
    };

    if (!map[emoji]) return;

    update(
        ref(db, "chats/" + roomId + "/messages/" + snapshot.key),
        {
            reaction: map[emoji]
        }
    );

    return;
}
    // Edit code
    if (action === "3" && data.sender === currentUser.email) {

        const newText = prompt("Edit your message:", data.text);

        if (!newText || newText.trim() === "") return;

        update(
            ref(db, "chats/" + roomId + "/messages/" + snapshot.key),
            {
                text: newText.trim(),
                edited: true
            }
        );

        return;
    }

    // Delete code
if (action === "4" && data.sender === currentUser.email) {

        const ok = confirm("Delete this message?");

        if (ok) {

            remove(
                ref(db, "chats/" + roomId + "/messages/" + snapshot.key)
            );

        }

    }

});



chatBox.scrollTop = chatBox.scrollHeight;
});
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

${data.replyTo ? `
<div style="
border-left:3px solid #ff4d6d;
padding-left:8px;
margin-bottom:6px;
font-size:13px;
color:#666;
background:#f8f8f8;
border-radius:6px;
padding-top:4px;
padding-bottom:4px;
">

<b>${data.replyTo.sender || "Unknown"}</b><br>
${(data.replyTo.text || "").substring(0, 50)}

</div>
` : ""}

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

let typingTimeout;

messageInput.addEventListener("input", () => {

    if (!currentUser) return;

    set(
        ref(db, "typing/" + roomId + "/" + currentUser.uid),
        {
            name: currentUser.email,
            typing: true
        }
    );

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {

        set(
            ref(db, "typing/" + roomId + "/" + currentUser.uid),
            {
                name: currentUser.email,
                typing: false
            }
        );

    }, 1500);

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
onValue(typingRef, (snapshot) => {

    typingStatus.textContent = "";

    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {

        const data = child.val();

        if (
            child.key !== currentUser.uid &&
            data.typing
        ) {

            typingStatus.textContent =
                data.name + " is typing...";

        }

    });

});
cancelReply.addEventListener("click", () => {

    replyingTo = null;

    replyBox.style.display = "none";
    replyText.innerHTML = "";

});
