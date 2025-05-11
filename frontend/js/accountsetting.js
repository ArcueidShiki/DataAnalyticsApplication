import { mockUser } from "./mockdata.js";
import Http from "./http.js";

export default class AccountSettingCard {
  formData = null;
  static instance = null;
  modalDialog = null;
  constructor() {
    if (AccountSettingCard.instance) {
      console.log(
        "AccountSettingCard instance already exists. Returning the existing instance."
      );
      return AccountSettingCard.instance;
    }
    AccountSettingCard.instance = this;
    this.createAccountSettingsModal();
  }

  static getInstance() {
    if (!AccountSettingCard.instance) {
      AccountSettingCard.instance = new AccountSettingCard();
    }
    return AccountSettingCard.instance;
  }

  showDialog() {
    $("#account-settings-modal").addClass("show");
    $(".modal-main-content").addClass("show");
  }

  createAccountSettingsModal() {
    if (!this.modalDialog) {
      this.modalDialog = $(
        '<div id="account-settings-modal" class="account-settings-modal"></div>'
      );
      $.get("accountsetting.html", (content) => {
        let modalContent = $('<div class="modal-main-content"></div>').html(
          content
        );
        this.modalDialog.append(modalContent);
        const closeButton = $('<span class="modal-close">&times;</span>');
        modalContent.prepend(closeButton);
        $("body").append(this.modalDialog);
        this.modalDialog.addClass("show");
        setTimeout(() => {
          $(".modal-close").on("click", () => {
            $("#account-settings-modal").removeClass("show");
            $(".modal-main-content").removeClass("show");
          });
          this.setupEventListeners();
          this.loadUserData();
          this.setupTabNavigation();
          this.setupPasswordStrengthMeter();
        }, 0);
      });
    }
  }

  setupTabNavigation() {
    $(".tab-button").on("click", function () {
      $(".tab-button").removeClass("active");
      $(".account-setting-tab-content").removeClass("active");
      $(this).addClass("active");
      const tabId = $(this).data("tab");
      console.log("Tab ID:", tabId);
      $(`#${tabId}`).addClass("active");
    });
  }

  loadUserData() {
    let user = JSON.parse(localStorage.getItem("userInfo"));
    const img_url = user ? `${Http.baseUrl}/${user.profile_img}` : "assets/user.jpeg";
    user = user ? user : mockUser;
    console.log("User data loaded:", user);
    $("#fullname").val(user.username);
    $("#email").val(user.email);
    $("#phone").val(user.phone);
    $("#birthdate").val(user.date_of_birth);
    $("#profile-avatar").attr("src", img_url);
    $("#email-notifications").prop("checked", user.notifications.email);
    $("#push-notifications").prop("checked", user.notifications.push);
    $("#market-alerts").prop("checked", user.notifications.market);
    $("#newsletter").prop("checked", user.notifications.newsletter);
  }

  setupEventListeners() {
    $("#avatar-upload").on("change", (event) => {
      this.handleAvatarUpload(event);
    });
    $(".avatar-container").on("click", () => {
      $("#avatar-upload").click();
    });
    $("#avatar-upload").on("click", (event) => {
      console.log("Avatar upload clicked");
    });
    // $("#save-settings").on("click", this.showConfirmationModal);
    $(".cancel-btn").on("click", () => {
      confirm("Discard changes?");
    });
    $(".save-btn").on("click", () => {
      confirm("Save changes?");
    });

    $(".close-modal").on("click", this.showConfirmationModal);
    $("#modal-cancel").on("click", this.showConfirmationModal);
    $("#modal-confirm").on("click", this.saveSettings);
  }

  setupPasswordStrengthMeter() {
    $("#new-password").on("input", (e) => {
      const password = e.target.value;
      if (!password) {
        this.updatePasswordStrength("Not set", "");
        return;
      }

      const strength = this.calculatePasswordStrength(password);
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

      this.updatePasswordStrength(strengthText, strengthClass);
    });
  }

  calculatePasswordStrength(password) {
    let score = 0;
    // if (password.length >= 8) score += 25;
    // if (password.length >= 12) score += 15;
    // if (/[A-Z]/.test(password)) score += 10;
    // if (/[a-z]/.test(password)) score += 10;
    // if (/[0-9]/.test(password)) score += 10;
    // if (/[^A-Za-z0-9]/.test(password)) score += 15;
    // if (/[A-Z].*[A-Z]/.test(password)) score += 5;
    // if (/[a-z].*[a-z]/.test(password)) score += 5;
    // if (/[0-9].*[0-9]/.test(password)) score += 5;

    return Math.min(100, score);
  }

  updatePasswordStrength(text, className) {
    $(".strength-text").text(text);
    $(".strength-meter")
      .removeClass("weak medium strong very-strong")
      .addClass(className);
  }

  handleAvatarUpload(event) {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }
    this.formData = new FormData();
    this.formData.append("file", file);
    Http.formSubmit("/auth/upload/img", this.formData)
    .then((response) => {
      let user = JSON.parse(localStorage.getItem("userInfo"));
      user.profile_img = response.image_url;
      $("#profile-avatar").attr("src", `${Http.baseUrl}/${response.image_url}`);
      localStorage.setItem("userInfo", JSON.stringify(user));
    })
    const reader = new FileReader();
    reader.onload = (e) => {
      $("#profile-avatar").attr("src", e.target.result);
    };
    reader.readAsDataURL(file);
  }
  validateForm() {
    const fullname = $("#fullname").val().trim();
    const email = $("#email").val().trim();
    const currentPassword = $("#current-password").val();
    const newPassword = $("#new-password").val();
    const confirmPassword = $("#confirm-password").val();

    if (!fullname) {
      alert("Full name is required");
      return false;
    }

    if (!email) {
      alert("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

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

  showConfirmationModal() {
    if (!this.validateForm()) return;
    $("#confirmation-modal").addClass("show");
  }

  hideConfirmationModal() {
    $("#confirmation-modal").removeClass("show");
  }



  saveSettings() {
    this.hideConfirmationModal();

    this.formData = {
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

    console.log("Saving settings:", this.formData);

    this.showSavingIndicator();

    setTimeout(() => {
      this.handleSaveSuccess({
        success: true,
        message: "Settings updated successfully",
      });
    }, 1000);
  }

  showSavingIndicator() {
    const saveBtn = $("#save-settings");
    saveBtn.prop("disabled", true);
    saveBtn.html('<i class="fas fa-spinner fa-spin"></i> Saving...');
  }

  handleSaveSuccess(response) {
    const saveBtn = $("#save-settings");
    saveBtn.html('<i class="fas fa-check"></i> Saved');

    this.showToast("Settings updated successfully", "success");

    setTimeout(() => {
      saveBtn.html("Save Changes");
      saveBtn.prop("disabled", false);
    }, 2000);

    $("#current-password").val("");
    $("#new-password").val("");
    $("#confirm-password").val("");
    this.updatePasswordStrength("Not set", "");
  }

  showToast(message, type = "info") {
    const toast = $(`<div class="toast ${type}-toast">${message}</div>`);
    $("body").append(toast);

    setTimeout(() => {
      toast.addClass("show");

      setTimeout(() => {
        toast.removeClass("show");
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }, 100);
  }
}
