const form = document.getElementById("regForm");
const message = document.getElementById("message");
const submitBtn = form.querySelector("button[type='submit']");

// Replace this with your Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxK7If2ofzfhVdYr9ZKPd5cs1cL66p4DRznyn5QF13yKcqr1LuZLs3QSO2yvMdK8lEVdQ/exec";

// Local backup storage
let registrations = JSON.parse(localStorage.getItem("mesRegistrations")) || [];

// Generate unique draw number
function generateDrawNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MES-${timestamp.slice(-4)}${random}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  message.textContent = "";
  message.className = "";
  
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const registration = document.getElementById("registration").value.trim();
  
  // Check local duplicate first (for offline mode)
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
  
  // Generate draw number
  const drawNumber = generateDrawNumber();
  
  const payload = {
    name: name,
    phone: phone,
    registration: registration,
    drawNumber: drawNumber
  };

  try {
    // Send to Google Sheets
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      // Save to local storage as backup
      const newReg = {
        ...payload,
        timestamp: new Date().toISOString()
      };
      registrations.push(newReg);
      localStorage.setItem("mesRegistrations", JSON.stringify(registrations));
      
      showSuccess(drawNumber);
    } else if (result.status === "duplicate") {
      message.innerHTML = `
        <div class="error-msg">
          <div>⚠️ Already registered!</div>
          <div class="existing-draw">Your Draw #: <strong>${result.drawNumber}</strong></div>
        </div>
      `;
      message.className = "error";
    } else {
      throw new Error("Server error");
    }
  } catch (error) {
    // If Google Sheets fails, save locally
    console.log("Saving locally (offline mode):", error.message);
    const newReg = {
      ...payload,
      timestamp: new Date().toISOString()
    };
    registrations.push(newReg);
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