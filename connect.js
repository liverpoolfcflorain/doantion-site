const BACKEND_URL = 'https://counter-onlc.onrender.com';
let selectedAmount = 10; // Default preset amount

function selDon(amt, btn) {
  selectedAmount = amt;
  document.querySelectorAll('.don-pre').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('donIn').value = ''; 
}

/**
 * Triggered by the "Donate Now" button.
 * Sends the amount to your server and securely redirects the user away to Safepay.
 */
async function openDonationModal() {
  const customVal = parseInt(document.getElementById('donIn').value, 10);
  const finalAmt = (customVal > 0) ? customVal : selectedAmount;

  if (!finalAmt || finalAmt < 1) {
    alert("Please select a valid donation amount.");
    return;
  }

  const submitBtn = document.getElementById('donSubmitBtn');
  submitBtn.textContent = "Connecting Securely...";
  submitBtn.disabled = true;

  try {
    // 1. Request a secure, signed link from your backend server
    const response = await fetch(`${BACKEND_URL}/api/checkout/safepay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: finalAmt })
    });

    const result = await response.json();

    if (result.status === 'success' && result.checkoutUrl) {
      // 2. Safely redirect the browser context directly to Safepay's secure encryption page
      window.location.href = result.checkoutUrl;
    } else {
      alert("Failed to build a secure session link. Try again later.");
      submitBtn.textContent = "Donate Now";
      submitBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    alert("Backend link unavailable.");
    submitBtn.textContent = "Donate Now";
    submitBtn.disabled = false;
  }
}

// Keep the global tracker updated in real-time
async function refreshLiveCounters() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/donations`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById('donAmt').textContent = 'Rs. ' + data.total.toLocaleString();
      document.getElementById('donDonors').textContent = `${data.donors.toLocaleString()} donors have contributed`;
      
      const GOAL = 10000;
      const pct = Math.min(100, Math.round((data.total / GOAL) * 100));
      document.getElementById('donBar').style.width = pct + '%';
      document.getElementById('donPct').textContent = pct + '%';
    }
  } catch (e) {
    console.log("Counter synchronization unavailable.");
  }
}



window.addEventListener('DOMContentLoaded', refreshLiveCounters);