/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function RegisterHandler(e) {
  e.preventDefault();
  const username = $("#username").val();
  const email = $("#email").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (!username) {
    alert("Please enter your username");
    return;
  }
  if (!email) {
    alert("Please enter your email");
    return;
  }
  if (!password) {
    alert("Please enter your password");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  Http.post("/auth/register", { username, email, password })
    .then((response) => {
      console.log("Register response:", response);
      alert("Registration successful! Redirecting to login page...");
      window.location.href = "login.html"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Register error:", error);
      alert("Registration failed. Please try again.");
    });
}

// Toggle password visibility
function TogglePassword() {
  const passwordField = $("#password");
  const eyeIcon = $("#eyeIcon").get(0);

  if (passwordField.attr("type") === "password") {
    passwordField.attr("type", "text");
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordField.attr("type", "password");
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}

function ToggleConfirmPassword() {
  const confirmPasswordField = $("#confirmPassword");
  const confirmEyeIcon = $("#confirmEyeIcon").get(0);

  if (confirmPasswordField.attr("type") === "password") {
    confirmPasswordField.attr("type", "text");
    confirmEyeIcon.classList.remove("fa-eye");
    confirmEyeIcon.classList.add("fa-eye-slash");
  } else {
    confirmPasswordField.attr("type", "password");
    confirmEyeIcon.classList.remove("fa-eye-slash");
    confirmEyeIcon.classList.add("fa-eye");
  }
}

$(document).ready(function () {
  $("#registerForm").on("submit", RegisterHandler);
  $("#togglePassword").on("click", TogglePassword);
  $("#toggleConfirmPassword").on("click", ToggleConfirmPassword);
});
