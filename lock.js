const pinInput = document.getElementById("pin");
const unlockBtn = document.getElementById("unlockBtn");

const savedPin = localStorage.getItem("studyvault_pin");

unlockBtn.addEventListener("click", () => {

    const pin = pinInput.value.trim();

    if (pin.length !== 4) {
        alert("Enter 4 digit PIN");
        return;
    }

    // First time
    if (!savedPin) {

        localStorage.setItem("studyvault_pin", pin);

        alert("PIN Created Successfully");
        sessionStorage.setItem("unlocked", "true");


        window.location.href = "index.html";

        return;
    }

    // Unlock
    if (pin === savedPin) {
      sessionStorage.setItem("unlocked", "true");

        window.location.href = "index.html";

    } else {

        alert("Wrong PIN");

        pinInput.value = "";

    }

});