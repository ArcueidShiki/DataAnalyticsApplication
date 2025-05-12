import Http from "./http.js";
import User from "./user.js";
function LoginHandler(e) {
  e.preventDefault();
  const username = $('input[type="text"]').val();
  const password = $('input[type="password"]').val();
  const remember = $("#remember").is(":checked");
  if (!username) {
    alert("Please enter username");
    return;
  }
  if (!password) {
    alert("Please enter your password");
    return;
  }

  Http.post("/auth/login", { username, password })
    .then((response) => {
      // access_token_cookie csrf_access_token in response header, type Set-Cookie
      console.log("Login response:", response);
      localStorage.setItem("userInfo", JSON.stringify(response.user));
      User.getInstance().set(response.user);
      Http.setCookie("access_token_cookie", response.access_token);
      Http.setCookie("csrf_access_token", response.csrf_token);
      const accessToken = Http.getCookie("access_token_cookie");
      const csrfToken = Http.getCookie("csrf_access_token");
      console.log("Access Token:", accessToken);
      console.log("CSRF Token:", csrfToken);
      window.open("watchlist.html", "_blank"); // Redirect to dashboard
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

$(document).ready(function () {
  let user = {};
  $("#loginForm").on("submit", LoginHandler);
  $(".google-login").on("click", GoogleLoginHandler);
  $("#togglePassword").on("click", TogglePassword);
});
