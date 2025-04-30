/**
 * sidebar setting JS
 */

// retrieve the current page name
function getCurrentPage() {
  const path = window.location.pathname;
  const pageName = path.split("/").pop().split(".")[0];
  return pageName || "watchlist";
}

// retrieve the current stock symbol from URL parameters
// function getCurrentSymbol() {
//   const urlParams = new URLSearchParams(window.location.search);
//   return urlParams.get("symbol") || "AAPL";
// }

// set to highlight the current menu item
function setupMenuItems() {
  console.log("setting menu item...");

  const currentPage = getCurrentPage();
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    const spanElement = item.querySelector("span");

    const menuText = spanElement.textContent.trim().toLowerCase();
    const menuTextNoSpace = menuText.replace(/\s+/g, "");

    // highlight the current menu item
    if (
      currentPage.includes(menuTextNoSpace) ||
      menuTextNoSpace.includes(currentPage)
    ) {
      item.classList.add("active");
      console.log("menu item has been active:", menuText);
    }

    // add click event to each menu item
    item.addEventListener("click", () => {
      const menuName = spanElement.textContent.trim();
      console.log("clicking menu:", menuName);

      switch (menuName.toLowerCase()) {
        case "watchlist":
          window.location.href = "../watchlist.html";
          break;
        case "my asset":
          window.location.href = "../myasset.html";
          break;
        case "top chart":
          window.location.href = "../analysis.html";
          break;
        case "crypto":
          window.location.href = "../crypto.html";
          break;
        case "contact":
          window.location.href = "../chat.html";
          break;
        case "account setting":
          window.location.href = "../accountsetting.html";
          break;
        case "setting":
          window.location.href = "../settings.html";
          break;
        case "help center":
          window.location.href = "../help.html";
          break;
        case "logout":
          handleLogout();
          break;
        default:
          console.warn(`undefined menu item: ${menuName}`);
          break;
      }
    });
  });
}

// setup the account toggle functionality
function setupAccountToggle() {
  const accountToggleButton = document.getElementById("account-toggle-button");
  const accountSection = document.getElementById("account-section");
  const accountArrow = document.querySelector(".account-arrow");
  const profileToggle = document.getElementById("profile-toggle");

  // Function to toggle account section
  function toggleAccountSection() {
    if (accountSection.style.display === "none") {
      accountSection.style.display = "block";
      accountArrow.classList.remove("expanded");
    } else {
      accountSection.style.display = "none";
      accountArrow.classList.add("expanded");
    }
  }

  // Toggle account section when clicking the toggle button
  if (accountToggleButton) {
    accountToggleButton.addEventListener("click", toggleAccountSection);
  }

  // Toggle account section when clicking the profile
  if (profileToggle) {
    profileToggle.addEventListener("click", toggleAccountSection);
  }
}

// setup the logout functionality
function handleLogout() {
  if (confirm("Are you sure to logout?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "../login.html";
    console.log("User logged out");
  } else {
    console.log("cancel logout");
  }
}

function initSidebar() {
  setupMenuItems();
  setupAccountToggle();
}

/**
 * Initialize the sidebar and other components
 */
function initSidepage() {
  console.log("Page loading...");

  initSidebar();

  console.log("Page loaded");
}

// Initialize the sidebar when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initSidepage);
