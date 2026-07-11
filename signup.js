import {
  auth,
  db,
  ref,
  set,
  createUserWithEmailAndPassword
} from "./firebase.js";

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await set(ref(db, "users/" + user.uid), {
      name: name,
      email: email,
      createdAt: Date.now()
    });

    alert("Account Created Successfully ❤️");

    window.location.href = "login.html";

  } catch (error) {
    alert(error.message);
  }

});