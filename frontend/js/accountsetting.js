// Global variables
var userData = {
  name: "Rojo Arab Oktov",
  email: "rojo@example.com",
  phone: "+1 (555) 123-4567",
  birthdate: "1990-01-01",
  notifications: {
    email: true,
    push: true,
    market: true,
    newsletter: false,
  },
};

// Tab navigation functionality
function setupTabNavigation() {
  $(".tab-button").on("click", function () {
    // Remove active class from all tabs
    $(".tab-button").removeClass("active");
    $(".tab-content").removeClass("active");

    // Add active class to current tab
    $(this).addClass("active");
    const tabId = $(this).data("tab");
    $("#" + tabId).addClass("active");
  });
}

function loadUserData() {
  // Populate form fields
  $("#fullname").val(userData.name);
  $("#email").val(userData.email);
  $("#phone").val(userData.phone);
  $("#birthdate").val(userData.birthdate);

  // Set notification toggles
  $("#email-notifications").prop("checked", userData.notifications.email);
  $("#push-notifications").prop("checked", userData.notifications.push);
  $("#market-alerts").prop("checked", userData.notifications.market);
  $("#newsletter").prop("checked", userData.notifications.newsletter);

  console.log("User data loaded:", userData);
}

function setupEventListeners() {
  // Avatar upload
  $("#avatar-upload").on("change", handleAvatarUpload);
  $(".avatar-container").on("click", function () {
    $("#avatar-upload").click();
  });

  // Save button
  $("#save-settings").on("click", showConfirmationModal);

  // Cancel button
  $(".cancel-btn").on("click", function () {
    if (confirm("Discard changes?")) {
      window.location.reload();
    }
  });

  // Modal actions
  $(".close-modal").on("click", hideConfirmationModal);
  $("#modal-cancel").on("click", hideConfirmationModal);
  $("#modal-confirm").on("click", saveSettings);
}

function setupPasswordStrengthMeter() {
  $("#new-password").on("input", function (e) {
    const password = e.target.value;
    if (!password) {
      updatePasswordStrength("Not set", "");
      return;
    }

    const strength = calculatePasswordStrength(password);
    let strengthClass = "";
    let strengthText = "";

    if (strength < 30) {
      strengthClass = "weak";
      strengthText = "Weak";
    } else if (strength < 60) {
      strengthClass = "medium";
      strengthText = "Medium";
    } else if (strength < 80) {
      strengthClass = "strong";
      strengthText = "Strong";
    } else {
      strengthClass = "very-strong";
      strengthText = "Very Strong";
    }

    updatePasswordStrength(strengthText, strengthClass);
  });
}

function calculatePasswordStrength(password) {
  // Calculate password strength (0-100)
  let score = 0;

  // Basic length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;

  // Character variety
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Complexity check
  if (/[A-Z].*[A-Z]/.test(password)) score += 5;
  if (/[a-z].*[a-z]/.test(password)) score += 5;
  if (/[0-9].*[0-9]/.test(password)) score += 5;

  return Math.min(100, score);
}

function updatePasswordStrength(text, className) {
  $(".strength-text").text(text);
  $(".strength-meter")
    .removeClass("weak medium strong very-strong")
    .addClass(className);
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("File too large. Maximum size is 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    // Update avatar preview
    $("#profile-avatar").attr("src", e.target.result);

    // In a real app, you would upload the file to your server
    console.log("Avatar file ready for upload:", file.name);
  };
  reader.readAsDataURL(file);
}

function showConfirmationModal() {
  // Validate form first
  if (!validateForm()) return;

  // Show confirmation modal
  $("#confirmation-modal").addClass("show");
}

function hideConfirmationModal() {
  $("#confirmation-modal").removeClass("show");
}

function validateForm() {
  // Get form values
  const fullname = $("#fullname").val().trim();
  const email = $("#email").val().trim();
  const currentPassword = $("#current-password").val();
  const newPassword = $("#new-password").val();
  const confirmPassword = $("#confirm-password").val();

  // Basic validation
  if (!fullname) {
    alert("Full name is required");
    return false;
  }

  if (!email) {
    alert("Email is required");
    return false;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return false;
  }

  // Password validation (only if attempting to change password)
  if (newPassword || confirmPassword) {
    if (!currentPassword) {
      alert("Current password is required to change password");
      return false;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return false;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return false;
    }
  }

  return true;
}

function saveSettings() {
  hideConfirmationModal();

  // Get form data
  const formData = {
    name: $("#fullname").val().trim(),
    email: $("#email").val().trim(),
    phone: $("#phone").val().trim(),
    birthdate: $("#birthdate").val(),
    currentPassword: $("#current-password").val(),
    newPassword: $("#new-password").val(),
    notifications: {
      email: $("#email-notifications").is(":checked"),
      push: $("#push-notifications").is(":checked"),
      market: $("#market-alerts").is(":checked"),
      newsletter: $("#newsletter").is(":checked"),
    },
  };

  // In a real app, you would send this data to your server
  console.log("Saving settings:", formData);

  // Simulate API call
  showSavingIndicator();

  // For demo, simulate a successful response after 1 second
  setTimeout(function () {
    handleSaveSuccess({
      success: true,
      message: "Settings updated successfully",
    });
  }, 1000);
}

function showSavingIndicator() {
  const saveBtn = $("#save-settings");
  saveBtn.prop("disabled", true);
  saveBtn.html('<i class="fas fa-spinner fa-spin"></i> Saving...');
}

function handleSaveSuccess(response) {
  const saveBtn = $("#save-settings");
  saveBtn.html('<i class="fas fa-check"></i> Saved');

  // Show success message
  showToast("Settings updated successfully", "success");

  // Reset button after 2 seconds
  setTimeout(function () {
    saveBtn.html("Save Changes");
    saveBtn.prop("disabled", false);
  }, 2000);

  // Clear password fields
  $("#current-password").val("");
  $("#new-password").val("");
  $("#confirm-password").val("");
  updatePasswordStrength("Not set", "");
}

function showToast(message, type = "info") {
  // Simple toast implementation, you can use a more sophisticated one if available
  const toast = $(`<div class="toast ${type}-toast">${message}</div>`);
  $("body").append(toast);

  setTimeout(function () {
    toast.addClass("show");

    setTimeout(function () {
      toast.removeClass("show");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }, 100);
}

// Initialize the account settings page when document is ready
$(document).ready(function () {
  loadUserData();
  setupEventListeners();
  setupPasswordStrengthMeter();
  setupTabNavigation();
});
