const form = document.getElementById("regForm");
const message = document.getElementById("message");
const submitBtn = form.querySelector("button[type='submit']");

const API_URL = "https://script.google.com/macros/s/AKfycbxYA2BcIxS6ALQ3FHodvJO9YUOkQAizSgj1MMglWFGfTtYgNMbG2zwKCU0eBEoU5wVm-g/exec";

// Generate unique draw number (MES + timestamp + random)
function generateDrawNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MES-${timestamp.slice(-4)}${random}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Disable button to prevent double submission
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  message.textContent = "";
  message.className = "";
  
  const phone = document.getElementById("phone").value.trim();
  const registration = document.getElementById("registration").value.trim();
  
  // Generate draw number
  const drawNumber = generateDrawNumber();
  
  const payload = {
    name: document.getElementById("name").value.trim(),
    phone: phone,
    registration: registration,
    drawNumber: drawNumber
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();

    if (result.status === "success") {
      // Show success with draw number
      message.innerHTML = `
        <div class="success-msg">
          <div class="success-icon">🎉</div>
          <div>You're in! See you at MES!</div>
          <div class="draw-number">
            <span>Your Draw Number</span>
            <strong>${result.drawNumber || drawNumber}</strong>
          </div>
          <div class="save-hint">📸 Screenshot this!</div>
        </div>
      `;
      message.className = "success";
      form.reset();
    } else if (result.status === "duplicate") {
      message.innerHTML = `
        <div class="error-msg">
          <div>⚠️ Already registered!</div>
          <div class="existing-draw">Your Draw #: <strong>${result.drawNumber || 'Check your records'}</strong></div>
        </div>
      `;
      message.className = "error";
    } else {
      message.textContent = "Something went wrong. Try again.";
      message.className = "error";
    }
  } catch (error) {
    message.textContent = "Network error. Please try again.";
    message.className = "error";
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = "Enter the Draw!";
  }
});
