const form = document.getElementById("regForm");
const message = document.getElementById("message");

const API_URL = "https://script.google.com/macros/s/AKfycbxYA2BcIxS6ALQ3FHodvJO9YUOkQAizSgj1MMglWFGfTtYgNMbG2zwKCU0eBEoU5wVm-g/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  message.textContent = "Submitting...";
  
  const payload = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    registration: document.getElementById("registration").value
  };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();

  if (result.status === "success") {
    message.textContent = "See you at MES! 🚀";
    form.reset();
  } else {
    message.textContent = "You are already registered.";
  }
});
