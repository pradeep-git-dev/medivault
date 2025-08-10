document.addEventListener("DOMContentLoaded", () => {
  const scanResult = document.getElementById("scanResult");

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Login failed");
        return;
      }

      console.log("Received token:", result.token);
      localStorage.setItem("token", result.token);
      window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      alert("Server error during login.");
    }
  });

  // QR Code Login
  async function onScanSuccess(decodedText) {
    scanResult.textContent = `QR Code Scanned: ${decodedText}`;

    try {
      const res = await fetch("http://localhost:5000/api/auth/qr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: decodedText })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        alert(`Welcome back!`);
        localStorage.setItem("token", data.token);
        window.location.href = "home.html";
      } else {
        alert(data.error || "Invalid QR or user not found");
      }
    } catch (error) {
      alert("Invalid QR or user not found");
      console.error(error);
    }
  }

  function onScanFailure(error) {
    // Optional: console.log(error);
  }

  const html5QrCode = new Html5Qrcode("preview");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess,
    onScanFailure
  );
});
