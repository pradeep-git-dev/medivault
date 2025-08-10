document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

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

      localStorage.setItem("token", result.token);
      window.location.href = "home.html";
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error during login.");
    }
  });
});
