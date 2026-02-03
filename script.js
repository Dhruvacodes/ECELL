const form = document.getElementById("regForm");
const message = document.getElementById("message");
const submitBtn = form.querySelector("button[type='submit']");

// Use Google Apps Script OR local backup
const API_URL = "https://script.google.com/macros/s/AKfycbxYA2BcIxS6ALQ3FHodvJO9YUOkQAizSgj1MMglWFGfTtYgNMbG2zwKCU0eBEoU5wVm-g/exec";

// Fallback data stored locally
let registrations = JSON.parse(localStorage.getItem("mesRegistrations")) || [];

// Generate unique draw number (MES + timestamp + random)
function generateDrawNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MES-${timestamp.slice(-4)}${random}`;
}

// Check if already registered (phone or registration number)
function checkDuplicate(phone, registration) {
  return registrations.some(r => 
    r.phone === phone || r.registration === registration
  );
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Disable button to prevent double submission
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  message.textContent = "";
  message.className = "";
  
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const registration = document.getElementById("registration").value.trim();
  
  // Generate draw number
  const drawNumber = generateDrawNumber();
  
  // Check local duplicate FIRST
  const existingReg = registrations.find(r => 
    r.phone === phone || r.registration === registration
  );
  
  if (existingReg) {
    message.innerHTML = `
      <div class="error-msg">
        <div>⚠️ Already registered!</div>
        <div class="existing-draw">Your Draw #: <strong>${existingReg.drawNumber}</strong></div>
      </div>
    `;
    message.className = "error";
    submitBtn.disabled = false;
    submitBtn.textContent = "Enter the Draw!";
    return;
  }
  
  const payload = {
    name: name,
    phone: phone,
    registration: registration,
    drawNumber: drawNumber,
    timestamp: new Date().toISOString()
  };

  try {
    // Try Google Apps Script first
    const response = await Promise.race([
      fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
      )
    ]);

    const result = await response.json();

    if (result.status === "success") {
      // Save to local storage as backup
      registrations.push(payload);
      localStorage.setItem("mesRegistrations", JSON.stringify(registrations));
      
      showSuccess(drawNumber);
    } else if (result.status === "duplicate") {
      showDuplicate(result.drawNumber || drawNumber);
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    // If Google Apps Script fails, use local storage
    console.warn("Using local backup:", error.message);
    registrations.push(payload);
    localStorage.setItem("mesRegistrations", JSON.stringify(registrations));
    showSuccess(drawNumber);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enter the Draw!";
  }
});

function showSuccess(drawNumber) {
  message.innerHTML = `
    <div class="success-msg">
      <div class="success-icon">🎉</div>
      <div>You're in! See you at MES!</div>
      <div class="draw-number">
        <span>Your Draw Number</span>
        <strong>${drawNumber}</strong>
      </div>
      <div class="save-hint">📸 Screenshot this!</div>
    </div>
  `;
  message.className = "success";
  form.reset();
}

function showDuplicate(drawNumber) {
  message.innerHTML = `
    <div class="error-msg">
      <div>⚠️ Already registered!</div>
      <div class="existing-draw">Your Draw #: <strong>${drawNumber}</strong></div>
    </div>
  `;
  message.className = "error";
}
