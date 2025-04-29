/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function LoginHandler(e) {
  e.preventDefault();
  const username = $('input[type="text"]').val();
  const password = $('input[type="password"]').val();
  const remember = $("#remember").is(":checked");
  if (!username) {
    alert("Please enter your username");
    return;
  }
  if (!password) {
    alert("Please enter your password");
    return;
  }

  console.log("Login form submitted:", { username, password, remember });
  Http.post("/auth/login", { username, password })
    .then((response) => {
      // server didn't send jwt in the response body rather set-cookie in the response header.
      // Http.setCookie("jwt", response.token);
      // window.open("watchlist.html", "_blank"); // Redirect to dashboard
      window.location.href = "watchlist.html"; // Redirect to dashboard
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials." + error.msg);
    });
}

function GoogleLoginHandler(e) {
  e.preventDefault();
  // TODO : Implement Google login logic here
}

function AppleLoginHandler(e) {
  e.preventDefault();
  // TODO : Implement Apple login logic here
}

// Toggle password visibility
function TogglePassword() {
  const passwordField = $("#password");
  const eyeIcon = $("#eyeIcon");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}

$(document).ready(function () {
  let user = {};
  $("#loginForm").on("submit", LoginHandler);
  $(".google-login").on("click", GoogleLoginHandler);
  $("#togglePassword").on("click", TogglePassword);
});
